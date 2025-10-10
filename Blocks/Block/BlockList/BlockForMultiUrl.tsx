import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
}
function BlockForMultiUrl({ isEdit, setError }: Props) {
  const [title, setTitle] = React.useState<string>("");
  const [urls, setUrls] = React.useState<string[]>([""]);
  const [description, setDescription] = React.useState<string>("");
  const [error, SetError] = React.useState<boolean>(false);
  const checkUrlandSave = (e: string) => {
    const urlPattern =
      /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;

    if (e && e.length > 0) {
      if (!urlPattern.test(e)) {
        setError(true);
        SetError(true);
        return;
      }
    }
    setError(false);
    SetError(false);
  };
  return (
    <div>
      {isEdit ? (
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  // htmlFor={`title-${data.id}`}
                  className="text-sm font-medium"
                >
                  Display Title
                </Label>
                <Input
                  // id={`title-${data.id}`}
                  placeholder={`Enter  title`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-muted/40"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Link Handle</Label>
                {/* Only show count here */}
                <div className="text-xs text-muted-foreground">
                  Links: {urls.filter((u) => u.trim()).length || 0}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {urls.map((u, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    // id={`url-${data.id}-${idx}`}
                    placeholder={
                      idx === 0 ? "Enter link" : "Enter another link"
                    }
                    value={u}
                    onChange={(e) => {
                      checkUrlandSave(e.target.value);
                      setUrls((prev) =>
                        prev.map((p, i) => (i === idx ? e.target.value : p))
                      );
                    }}
                    className="bg-muted/40 flex-1"
                  />
                  {idx > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() =>
                        setUrls((prev) => prev.filter((_, i) => i !== idx))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUrls((prev) => [...prev, ""])}
                  disabled={urls.some((u) => u.trim() === "")}
                >
                  Add another link
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label
              // htmlFor={`desc-${data.id}`}
              className="text-sm font-medium"
            >
              Custom Description (Tooltip)
            </Label>
            <Textarea
              // id={`desc-${data.id}`}
              placeholder="Add a custom description for this block..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-20 bg-muted/40"
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              Please enter a valid URL (must start with https://example.com or
              example.com)
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            {urls.length && urls.length > 0 && urls.some((e) => e !== "") ? (
              <div className="space-y-2">
                {urls.map((u, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-3 dark:bg-muted/30 bg-black/20 rounded-lg"
                  >
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className="text-sm dark:text-muted-foreground truncate">
                        {u}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => {
                          toast.success("Link copied to clipboard");
                          navigator.clipboard.writeText(u || "");
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => {
                        toast.success("Opening link in new tab");
                        window.open(u, "_blank");
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground italic">
                  No URL configured
                </span>
              </div>
            )}
          </div>

          {/* Custom title and description */}
          {(title || description) && (
            <div className="space-y-2">
              {title && (
                <div>
                  <span className="text-xs text-muted-foreground">Title:</span>
                  <p className="text-sm font-medium">{title}</p>
                </div>
              )}
              {description && (
                <div>
                  <span className="text-xs text-muted-foreground">
                    Description:
                  </span>
                  <p className="text-sm text-foreground">{description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BlockForMultiUrl;
