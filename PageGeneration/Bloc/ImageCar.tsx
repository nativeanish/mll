import type { BlockData } from "@/store/useBlockStore";
import getStringField from "../utils/getStringField";
import React from "react";
function ImageCar({ props }: { props: BlockData }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [stat, setStat] = React.useState(0);
  const goToPrevious = () => {
    alert("Previous");
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    alert("Next");
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    alert(`Go to slide ${index + 1}`);
    setCurrentIndex(index);
  };
  console.log("Current Index:", currentIndex);
  const galleryTitle = getStringField(props.data, "galleryTitle");
  const description = getStringField(props.data, "description");
  const images = props.data["images"] as Array<{
    base64: string;
    id: string;
    name: string;
    title: string;
    type: string;
  }>;

  return (
    <div
      className="w-full flex flex-col items-center space-y-6 p-4"
      data-uuid={props.id}
      data-description={description || undefined}
    >
      {images && images.length > 0 && (
        <div className="w-full max-w-5xl">
          {/* Main Image Container */}
          <div className="relative rounded-2xl overflow-hidden mb-4">
            {/* Main Image */}
            <div className="aspect-video w-full">
              <img
                src={images[currentIndex].base64 || "/placeholder.svg"}
                alt={images[currentIndex].name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Previous Button */}
            <button
              onClick={() => goToPrevious()}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-900/80 hover:bg-slate-900 rounded-full flex items-center justify-center transition-colors touch-action-manipulation z-10"
              aria-label="Previous image"
              style={{ touchAction: "manipulation" }}
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            {/* Next Button */}
            <button
              onClick={() => goToNext()}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-900/80 hover:bg-slate-900 rounded-full flex items-center justify-center transition-colors touch-action-manipulation z-10"
              aria-label="Next image"
              style={{ touchAction: "manipulation" }}
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToSlide(index)}
                className={`relative aspect-video rounded-xl overflow-hidden transition-all duration-300 ${
                  currentIndex === index
                    ? "ring-4 ring-blue-500 ring-offset-2 ring-offset-slate-800"
                    : "opacity-70 hover:opacity-100"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                <img
                  src={image.base64 || "/placeholder.svg"}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setStat(stat + 1)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Increment Stat
      </button>
      <p>Current Stat: {stat}</p>
      <button
        onClick={() => alert("Stat value: " + stat)}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        Show Stat
      </button>
    </div>
  );
}

export default ImageCar;
