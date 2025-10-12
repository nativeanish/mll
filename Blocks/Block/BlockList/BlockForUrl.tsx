import { Label } from "@/src/components/ui/label";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { ExternalLink, Link2, Upload, X } from "lucide-react";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { toast } from "sonner";

interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
}
type DisplayType = "button" | "image";
interface UrlBlockData {
  displayType: DisplayType;
  url: string;
  description: string;
  // Button specific
  buttonText: string;
  // Image specific
  imageUrl: string;
  imageText: string;
}
function BlockForUrl({ isEdit, setError: SetError }: Props) {
  const [blockData, setBlockData] = useState<UrlBlockData>({
    displayType: "button",
    url: "",
    description: "",
    buttonText: "",
    imageUrl: "",
    imageText: "",
  });
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    if (isEdit && blockData.url && blockData.url.length > 0) {
      const urlPattern =
        /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;
      if (!urlPattern.test(blockData.url)) {
        setError(true);
        SetError(true);
        return;
      }
    }
    SetError(false);
  }, [blockData.url, isEdit, SetError]);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      return;
    }

    // Clean up previous object URL
    if (blockData.imageUrl && blockData.imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(blockData.imageUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setBlockData((prev) => ({
      ...prev,
      imageUrl: objectUrl,
      imageText: prev.imageText || file.name.replace(/\.[^.]+$/, ""),
    }));

    // Reset input
    e.target.value = "";
  };

  const removeImage = () => {
    if (blockData.imageUrl && blockData.imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(blockData.imageUrl);
    }
    setBlockData((prev) => ({
      ...prev,
      imageUrl: "",
      imageText: "",
    }));
  };
  return (
    <div>
      {isEdit ? (
        <div className="space-y-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Display Type</Label>
            <Select
              value={blockData.displayType}
              onValueChange={(value: DisplayType) =>
                setBlockData((prev) => ({ ...prev, displayType: value }))
              }
            >
              <SelectTrigger className="bg-muted/40">
                <SelectValue placeholder="Select display type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="button">Button</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              //   htmlFor={`url-${data.id}`}
              className="text-sm font-medium"
            >
              URL
            </Label>
            <Input
              //   id={`url-${data.id}`}
              placeholder="https://example.com"
              value={blockData.url}
              onChange={(e) =>
                setBlockData((prev) => ({ ...prev, url: e.target.value }))
              }
              className="bg-muted/40"
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              Please enter a valid URL (must start with http:// or https://)
            </div>
          )}
          {/* Button specific fields */}
          {blockData.displayType === "button" && (
            <div className="space-y-2">
              <Label
                //   htmlFor={`button-text-${data.id}`}
                className="text-sm font-medium"
              >
                Button Text
              </Label>
              <Input
                //   id={`button-text-${data.id}`}
                placeholder="Visit Link"
                value={blockData.buttonText}
                onChange={(e) =>
                  setBlockData((prev) => ({
                    ...prev,
                    buttonText: e.target.value,
                  }))
                }
                className="bg-muted/40"
              />
            </div>
          )}

          {/* Image specific fields */}
          {blockData.displayType === "image" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Image Upload</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="bg-muted/40"
                  />
                  {blockData.imageUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended: 16:9 aspect ratio for best results
                </p>
              </div>

              {blockData.imageUrl && (
                <div className="space-y-2">
                  <div className="aspect-video w-full max-w-sm rounded-lg overflow-hidden bg-muted">
                    <img
                      src={blockData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label
                  // htmlFor={`image-name-${data.id}`}
                  className="text-sm font-medium"
                >
                  Image Text
                </Label>
                <Input
                  // id={`image-name-${data.id}`}
                  placeholder="Enter image text"
                  value={blockData.imageText}
                  onChange={(e) =>
                    setBlockData((prev) => ({
                      ...prev,
                      imageText: e.target.value,
                    }))
                  }
                  className="bg-muted/40"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label
              // htmlFor={`desc-${data.id}`}
              className="text-sm font-medium"
            >
              Description
            </Label>
            <Textarea
              // id={`desc-${data.id}`}
              placeholder="Add a description for this link..."
              value={blockData.description}
              onChange={(e) =>
                setBlockData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="min-h-20 bg-muted/40"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {blockData.displayType === "button" ? (
            <div className="space-y-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="w-full"
                    onClick={() => {
                      toast.success("Opening link in a new tab");
                      return (
                        blockData.url && window.open(blockData.url, "_blank")
                      );
                    }}
                    disabled={!blockData.url}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    {blockData.buttonText || "Visit Link"}
                  </Button>
                </TooltipTrigger>
                {blockData.description && (
                  <TooltipContent>
                    <p>{blockData.description}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          ) : (
            <div className="space-y-3">
              {blockData.imageUrl ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="cursor-pointer group"
                      onClick={() => {
                        toast.success("Opening link in a new tab");
                        return (
                          blockData.url && window.open(blockData.url, "_blank")
                        );
                      }}
                    >
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted relative">
                        <img
                          src={blockData.imageUrl}
                          alt={blockData.imageText || "Link image"}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-black/60 backdrop-blur-sm rounded-full p-2">
                            <ExternalLink className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  {blockData.description && (
                    <TooltipContent>
                      <p>{blockData.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              ) : (
                <div className="aspect-video w-full rounded-lg bg-muted/30 flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No image uploaded
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          {blockData.description && blockData.description.length > 0 && (
            <div>
              <span className="text-xs dark:text-muted-foreground">
                Description (optional):
              </span>
              <p className="text-sm dark:text-foreground">
                {blockData.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BlockForUrl;
