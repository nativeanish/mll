import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { useBlockStore } from "@/store/useBlockStore";
import { Copy, ExternalLink } from "lucide-react";
import React, { useEffect } from "react";
import { toast } from "sonner";

interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
  uuid: string;
  alt: "Twitter-Post" | "Farcaster-Post" | "Reddit-Post" | "Bluesky-Post";
  placeholder?: string;
}
const POST_EXAMPLES = {
  "Twitter-Post": "https://x.com/aoTheComputer/status/2021694557423796248",
  "Reddit-Post":
    "https://www.reddit.com/r/Arweave/comments/1qz58k7/time_to_shut_up_and_build/",
  "Farcaster-Post": "https://farcaster.xyz/jonnyringo.eth/0xbef66a87",
  "Bluesky-Post": "https://bsky.app/profile/hackernoon.com/post/3lu5d6yrser25",
} as const;

function isValidPostUrlByAlt(url: string, alt: Props["alt"]) {
  try {
    const parsed = new URL(url);
    if (!/^https?:$/.test(parsed.protocol)) return false;

    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const path = parsed.pathname;

    if (alt === "Twitter-Post") {
      if (host !== "x.com" && host !== "twitter.com") return false;
      return /^\/[^/]+\/status\/\d+\/?$/.test(path);
    }

    if (alt === "Reddit-Post") {
      if (host !== "reddit.com" && host !== "www.reddit.com") return false;
      return /^\/r\/[^/]+\/comments\/[^/]+\/[^/]*\/?$/.test(path);
    }

    if (alt === "Farcaster-Post") {
      if (host !== "farcaster.xyz") return false;
      return /^\/[^/]+\/0x[a-fA-F0-9]+\/?$/.test(path);
    }

    if (alt === "Bluesky-Post") {
      if (host !== "bsky.app") return false;
      return /^\/profile\/[^/]+\/post\/[^/]+\/?$/.test(path);
    }

    return false;
  } catch {
    return false;
  }
}

function BlockForSocialPost({
  isEdit,
  setError: SetError,
  uuid,
  alt,
  placeholder,
}: Props) {
  const [url, setUrl] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [localError, setLocalError] = React.useState(false);
  const exampleUrl = POST_EXAMPLES[alt];
  const updateBlock = useBlockStore((state) => state.updateBlockData);
  useEffect(() => {
    if (!isEdit)
      updateBlock(uuid, {
        url,
        description,
      });
  }, [url, description, updateBlock, uuid, isEdit]);
  React.useEffect(() => {
    if (url && url.length > 0) {
      if (!isValidPostUrlByAlt(url, alt)) {
        setLocalError(true);
        SetError(true);
        return;
      }
    }
    setLocalError(false);
    SetError(false);
  }, [url, alt, SetError]);
  return (
    <div>
      {isEdit ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">URL/Link</Label>
            <Input
              placeholder={placeholder || exampleUrl}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-muted/40"
            />
            <p className="text-xs text-muted-foreground">
              Example: {exampleUrl}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Custom Description (Optional)
            </Label>
            <Textarea
              placeholder="Add a custom description for this block..."
              className="min-h-20 bg-muted/40"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {localError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              Please enter a valid post URL for this platform.
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
        </div>
      )}
    </div>
  );
}

export default BlockForSocialPost;
