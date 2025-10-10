import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Copy, ExternalLink } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
}
function BlockForCommunity({ isEdit, setError: SetError }: Props) {
  const [url, setUrl] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState(false);
  const [title, setTitle] = React.useState("");
  React.useEffect(() => {
    if (url && url.length > 0) {
      const urlPattern =
        /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;

      if (!urlPattern.test(url)) {
        setError(true);
        SetError(true);
        return;
      }
    }
    setError(false);
    SetError(false);
  }, [url, SetError]);
  return (
    <div>
      {isEdit ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                //   htmlFor={`title-${data.id}`}
                className="text-sm font-medium"
              >
                Display Title
              </Label>
              <Input
                //   id={`title-${data.id}`}
                placeholder={`Join Reddit Community`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-muted/40"
              />
            </div>
            <div className="space-y-2">
              <Label
                //   htmlFor={`url-${data.id}`}
                className="text-sm font-medium"
              >
                URL/Link
              </Label>
              <Input
                //   id={`url-${data.id}`}
                placeholder={`Enter Twitter URL`}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-muted/40"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label
              //   htmlFor={`desc-${data.id}`}
              className="text-sm font-medium"
            >
              Custom Description (Optional)
            </Label>
            <Textarea
              //   id={`desc-${data.id}`}
              placeholder="Add a custom description for this block..."
              className="min-h-20 bg-muted/40"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
          <div className="flex items-center gap-2 p-3 dark:bg-muted/30 bg-black/20 rounded-lg">
            <div className="flex-1 min-w-0">
              {url ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm dark:text-muted-foreground truncate">
                    {url}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(url || "");
                      toast.success("URL copied to clipboard");
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground italic">
                  No URL configured
                </span>
              )}
            </div>
            {url && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => {
                  window.open(url, "_blank");
                  toast.success("Opening URL...");
                }}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
          {title && (
            <div>
              <span className="text-xs dark:text-muted-foreground">Title:</span>
              <p className="text-sm dark:text-foreground">{title}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BlockForCommunity;
