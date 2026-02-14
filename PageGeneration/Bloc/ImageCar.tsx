import type { BlockData } from "@/store/useBlockStore";
import getStringFields from "../utils/getStringFields";
import React from "react";

function ImageCar({ props }: { props: BlockData }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [lightbox, setLightbox] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const description = getStringFields(props.data, ["description"]);
  const images = props.data["images"] as Array<{
    base64: string;
    id: string;
    name: string;
    title: string;
    type: string;
  }>;

  const goTo = (index: number) => {
    if (index === currentIndex || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToPrevious = () => {
    goTo(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    goTo(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const openLightbox = () => {
    setLightbox(true);
    setCopied(false);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightbox(false);
    document.body.style.overflow = "";
  };

  const copyUrl = async () => {
    const url = images[currentIndex].base64;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = url;
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const downloadImage = () => {
    const url = images[currentIndex].base64;
    const name = images[currentIndex].name || "image";
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.target = "_blank";
      a.rel = "noopener";
      a.click();
    } catch {
      window.open(url, "_blank", "noopener");
    }
  };

  // Close lightbox on Escape
  React.useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, currentIndex]);

  if (!images || images.length === 0) return null;

  return (
    <div
      className="w-full"
      data-uuid={props.id}
      data-description={description || undefined}
    >
      {/* Main image */}
      <div className="relative w-full rounded-lg overflow-hidden border-[3px] border-black bg-white shadow-[4px_4px_0px_#000]">
        <div
          className="aspect-video w-full cursor-pointer"
          onClick={openLightbox}
        >
          <img
            src={images[currentIndex].base64 || "/placeholder.svg"}
            alt={images[currentIndex].name}
            className="w-full h-full object-cover transition-opacity duration-300"
            style={{ opacity: isTransitioning ? 0.6 : 1 }}
          />
        </div>

        {/* Image title overlay */}
        {images[currentIndex].title && (
          <div className="absolute bottom-0 inset-x-0 bg-black/70 px-4 pb-3 pt-3 pointer-events-none">
            <p className="text-sm font-medium text-white truncate">
              {images[currentIndex].title}
            </p>
          </div>
        )}

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-[#FFE66D] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center text-black hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_#000] cursor-pointer"
              aria-label="Previous image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-[#FFE66D] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center text-black hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_#000] cursor-pointer"
              aria-label="Next image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>

            {/* Counter pill */}
            <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black border-2 border-black text-[0.7rem] font-bold text-white tabular-nums">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => goTo(index)}
              type="button"
              className={`relative shrink-0 w-16 h-11 rounded-lg overflow-hidden transition-all cursor-pointer ${
                currentIndex === index
                  ? "border-[3px] border-black shadow-[2px_2px_0px_#000] opacity-100"
                  : "border-2 border-black/30 opacity-60 hover:opacity-90"
              }`}
              aria-label={`Go to image ${index + 1}`}
            >
              <img
                src={image.base64 || "/placeholder.svg"}
                alt={image.name}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* ---- Lightbox Modal ---- */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/90 animate-[fadeIn_0.15s_ease-out]"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <div
            className="relative w-full max-h-[95dvh] sm:max-w-3xl sm:max-h-[90dvh] bg-white rounded-lg border-[3px] border-black overflow-hidden shadow-[6px_6px_0px_#000] flex flex-col animate-[slideUp_0.2s_ease-out] sm:animate-[scaleIn_0.15s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag bar */}
            <div className="block sm:hidden w-9 h-1 mx-auto mt-2 rounded-lg bg-black shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b-[3px] border-black shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                {images.length > 1 && (
                  <span className="text-xs font-bold text-black tabular-nums shrink-0">
                    {currentIndex + 1} / {images.length}
                  </span>
                )}
                {images[currentIndex].title && (
                  <p className="text-sm font-bold text-black truncate">
                    {images[currentIndex].title}
                  </p>
                )}
                {!images[currentIndex].title && images[currentIndex].name && (
                  <p className="text-sm text-black/70 truncate">
                    {images[currentIndex].name}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeLightbox}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-black border-2 border-black hover:bg-[#FF6B6B] hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Image */}
            <div className="relative flex-1 min-h-0 bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={images[currentIndex].base64 || "/placeholder.svg"}
                alt={images[currentIndex].name}
                className="max-w-full max-h-[60dvh] sm:max-h-[65dvh] object-contain select-none"
                draggable={false}
              />

              {/* Prev/Next inside lightbox */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    type="button"
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-[#FFE66D] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center text-black hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_#000] cursor-pointer"
                    aria-label="Previous image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    onClick={goToNext}
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-[#FFE66D] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center text-black hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_#000] cursor-pointer"
                    aria-label="Next image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Actions footer */}
            <div className="flex items-center border-t-[3px] border-black shrink-0">
              <button
                type="button"
                onClick={copyUrl}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase text-black hover:bg-[#FFE66D] transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-600"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    Copy URL
                  </>
                )}
              </button>

              <div className="w-[3px] h-6 bg-black" />

              <button
                type="button"
                onClick={downloadImage}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase text-black hover:bg-[#FFE66D] transition-colors cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox keyframes */}
      {lightbox && (
        <style>{`
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
          @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) } to { opacity: 1; transform: scale(1) } }
        `}</style>
      )}
    </div>
  );
}

export default ImageCar;
