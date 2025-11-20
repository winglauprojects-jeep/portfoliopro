"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/providers/auth-provider";
import { usePortfolio } from "@/providers/portfolio-provider";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner"; //

const formSchema = z.object({
  tickerSymbol: z.string().min(1, "Stock symbol is required"),
  accountName: z.string().min(1, "Account name is required"),
  shareCount: z.coerce.number().min(0.0001, "Must be greater than 0"),
  averagePurchasePrice: z.coerce.number().min(0, "Cannot be negative"),
});

export default function AddStockForm() {
  const { user } = useAuth();
  const { stockService, accounts } = usePortfolio();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false); // <-- State for the popover

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tickerSymbol: "",
      accountName: "Brokerage",
      shareCount: 0,
      averagePurchasePrice: 0,
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast.error("You must be signed in to add stocks.");
      return;
    }
    setIsSubmitting(true);
    try {
      await stockService.addStock({
        userId: user.uid,
        ...values,
      });
      toast.success("Stock added to your portfolio!");
      form.reset();
    } catch (error) {
      console.error("Error adding stock:", error);
      toast.error("Failed to add stock. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Stock</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tickerSymbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Symbol</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., AAPL"
                      {...field}
                      disabled={isSubmitting}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shareCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shares</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        {...field}
                        value={field.value as number}
                        onChange={(e) => {
                          const value = e.target.value;
                          // If the input is empty, pass undefined so Zod catches it as "Required"
                          // Otherwise, parse it as a float
                          field.onChange(
                            value === "" ? undefined : parseFloat(value)
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="averagePurchasePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avg. Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        {...field}
                        value={field.value as number}
                        onChange={(e) => {
                          const value = e.target.value;
                          // If the input is empty, pass undefined so Zod catches it as "Required"
                          // Otherwise, parse it as a float
                          field.onChange(
                            value === "" ? undefined : parseFloat(value)
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>

                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? field.value // Show whatever is selected/typed
                            : "Select or create account"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        {/* 3. Track typing with onValueChange */}
                        <CommandInput
                          placeholder="Search or create..."
                          onValueChange={setSearchQuery}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {/* 4. If no match, show "Create" option */}
                            <div
                              className="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer hover:bg-accent"
                              onClick={() => {
                                form.setValue("accountName", searchQuery);
                                setOpen(false);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                              Create "{searchQuery}"
                            </div>
                          </CommandEmpty>

                          <CommandGroup heading="Existing Accounts">
                            {accounts.map((account) => (
                              <CommandItem
                                value={account}
                                key={account}
                                onSelect={() => {
                                  form.setValue("accountName", account);
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    account === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {account}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add to Portfolio"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
