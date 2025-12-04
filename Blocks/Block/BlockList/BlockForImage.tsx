import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Copy, Edit, ExternalLink, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { uuidv7 } from "uuidv7";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/components/ui/input-group";
import { Textarea } from "@/src/components/ui/textarea";
import { toast } from "sonner";
import { useBlockStore } from "@/store/useBlockStore";
interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
  uuid: string;
}
interface LocalImageMeta {
  id: string;
  url: string; // object URL
  name: string;
  title: string; // user provided title
  size: number;
  type: string;
  base64?: string; // base64 encoded image
}
function BlockForImage({ isEdit, uuid }: Props) {
  const [galleryTitle, setGalleryTitle] = useState("Image Gallery");
  const [images, setImages] = useState<LocalImageMeta[]>([]);
  const updateBlock = useBlockStore((state) => state.updateBlockData);
  const dragItem = useRef<string | null>(null);
  const [description, setDescription] = useState("");

  const onSelectImages = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      if (!list) return;
      const metas: LocalImageMeta[] = [];

      for (let i = 0; i < list.length; i++) {
        const file = list.item(i)!;

        // Basic file validation
        if (!file.type.startsWith("image/")) {
          console.warn(`Non-image file skipped: ${file.name}`);
          toast.warning(`Non-image file skipped: ${file.name}`);
          continue;
        }

        // Check if file is accessible and not corrupted
        if (file.size === 0) {
          console.warn(`Empty file skipped: ${file.name}`);
          toast.warning(`Empty file skipped: ${file.name}`);
          continue;
        }

        // Try to read the file to ensure it's accessible
        try {
          const arrayBuffer = await file.arrayBuffer();
          if (arrayBuffer.byteLength === 0) {
            console.warn(`Corrupted file skipped: ${file.name}`);
            toast.warning(`Corrupted file skipped: ${file.name}`);
            continue;
          }
        } catch (error) {
          console.warn(`Cannot access file: ${file.name}`, error);
          toast.error(`Cannot access file: ${file.name}`);
          continue;
        }

        // Create object URL and validate image can be loaded
        const url = URL.createObjectURL(file);
        const isValidImage = await new Promise<boolean>((resolve) => {
          const img = new Image();
          img.onload = () => {
            resolve(true);
          };
          img.onerror = () => {
            URL.revokeObjectURL(url); // Clean up if invalid
            resolve(false);
          };
          img.src = url;
        });

        if (!isValidImage) {
          console.warn(`Invalid image file: ${file.name}`);
          toast.warning(`Invalid image file skipped: ${file.name}`);
          continue;
        }

        // Read file as base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        metas.push({
          id: uuidv7(),
          url,
          name: file.name,
          title: file.name.replace(/\.[^.]+$/, ""),
          size: file.size,
          type: file.type,
          base64,
        });
      }

      if (metas.length > 0) {
        toast.success(`${metas.length} image(s) added successfully`);
      }

      setImages((prev) => [...prev, ...metas]);
      e.target.value = "";
    },
    []
  );
  const onDragStart = (id: string) => (e: React.DragEvent) => {
    dragItem.current = id;
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (overId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragItem.current === overId) return;
    setImages((prev) => {
      const fromIndex = prev.findIndex((i) => i.id === dragItem.current);
      const toIndex = prev.findIndex((i) => i.id === overId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const clone = [...prev];
      const [moved] = clone.splice(fromIndex, 1);
      clone.splice(toIndex, 0, moved);
      return clone;
    });
  };
  const onDragEnd = () => {
    dragItem.current = null;
  };
  const removeImage = (id: string) => {
    setImages((prev) => {
      const found = prev.find((i) => i.id === id);
      if (found && found.url.startsWith("blob:"))
        URL.revokeObjectURL(found.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  useEffect(() => {
    if (!isEdit) {
      updateBlock(uuid, {
        galleryTitle,
        description,
        images,
      });
    }
  }, [isEdit, galleryTitle, description, images, updateBlock, uuid]);
  return (
    <div>
      {isEdit ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
              //  htmlFor={`gallery-title-${data.id}`}
              >
                Gallery Title
              </Label>
              <Input
                // id={`gallery-title-${data.id}`}
                placeholder="Enter gallery title"
                value={galleryTitle}
                onChange={(e) => setGalleryTitle(e.target.value)}
                className="bg-muted/40"
              />
            </div>
            <div className="space-y-2">
              <Label
              // htmlFor={`image-input-${data.id}`}
              >
                Add Images
              </Label>
              <Input
                // id={`image-input-${data.id}`}
                type="file"
                accept="image/*"
                multiple
                onChange={onSelectImages}
                className="bg-muted/40"
              />
              <p className="text-[10px] text-muted-foreground">
                Supported: png, jpg, jpeg, webp, gif (stored locally).
              </p>
            </div>
          </div>
          {/* Drag & Drop helper */}
          <div>
            {images.length > 1 ? (
              <div className="space-y-4">
                <p className="text-[10px] text-muted-foreground">
                  Drag images to reorder.
                </p>
                <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
                  {images.map((img, idx) => (
                    <div
                      key={img.id}
                      className="group relative rounded-md overflow-hidden border bg-muted/20 backdrop-blur-sm flex flex-col break-inside-avoid mb-3"
                      draggable
                      onDragStart={onDragStart(img.id)}
                      onDragOver={onDragOver(img.id)}
                      onDragEnd={onDragEnd}
                    >
                      <div className="w-full relative bg-black/5">
                        <img
                          src={img.url}
                          alt={img.title || img.name}
                          className="w-full h-auto object-cover"
                          draggable={false}
                        />
                        <div className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-white">
                          {idx + 1}
                        </div>
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 bg-black/40 text-white hover:bg-black/60"
                            onClick={() => removeImage(img.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 bg-black/40 text-white hover:bg-black/60"
                            onClick={() => window.open(img.url, "_blank")}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <InputGroup>
                        <InputGroupInput
                          id={`image-title-${img.id}`}
                          placeholder="Image title"
                          onChange={(e) =>
                            setImages((prev) =>
                              prev.map((p) =>
                                p.id === img.id
                                  ? { ...p, title: e.target.value }
                                  : p
                              )
                            )
                          }
                          value={img.title}
                        />
                        <InputGroupAddon>
                          <Edit className="size-4" />
                        </InputGroupAddon>
                      </InputGroup>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="col-span-full text-sm dark:text-muted-foreground italic">
                No images yet.
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label
            // htmlFor={`gallery-desc-${data.id}`}
            >
              Description
            </Label>
            <Textarea
              // id={`gallery-desc-${data.id}`}
              placeholder="Describe this gallery..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-20 bg-muted/40"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {images.length === 0 ? (
            <div className="col-span-full p-4 rounded-lg bg-muted/30 text-sm text-muted-foreground italic">
              No images added.
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group relative rounded-md overflow-hidden border bg-muted/20 break-inside-avoid mb-3"
                >
                  <div className="w-full relative">
                    <img
                      src={img.url}
                      alt={img.title || img.name}
                      className="w-full h-auto object-cover"
                      draggable={false}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-1.5">
                      <p className="text-[11px] text-white font-medium truncate">
                        {img.title || img.name}
                      </p>
                    </div>
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 bg-black/40 text-white hover:bg-black/60"
                        onClick={() => {
                          navigator.clipboard.writeText(img.url);
                          toast.success("Image URL copied to clipboard");
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 bg-black/40 text-white hover:bg-black/60"
                        onClick={() => {
                          window.open(img.url, "_blank");
                          toast.success("Image opened in new tab");
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div>
            {galleryTitle && (
              <div>
                <span className="text-xs dark:text-muted-foreground">
                  Title:
                </span>
                <p className="text-sm dark:text-foreground">{galleryTitle}</p>
              </div>
            )}
            {description && (
              <div>
                <span className="text-xs dark:text-muted-foreground">
                  Description (Optional):
                </span>
                <p className="text-sm dark:text-foreground">{description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BlockForImage;
