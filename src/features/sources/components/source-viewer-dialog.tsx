"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useSources } from "@/providers/sources-provider";
import { StockHolding, StockSource } from "@/types";
import { toast } from "sonner";
import {
  FileText,
  Link as LinkIcon,
  StickyNote,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";

interface SourceViewerDialogProps {
  stock: StockHolding;
  open: boolean;
  onOpenChange: (open: boolean) => void; //?
}
export function SourceViewerDialog({
  stock,
  open,
  onOpenChange,
}: SourceViewerDialogProps) {
  const { user } = useAuth();
  const { sourcesService } = useSources();
  const [sources, setSources] = useState<StockSource[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSources = useCallback(async () => {
    if (!user || !stock) return;
    setLoading(true);
    try {
      const data = await sourcesService.getSourcesForStock(
        user.uid,
        stock.tickerSymbol
      );
      setSources(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load sources");
    } finally {
      setLoading(false);
    }
  }, [user, stock, sourcesService]);

  useEffect(() => {
    if (open) {
      loadSources();
    }
  }, [open, loadSources]);

  const handleDelete = async (sourceId: string) => {
    if (!confirm("Are you sure you want to delete this source?")) return;

    try {
      await sourcesService.deleteSource(sourceId);
      toast.success("Source deleted");
      // Refresh the list
      loadSources();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete source");
    }
  };

  // Helper to render content based on type
  const renderContent = (source: StockSource) => {
    switch (source.type) {
      case "url":
        return (
          <a
            href={source.content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center gap-1 truncate"
          >
            {source.content}
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      case "file":
        return (
          <a
            href={source.content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center gap-1 truncate"
          >
            View Document
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      case "note":
      default:
        return (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {source.content}
          </p>
        );
    }
  };

  // Helper for Icon
  const getIcon = (type: StockSource["type"]) => {
    switch (type) {
      case "url":
        return <LinkIcon className="h-4 w-4" />;
      case "file":
        return <FileText className="h-4 w-4" />;
      default:
        return <StickyNote className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Sources for {stock.tickerSymbol}</DialogTitle>
          <DialogDescription>
            Research, notes, and documents attached to this holding.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-4 pr-2">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : sources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              No sources found. Add one via the Actions menu.
            </div>
          ) : (
            sources.map((source) => (
              <div
                key={source.id}
                className="flex gap-4 p-4 border rounded-lg items-start group hover:bg-muted/50 transition-colors"
              >
                <div className="mt-1 text-muted-foreground">
                  {getIcon(source.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium uppercase text-muted-foreground">
                      {source.type}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        source.visibility === "public"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {source.visibility}
                    </span>
                  </div>

                  {renderContent(source)}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(source.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
