"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { useSources } from "@/providers/sources-provider";
import { StockHolding } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddSourceDialogProps {
  stock: StockHolding;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// // Define schemas for each type
// const noteSchema = z.object({
//   content: z.string().min(1, "Note cannot be empty"),
// });
// const urlSchema = z.object({ content: z.string().url("Must be a valid URL") });
// // File schema is tricky, we handle file validation manually in the component

export function AddSourceDialog({
  stock,
  open,
  onOpenChange,
}: AddSourceDialogProps) {
  const { user } = useAuth();
  const { sourcesService, storageService } = useSources();
  const [activeTab, setActiveTab] = useState<"note" | "file" | "url">("note");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // We use one form instance, but we'll manually validate based on tab
  const form = useForm({
    defaultValues: {
      noteContent: "",
      urlContent: "",
    },
  });

  const onSubmit = async (values: {
    noteContent?: string;
    urlContent?: string;
  }) => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      let finalContent = "";
      const type = activeTab;

      // 1. Handle NOTE
      if (activeTab === "note") {
        // Validate manually or via schema
        if (!values.noteContent) {
          toast.error("Note cannot be empty");
          setIsSubmitting(false);
          return;
        }
        finalContent = values.noteContent;
      }

      // 2. Handle URL
      else if (activeTab === "url") {
        // Simple URL validation
        try {
          z.string().url().parse(values.urlContent);
          finalContent = values.urlContent || "";
        } catch {
          toast.error("Please enter a valid URL");
          setIsSubmitting(false);
          return;
        }
      }

      // 3. Handle FILE
      else if (activeTab === "file") {
        if (!selectedFile) {
          toast.error("Please select a file");
          setIsSubmitting(false);
          return;
        }
        const path = `sources/${user.uid}/${stock.tickerSymbol}/${selectedFile.name}`;
        finalContent = await storageService.uploadFile(selectedFile, path);
      }

      // 4. Save to Database
      await sourcesService.addSource({
        userId: user.uid,
        tickerSymbol: stock.tickerSymbol,
        type: type,
        content: finalContent, // <--- Use the resolved content
        visibility: "private",
        status: "approved",
      });

      toast.success("Source added successfully");
      onOpenChange(false);
      form.reset();
      setSelectedFile(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add source");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Source for {stock.tickerSymbol}</DialogTitle>
          <DialogDescription>
            Attach a note, file, or link to this stock holding.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "note" | "file" | "url")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="note">Note</TabsTrigger>
            <TabsTrigger value="file">File</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-4"
            >
              {/* --- NOTE TAB --- */}
              <TabsContent value="note">
                <FormField
                  control={form.control}
                  name="noteContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Research notes, strategy..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* --- FILE TAB --- */}
              <TabsContent value="file">
                <FormItem>
                  <FormLabel>Upload Document (PDF, DOCX)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                    />
                  </FormControl>
                </FormItem>
              </TabsContent>

              {/* --- URL TAB --- */}
              <TabsContent value="url">
                <FormField
                  control={form.control}
                  name="urlContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Source"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
