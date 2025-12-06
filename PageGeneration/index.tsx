import type { BasicBlockData, BlockData } from "@/store/useBlockStore";
import Link from "./Bloc/Link";
import UrlCard from "./Bloc/UrlCard";
import ImageCar from "./Bloc/ImageCar";
import Text from "./Bloc/Text";
import Maps from "./Bloc/Maps";
import Phone from "./Bloc/Phone";
import Email from "./Bloc/Email";
import Divider from "./Bloc/Divider";
interface Props {
  basicData: BasicBlockData;
  block: Array<BlockData>;
}
const Logo = () => (
  <svg
    width="2em"
    height="2em"
    viewBox="0 0 328 329"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      y="0.5"
      width="328"
      height="328"
      rx="164"
      fill="black"
      className="dark:fill-white"
    />
    <path
      d="M165.018 72.3008V132.771C165.018 152.653 148.9 168.771 129.018 168.771H70.2288"
      stroke="white"
      strokeWidth="20"
      className="dark:stroke-black"
    />
    <path
      d="M166.627 265.241L166.627 204.771C166.627 184.889 182.744 168.771 202.627 168.771L261.416 168.771"
      stroke="white"
      strokeWidth="20"
      className="dark:stroke-black"
    />
    <line
      x1="238.136"
      y1="98.8184"
      x2="196.76"
      y2="139.707"
      stroke="white"
      strokeWidth="20"
      className="dark:stroke-black"
    />
    <line
      x1="135.688"
      y1="200.957"
      x2="94.3128"
      y2="241.845"
      stroke="white"
      strokeWidth="20"
      className="dark:stroke-black"
    />
    <line
      x1="133.689"
      y1="137.524"
      x2="92.5566"
      y2="96.3914"
      stroke="white"
      strokeWidth="20"
      className="dark:stroke-black"
    />
    <line
      x1="237.679"
      y1="241.803"
      x2="196.547"
      y2="200.671"
      stroke="white"
      strokeWidth="20"
      className="dark:stroke-black"
    />
  </svg>
);
export default function PageGeneration({ basicData, block }: Props) {
  const { name, description, avatarUrl, coverUrl } = basicData;
  return (
    <>
      <style>{`
        * {
          scrollbar-width: thin;
          scrollbar-color: #000000 #f5f5f5;
        }

        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        *::-webkit-scrollbar-track {
          background: #f5f5f5;
        }

        *::-webkit-scrollbar-thumb {
          background: #000000;
          border-radius: 4px;
        }

        *::-webkit-scrollbar-thumb:hover {
          background: #333333;
        }
      `}</style>

      <div className="bg-white min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pt-4 px-4 pb-3 bg-white sticky top-0 z-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="">
              <Logo />
            </div>
            <span className="text-gray-900 font-semibold">metalinks</span>
          </div>
          <button className="text-gray-600 hover:text-gray-900 transition">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
        {/* Cover and Avatar Images  */}
        <div className="px-0 md:px-8 lg:px-16">
          {(coverUrl || avatarUrl) && (
            <div
              className="relative w-full rounded-lg md:hidden"
              style={{ aspectRatio: "3/1" }}
            >
              {/* Cover Image */}
              {coverUrl && (
                <img
                  src={coverUrl || "/placeholder.svg"}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
              {/* Profile Image (overlaps cover on all breakpoints) */}
              {avatarUrl && (
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-10">
                  <img
                    src={avatarUrl || "/placeholder.svg"}
                    alt="Profile avatar"
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                </div>
              )}
            </div>
          )}
          {(coverUrl || avatarUrl) && (
            <div
              className="relative w-full rounded-lg hidden md:block"
              style={{ aspectRatio: "4.5/1" }}
            >
              {/* Cover Image */}
              {coverUrl && (
                <img
                  src={coverUrl || "/placeholder.svg"}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
              {/* Profile Image (overlaps cover on all breakpoints) */}
              {avatarUrl && (
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-10">
                  <img
                    src={avatarUrl || "/placeholder.svg"}
                    alt="Profile avatar"
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 mt-20 px-6 pb-8 md:mt-20 md:px-0">
          <div className="md:max-w-4xl md:mx-auto">
            {/* Avatar now overlaps cover on all breakpoints; extra container removed */}

            <div className="md:px-6">
              {/* Profile Info */}
              <div className="mb-6 md:text-center md:mb-8">
                {name && (
                  <h1 className="text-2xl md:text-4xl font-bold text-center md:text-center text-gray-900 mb-3 md:mb-4">
                    {name}
                  </h1>
                )}
                {description && (
                  <p className="text-center md:text-center text-gray-600 text-sm md:text-lg md:max-w-2xl md:mx-auto mb-6">
                    {description}
                  </p>
                )}
              </div>

              {/* Social Links */}
              <div className="flex justify-center gap-4 mb-6 md:mb-4 flex-wrap">
                {block
                  .filter((b) => b.node === "Social" && b.enabled === true)
                  .map((link) => (
                    <Link key={link.id} block={link} />
                  ))}

                {block.map((b) => {
                  if (b.enabled !== true) return null;
                  switch (b.alt) {
                    case "Url-Card":
                      return <UrlCard key={b.id} props={b} />;
                    case "Image-Card":
                      return <ImageCar key={b.id} props={b} />;
                    case "Text-Card":
                      return <Text key={b.id} props={b} />;
                    case "Maps-Card":
                      return <Maps key={b.id} props={b} />;
                    case "Phone-Card":
                      return <Phone key={b.id} props={b} />;
                    case "Email-Card":
                      return <Email key={b.id} props={b} />;
                    case "Divider":
                      return <Divider key={b.id} props={b} />;
                    default:
                      return null;
                  }
                })}
              </div>
            </div>
          </div>
        </div>
        {/* Footer - appears at the end of the page */}
        <footer className="mt-8 border-t border-gray-100 bg-white">
          <div className="md:max-w-4xl md:mx-auto px-6 py-8">
            <div className="flex justify-center">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(
                    "https://ar.io/?utm_campaign=poweredbyario&utm_medium=affiliate&utm_source=metalinks",
                    "_blank"
                  );
                }}
                className="inline-flex items-center justify-center rounded-lg bg-[#96161d] text-white px-6 py-2 text-sm font-medium hover:bg-gray-800 transition"
                aria-label="Footer action"
              >
                <div className="mr-1 mb-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 467 379"
                    width="18"
                    height="18"
                  >
                    <path
                      fill="#B3B3B3"
                      d="M446.779 222.277C446.779 99.639 347.932.221 225.999.221S.489 99.64.489 222.277v138.596a17.7 17.7 0 0 0 5.141 12.533 17.5 17.5 0 0 0 12.461 5.171h25.146a17.5 17.5 0 0 0 12.462-5.171 17.7 17.7 0 0 0 5.14-12.533V245.748c0-9.778 7.88-17.704 17.602-17.704h35.808c9.721 0 17.602 7.926 17.602 17.704v115.125a17.7 17.7 0 0 0 5.141 12.533 17.5 17.5 0 0 0 12.461 5.171h25.146a17.5 17.5 0 0 0 12.461-5.171 17.7 17.7 0 0 0 5.141-12.533v-34.952c0-34.968 18.548-67.28 48.657-84.764a96.83 96.83 0 0 1 97.314 0c30.109 17.484 48.657 49.796 48.657 84.764v34.952c0 9.778 7.881 17.704 17.602 17.704h24.846c9.721 0 17.602-7.926 17.602-17.704zM127.576 175.01a39.3 39.3 0 0 1-13.176 13.05 36.73 36.73 0 0 1-30.728 2.782 16.6 16.6 0 0 1-4.175-1.973c-11.6-6.406-18.808-18.658-18.808-31.968s7.209-25.562 18.808-31.968a16.4 16.4 0 0 1 4.376-1.973c13.2-4.668 27.893-1.371 37.869 8.498a34.39 34.39 0 0 1 10.964 25.291 35.26 35.26 0 0 1-5.13 18.261"
                    ></path>
                    <path
                      fill="#FCFCFC"
                      d="M466.41 222.277C466.41 99.639 367.564.221 245.63.221S20.121 99.64 20.121 222.277v138.596a17.7 17.7 0 0 0 5.14 12.533 17.5 17.5 0 0 0 12.462 5.171H62.87a17.5 17.5 0 0 0 12.461-5.171 17.7 17.7 0 0 0 5.14-12.533V245.748c0-9.778 7.882-17.704 17.603-17.704h35.807c9.722 0 17.603 7.926 17.603 17.704v115.125a17.7 17.7 0 0 0 5.14 12.533 17.5 17.5 0 0 0 12.462 5.171h25.145a17.5 17.5 0 0 0 12.462-5.171 17.7 17.7 0 0 0 5.14-12.533v-34.952c0-34.968 18.548-67.28 48.657-84.764a96.83 96.83 0 0 1 97.315 0c30.109 17.484 48.657 49.796 48.657 84.764v34.952c0 9.778 7.88 17.704 17.602 17.704h24.846c9.721 0 17.602-7.926 17.602-17.704zM147.208 175.01a39.3 39.3 0 0 1-13.177 13.05 36.73 36.73 0 0 1-30.728 2.782 16.6 16.6 0 0 1-4.174-1.973c-11.6-6.406-18.808-18.658-18.808-31.968s7.209-25.562 18.808-31.968a16.4 16.4 0 0 1 4.375-1.973c13.202-4.668 27.894-1.371 37.87 8.498a34.4 34.4 0 0 1 10.964 25.291 35.26 35.26 0 0 1-5.13 18.261"
                    ></path>
                  </svg>
                </div>
                Powered by <span className="ml-1">ar.io</span>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
