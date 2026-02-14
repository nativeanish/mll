import type { BasicBlockData, BlockData } from "@/store/useBlockStore";
import Link from "./Bloc/Link";
import UrlCard from "./Bloc/UrlCard";
import ImageCar from "./Bloc/ImageCar";
import Text from "./Bloc/Text";
import Maps from "./Bloc/Maps";
import Phone from "./Bloc/Phone";
import Email from "./Bloc/Email";
import Divider from "./Bloc/Divider";
import Newsletter from "./Bloc/Newsletter";
import Brew from "./Bloc/Brew";
import Community from "./Bloc/Community";
import Post from "./Bloc/Post";
import Video from "./Bloc/Video";
import File from "./Bloc/File";
import TokenInfo from "./Bloc/TokenInfo";
import Swap from "./Bloc/Swap";
import BazarProfile from "./Bloc/BazarProfile";
import Calendar from "./Bloc/Calendar";
import MediaPost from "./Bloc/MediaPost";
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

  // Separate social link blocks from content blocks
  const socialLinks = block.filter(
    (b) => b.node === "Social" && b.enabled === true,
  );
  const contentBlocks = block.filter(
    (b) => b.node !== "Social" && b.enabled === true,
  );

  const renderBlock = (b: BlockData) => {
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
      case "NewsLetter-Card":
        return <Newsletter key={b.id} props={b} />;
      case "FundMyBrew-Card":
        return <Brew key={b.id} props={b} />;
      case "Twitter-Post":
        return <MediaPost key={b.id} props={b} />;
      case "Telegram-Community":
      case "Discord-Community":
      case "Reddit-Community":
        return <Community key={b.id} blockData={b} />;
      case "Medium-Post":
      case "Paragraph-Post":
        return <Post key={b.id} props={b} />;
      case "Youtube-Video":
      case "Odysee-Video":
      case "Twitch-Video":
        return <Video key={b.id} props={b} />;
      case "File":
        return <File key={b.id} props={b} />;
      case "permaswap-info":
        return <TokenInfo key={b.id} pros={b} />;
      case "permaswap-swap":
        return <Swap key={b.id} props={b} />;
      case "Bazar-Profile":
        return <BazarProfile key={b.id} props={b} />;
      case "Calendar-Card":
        return <Calendar key={b.id} props={b} />;
      case "Farcaster-Post":
      case "Reddit-Post":
      case "Bluesky-Post":
        return <MediaPost key={b.id} props={b} />;
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        * { scrollbar-width: thin; scrollbar-color: #cbd5e1 #f8fafc; }
        *::-webkit-scrollbar { width: 6px; height: 6px; }
        *::-webkit-scrollbar-track { background: #f8fafc; }
        *::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        *::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <div className="bg-white min-h-screen flex flex-col">
        {/* ── Navbar ──────────────────────────────────────── */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14">
            <a href="#" className="flex items-center gap-2 select-none">
              <Logo />
              <span className="text-gray-900 font-semibold text-sm tracking-tight">
                metalinks
              </span>
            </a>
            <button className="md:hidden text-gray-400 hover:text-gray-900 transition p-1">
              <svg
                className="w-5 h-5"
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
        </header>

        {/* ── Single centered column for everything ──────── */}
        <div className="flex-1 w-full max-w-2xl mx-auto">
          {/* Cover Image */}
          {coverUrl && (
            <div className="w-full overflow-hidden">
              <img
                src={coverUrl}
                alt="Cover"
                className="w-full object-cover"
                style={{ aspectRatio: "3/1" }}
              />
            </div>
          )}

          {/* Avatar */}
          {avatarUrl && (
            <div
              className="flex justify-center"
              style={{ marginTop: coverUrl ? "-3rem" : "1.5rem" }}
            >
              <img
                src={avatarUrl}
                alt="Profile avatar"
                className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white shadow-lg object-cover"
              />
            </div>
          )}

          {/* Name & Bio */}
          <div className="text-center mt-4">
            {name && (
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                {name}
              </h1>
            )}
            {description && (
              <p className="mt-1.5 text-gray-500 text-sm md:text-base leading-relaxed max-w-md mx-auto">
                {description}
              </p>
            )}
          </div>

          {/* Social Icons */}
          {socialLinks.length > 0 && (
            <div className="flex justify-center flex-wrap gap-3 mt-4">
              {socialLinks.map((link) => (
                <Link key={link.id} block={link} />
              ))}
            </div>
          )}

          {/* ── Content Blocks (stacked, one per row) ──── */}
          <div className="flex flex-col mt-6 pb-10">
            {contentBlocks.map((b) => (
              <div
                key={b.id}
                className="w-full border-t border-gray-200 py-4 px-4"
              >
                {renderBlock(b)}
              </div>
            ))}
            {/* Bottom border for the last item */}
            {contentBlocks.length > 0 && (
              <div className="border-t border-gray-200" />
            )}
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="border-t border-gray-100 bg-white">
          <div className="max-w-2xl mx-auto px-4 py-6 flex justify-center">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.open(
                  "https://ar.io/?utm_campaign=poweredbyario&utm_medium=affiliate&utm_source=metalinks",
                  "_blank",
                );
              }}
              className="inline-flex items-center justify-center rounded-full bg-gray-900 text-white px-5 py-2 text-xs font-medium hover:bg-gray-700 transition-colors"
              aria-label="Powered by ar.io"
            >
              <div className="mr-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 467 379"
                  width="16"
                  height="16"
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
              Powered by <span className="ml-1 font-semibold">ar.io</span>
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
