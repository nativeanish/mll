import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { ExternalLink, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { uuidv7 } from "uuidv7";

interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
}
interface LocalImageMeta {
  id: string;
  url: string; // object URL
  name: string;
  title: string; // user provided title
  size: number;
  type: string;
}
function BlockForImage({ isEdit }: Props) {
  const [galleryTitle, setGalleryTitle] = useState("Image Gallery");
  const [images, setImages] = useState<LocalImageMeta[]>([]);
  const dragItem = useRef<string | null>(null);

  const onSelectImages = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      if (!list) return;
      const metas: LocalImageMeta[] = [];
      for (let i = 0; i < list.length; i++) {
        const file = list.item(i)!;
        if (!file.type.startsWith("image/")) continue;
        const url = URL.createObjectURL(file);
        metas.push({
          id: uuidv7(),
          url,
          name: file.name,
          title: file.name.replace(/\.[^.]+$/, ""),
          size: file.size,
          type: file.type,
        });
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={img.id}
                      className="group relative rounded-md overflow-hidden border bg-muted/20 backdrop-blur-sm flex flex-col"
                      draggable
                      onDragStart={onDragStart(img.id)}
                      onDragOver={onDragOver(img.id)}
                      onDragEnd={onDragEnd}
                    >
                      <div className="aspect-video w-full relative bg-black/5">
                        <img
                          src={img.url}
                          alt={img.title || img.name}
                          className="h-full w-full object-cover"
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
                      <Input
                        value={img.title}
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
                        className="rounded-none border-0 border-t bg-background/70 text-xs"
                      />
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
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default BlockForImage;
