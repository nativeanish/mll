import type { BlockData } from "@/store/useBlockStore";
import getStringField from "../utils/getStringField";
interface UrlCardProps {
  props: BlockData;
}
function Browser({ size = 24 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="lucide lucide-link-icon lucide-link"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
function UrlCard({ props }: UrlCardProps) {
  const buttonText = getStringField(props.data, "buttonText");
  const url = getStringField(props.data, "url");
  const description = getStringField(props.data, "description");
  const displayType = getStringField(props.data, "displayType");
  const imageUrl = getStringField(props.data, "imageUrl");
  const imageText = getStringField(props.data, "imageText");
  return (
    <div
      className="w-full"
      data-uuid={props.id}
      data-description={description || undefined}
      onClick={() => {
        if (url) {
          window.open(url, "_blank");
        }
      }}
    >
      {displayType === "button" ? (
        <div
          className="p-3 bg-gray-900 border cursor-pointer border-white w-full text-white text-md flex flex-row rounded-lg"
          onClick={() => {
            if (url) {
              const a = document.createElement("a");
              a.href = url;
              a.target = "_blank";
              a.rel = "noopener";
              a.referrerPolicy = "origin";

              a.click();
            }
          }}
        >
          <Browser />
          {buttonText && (
            <span className="ml-2 truncate font-semibold">{buttonText}</span>
          )}
        </div>
      ) : (
        <div>
          <div
            className="w-full cursor-pointer aspect-video border border-gray-300 rounded-lg overflow-hidden flex relative"
            onClick={() => {
              if (url) {
                const a = document.createElement("a");
                a.href = url;
                a.target = "_blank";
                a.rel = "noopener";
                a.referrerPolicy = "origin";
                a.click();
              }
            }}
          >
            <img
              src={imageUrl || ""}
              alt={description || "Image"}
              className="w-full h-full object-cover brightness-50 hover:brightness-100 transition-all"
            />
            {imageText && (
              <div className="absolute w-full bottom-0 bg-black bg-opacity-60 px-3 py-1 rounded text-gray-100 text-md pointer-events-none flex space-x-2 brightness-100 hover:brightness-50 transition-all">
                <Browser />
                <span className="truncate">{imageText}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UrlCard;
