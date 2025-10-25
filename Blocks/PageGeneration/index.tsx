import type { BasicBlockData } from "@/store/useBlockData";

export default function PageGeneration({
  name,
  description,
  avatarUrl,
  coverUrl,
}: BasicBlockData) {
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

      <div className="bg-white min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center pt-4 px-4 pb-3 bg-white sticky top-0 z-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded border border-gray-300"></div>
            <span className="text-gray-900 font-semibold">lynku.id</span>
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

        <div className="px-4 md:px-8 lg:px-16 py-4 md:py-6">
          {(coverUrl || avatarUrl) && (
            <div
              className="relative w-full  rounded-lg "
              style={{ aspectRatio: "3/1" }}
            >
              {/* Cover Image */}
              {coverUrl && (
                <img
                  src={coverUrl}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
              {/* Profile Image (overlaps cover on all breakpoints) */}
              {avatarUrl && (
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-10">
                  <img
                    src={avatarUrl}
                    alt="Profile avatar"
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="mt-20 px-6 pb-8 md:mt-20 md:px-0">
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
              <div className="flex justify-center gap-4 mb-6 md:mb-4">
                <a
                  href="#"
                  className="w-10 md:w-12 h-10 md:h-12 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition"
                  aria-label="Social link 1"
                />
                <a
                  href="#"
                  className="w-10 md:w-12 h-10 md:h-12 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition"
                  aria-label="Social link 2"
                />
                <a
                  href="#"
                  className="w-10 md:w-12 h-10 md:h-12 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition"
                  aria-label="Social link 3"
                />
                <a
                  href="#"
                  className="w-10 md:w-12 h-10 md:h-12 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition"
                  aria-label="Social link 4"
                />
              </div>

              {/* Visit Website Button */}
              <button className="w-full bg-gray-900 text-white py-3 rounded-lg flex items-center justify-between px-4 hover:bg-gray-800 transition mb-4">
                <span>Visit my website</span>
              </button>

              {/* Product Card 1 */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
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
              </div>

              {/* Visit Instagram Button */}
              <button className="w-full bg-white border-2 border-gray-200 text-gray-900 py-3 rounded-lg flex items-center justify-between px-4 hover:border-gray-300 transition mb-4">
                <span>Visit my Instagram</span>
              </button>

              {/* Product Card 2 */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
