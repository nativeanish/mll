import type { BasicBlockData, BlockData } from "@/store/useBlockStore";
import Link from "./Link";
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
        <div className="px-4 md:px-8 lg:px-16">
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
                {/* <button className="w-10 h-10 flex items-center justify-center relative overflow-hidden rounded-full bg-white shadow-md shadow-gray-200 group transition-all duration-300">
                  <svg
                    className="relative z-10 fill-gray-900 transition-all duration-300 group-hover:fill-white"
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 72 72"
                    fill="none"
                  >
                    <path
                      d="M46.4927 38.6403L47.7973 30.3588H39.7611V24.9759C39.7611 22.7114 40.883 20.4987 44.4706 20.4987H48.1756V13.4465C46.018 13.1028 43.8378 12.9168 41.6527 12.8901C35.0385 12.8901 30.7204 16.8626 30.7204 24.0442V30.3588H23.3887V38.6403H30.7204V58.671H39.7611V38.6403H46.4927Z"
                      fill=""
                    />
                  </svg>
                  <div className="absolute top-full left-0 w-full h-full rounded-full bg-blue-500 z-0 transition-all duration-500 group-hover:top-0"></div>
                </button>
                <button className="w-10 h-10 flex items-center justify-center relative overflow-hidden rounded-full bg-white shadow-md shadow-gray-200 group transition-all duration-300">
                  <svg
                    className="relative z-10 transition-all duration-300 group-hover:fill-[#5865F2]"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                  >
                    <path
                      fill="black"
                      d="M256 0c141.385 0 256 114.615 256 256S397.385 512 256 512 0 397.385 0 256 114.615 0 256 0zm104.932 160.621a250.428 250.428 0 00-62.383-19.182 173.883 173.883 0 00-7.966 16.243 232.557 232.557 0 00-34.619-2.603c-11.569 0-23.195.879-34.622 2.58-2.334-5.509-5.044-10.971-7.986-16.223a252.58 252.58 0 00-62.397 19.222c-39.483 58.408-50.183 115.357-44.833 171.497a251.49 251.49 0 0076.502 38.398c6.169-8.327 11.695-17.192 16.386-26.417a161.682 161.682 0 01-25.813-12.319c2.164-1.569 4.281-3.186 6.325-4.756 23.912 11.231 50.039 17.088 76.473 17.088 26.436 0 52.562-5.857 76.475-17.089 2.069 1.688 4.186 3.305 6.325 4.755a162.693 162.693 0 01-25.86 12.352 183.969 183.969 0 0016.387 26.397 250.498 250.498 0 0076.553-38.392l-.006.007c6.277-65.104-10.725-121.53-44.941-171.558zM205.78 297.63c-14.908 0-27.226-13.53-27.226-30.175 0-16.645 11.889-30.293 27.178-30.293 15.29 0 27.511 13.648 27.25 30.293-.262 16.645-12.008 30.175-27.202 30.175zm100.439 0c-14.933 0-27.202-13.53-27.202-30.175 0-16.645 11.889-30.293 27.202-30.293 15.313 0 27.44 13.648 27.178 30.293-.261 16.645-11.984 30.175-27.178 30.175z"
                    />
                  </svg>

                  <div className="absolute top-full left-0 w-full h-full rounded-full bg-[#5865F2] z-0 transition-all duration-500 group-hover:top-0"></div>
                </button> */}
                {block
                  .filter((b) => b.node === "Social" && b.enabled === true)
                  .map((link) => (
                    <Link key={link.id} block={link} />
                  ))}
              </div>

              {/* Visit Website Button */}
              {/* <button className="w-full bg-gray-900 text-white py-3 rounded-lg flex items-center justify-between px-4 hover:bg-gray-800 transition mb-4">
                <span>Visit my website</span>
              </button> */}

              {/* Product Card 1 */}
              {/* <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <img
                  src="/harmonica-product.jpg"
                  alt="Harmonica"
                  className="w-16 h-16 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Harmonica</p>
                  <p className="text-sm text-gray-600">Limited Series</p>
                </div>
                <span className="bg-purple-600 text-white px-3 py-1 rounded text-sm font-semibold">
                  IDR 690K
                </span>
              </div> */}

              {/* Visit Instagram Button */}
              {/* <button className="w-full bg-white border-2 border-gray-200 text-gray-900 py-3 rounded-lg flex items-center justify-between px-4 hover:border-gray-300 transition mb-4">
                <span>Visit my Instagram</span>
              </button> */}

              {/* Product Card 2 */}
              {/* <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <img
                  src="/digital-marketing-ebook.png"
                  alt="Digital Marketing"
                  className="w-16 h-16 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    Digital Marketing
                  </p>
                  <p className="text-sm text-gray-600">E-Book</p>
                </div>
                <span className="bg-purple-600 text-white px-3 py-1 rounded text-sm font-semibold">
                  IDR 690K
                </span>
              </div> */}
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
