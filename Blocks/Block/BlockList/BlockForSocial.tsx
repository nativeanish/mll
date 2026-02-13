import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { useBlockStore } from "@/store/useBlockStore";
import type social from "@/utils/block/social";
import { Copy, ExternalLink } from "lucide-react";
import React from "react";
import { toast } from "sonner";

type SocialAlt = (typeof social)[number]["alt"];
type BlockForSocialAlt =
  | SocialAlt
  | "Medium-Post"
  | "Paragraph-Post"
  | "Youtube-Video"
  | "Twitch-Video"
  | "Odysee-Video";
interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
  alt: BlockForSocialAlt;
  placeholder?: string;
  uuid: string;
}

const SPECIAL_URL_CONFIG: Partial<
  Record<
    BlockForSocialAlt,
    {
      placeholder: string;
      pattern: RegExp;
      label: string;
    }
  >
> = {
  "Medium-Post": {
    placeholder:
      "https://medium.com/ar-io/5-reasons-to-develop-with-permanent-data-3b7fa2fb4c6c",
    pattern: /^https?:\/\/(www\.)?medium\.com\/.+/i,
    label: "Medium",
  },
  "Paragraph-Post": {
    placeholder:
      "https://paragraph.com/@afmedia/year-one-in-arweave-learnings-and-progress",
    pattern: /^https?:\/\/(www\.)?paragraph\.com\/.+/i,
    label: "Paragraph",
  },
  "Youtube-Video": {
    placeholder: "https://www.youtube.com/watch?v=3RIuwLYfzyQ",
    pattern: /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/i,
    label: "YouTube",
  },
  "Twitch-Video": {
    placeholder: "https://www.twitch.tv/videos/2634544292",
    pattern: /^https?:\/\/(www\.)?twitch\.tv\/videos\/\d+/i,
    label: "Twitch",
  },
  "Odysee-Video": {
    placeholder: "https://odysee.com/@AO:4/Berlin-Sam:7",
    pattern: /^https?:\/\/(www\.)?odysee\.com\/@[^/\s]+\/[^/\s]+$/i,
    label: "Odysee",
  },
};

function BlockForSocial({
  isEdit,
  setError: SetError,
  alt,
  placeholder,
  uuid,
}: Props) {
  const [url, setUrl] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(
    "Please enter a valid URL",
  );
  const updateBlockData = useBlockStore((state) => state.updateBlockData);
  const specialConfig = SPECIAL_URL_CONFIG[alt];
  const resolvedPlaceholder =
    placeholder ||
    specialConfig?.placeholder ||
    "https://example.com/your-profile";

  React.useEffect(() => {
    if (url && url.length > 0) {
      if (specialConfig) {
        if (!specialConfig.pattern.test(url)) {
          setErrorMessage(`Please enter a valid ${specialConfig.label} URL`);
          setError(true);
          SetError(true);
          return;
        }
      } else {
        const urlPattern =
          /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;
        if (!urlPattern.test(url)) {
          setErrorMessage(
            "Please enter a valid URL (must start with https://example.com or example.com)",
          );
          setError(true);
          SetError(true);
          return;
        }
      }
      try {
        const parsedUrl = new URL(
          url.startsWith("http") ? url : `https://${url}`,
        );
        if (!parsedUrl.hostname) {
          setErrorMessage("Please enter a valid URL");
          setError(true);
          SetError(true);
          return;
        }
      } catch {
        setErrorMessage("Please enter a valid URL");
        setError(true);
        SetError(true);
        return;
      }
    }
    setError(false);
    setErrorMessage("Please enter a valid URL");
    SetError(false);
  }, [url, SetError, specialConfig]);
  React.useEffect(() => {
    if (isEdit === false) {
      updateBlockData(uuid, {
        url,
        description,
      });
    }
  }, [isEdit, uuid, url, description, updateBlockData]);
  return (
    <div>
      {isEdit ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              //   htmlFor={`url-${data.id}`}
              className="text-sm font-medium"
            >
              URL/Link
            </Label>
            <Input
              //   id={`url-${data.id}`}
              placeholder={resolvedPlaceholder}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-muted/40"
            />
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
              {errorMessage}
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
          {description && (
            <div>
              <span className="text-xs dark:text-muted-foreground">
                Description (optional):
              </span>
              <p className="text-sm dark:text-foreground">{description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BlockForSocial;
