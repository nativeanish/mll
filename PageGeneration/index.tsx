import { useState, useEffect, useRef } from "react";
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
import GithubProfile from "./Bloc/GithubProfile";
import GithubRepo from "./Bloc/GithubRepo";
import BazarCollection from "./Bloc/BazarCollection";
import ArDrive from "./Bloc/ArDrive";
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
/* ── Inline SVG Icons ─────────────────────────────── */
const ShareIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
    />
  </svg>
);
const FeedbackIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.2 48.2 0 0 0 5.887-.512c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.4 48.4 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
    />
  </svg>
);

/* ── Share Options ────────────────────────────────── */
const XIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const WhatsAppIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);
const TelegramIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);
const MailIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
    />
  </svg>
);
const CopyIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
    />
  </svg>
);
const MoreIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
    />
  </svg>
);
const CheckIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4.5 12.75 6 6 9-13.5"
    />
  </svg>
);
const CloseIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18 18 6M6 6l12 12"
    />
  </svg>
);
const SendIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
    />
  </svg>
);

export default function PageGeneration({ basicData, block }: Props) {
  const { name, description, avatarUrl, coverUrl } = basicData;
  const [showShare, setShowShare] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const pageTitle = name
    ? `Check out ${name}'s metalinks page!`
    : "Check out this metalinks page!";

  const handleCopy = () => {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: pageTitle, url: pageUrl }).catch(() => {});
    }
  };

  /* ── Lightweight QR code generator (no deps) ── */
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!showShare || !pageUrl || !qrCanvasRef.current) return;
    const canvas = qrCanvasRef.current;
    const size = 160;
    canvas.width = size;
    canvas.height = size;
    // Use a Google Charts QR API rendered into an image then drawn on canvas
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
    };
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(pageUrl)}&margin=4`;
  }, [showShare, pageUrl]);

  const handleFeedbackSubmit = () => {
    if (!feedbackEmail.trim() || !feedbackMsg.trim()) return;
    // In production, wire this to an API endpoint
    setFeedbackSent(true);
    setTimeout(() => {
      setShowFeedback(false);
      setFeedbackSent(false);
      setFeedbackEmail("");
      setFeedbackMsg("");
    }, 2000);
  };

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
      case "GitHub-Profile":
        return <GithubProfile key={b.id} props={b} />;
      case "GitHub-Repository":
        return <GithubRepo key={b.id} props={b} />;
      case "Bazar-Collection":
        return <BazarCollection key={b.id} props={b} />;
      case "ArDrive-File":
        return <ArDrive key={b.id} props={b} />;
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        * { scrollbar-width: thin; scrollbar-color: #222 #FFE66D; }
        *::-webkit-scrollbar { width: 8px; height: 8px; }
        *::-webkit-scrollbar-track { background: #FFE66D; }
        *::-webkit-scrollbar-thumb { background: #222; border-radius: 0; }
        *::-webkit-scrollbar-thumb:hover { background: #000; }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div className="bg-[#FFF8E7] min-h-screen flex flex-col">
        {/* ── Navbar ──────────────────────────────────────── */}
        <header className="sticky top-0 z-50 bg-[#FFE66D] border-b-[3px] border-black">
          <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14">
            <a href="#" className="flex items-center gap-2 select-none">
              <Logo />
              <span className="text-black font-black text-sm uppercase tracking-widest">
                metalinks
              </span>
            </a>
            <div className="flex items-center gap-1.5 md:gap-2">
              <button
                onClick={() => setShowShare(true)}
                title="Share"
                className="flex items-center gap-1.5 text-black font-bold text-xs uppercase tracking-wider border-[2.5px] border-black p-1.5 md:px-2.5 md:py-1.5 bg-white hover:bg-black hover:text-white shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                <ShareIcon />
                <span className="hidden md:inline">Share</span>
              </button>
              <button
                onClick={() => setShowFeedback(true)}
                title="Feedback"
                className="flex items-center gap-1.5 text-black font-bold text-xs uppercase tracking-wider border-[2.5px] border-black p-1.5 md:px-2.5 md:py-1.5 bg-[#4ECDC4] hover:bg-black hover:text-[#4ECDC4] shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                <FeedbackIcon />
                <span className="hidden md:inline">Feedback</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── Single centered column for everything ──────── */}
        <div className="flex-1 w-full max-w-2xl mx-auto">
          {/* Cover Image */}
          {coverUrl && (
            <div className="w-full border-b-[3px] border-black overflow-hidden">
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
                className="w-24 h-24 md:w-28 md:h-28 rounded-lg border-[3px] border-black shadow-[4px_4px_0px_#000] object-cover bg-white"
              />
            </div>
          )}

          {/* Name & Bio */}
          <div className="text-center mt-5 px-2">
            {name && (
              <h1 className="text-2xl md:text-3xl font-black text-black uppercase tracking-wide leading-tight wrap-anywhere max-w-full mx-auto">
                {name}
              </h1>
            )}
            {description && (
              <p className="mt-2 text-black/70 text-sm md:text-base font-medium leading-relaxed max-w-md mx-auto wrap-anywhere">
                {description}
              </p>
            )}
          </div>

          {/* Social Icons */}
          {socialLinks.length > 0 && (
            <div className="flex justify-center flex-wrap gap-3 mt-5">
              {socialLinks.map((link) => (
                <Link key={link.id} block={link} />
              ))}
            </div>
          )}

          {/* ── Content Blocks (stacked, one per row) ──── */}
          <div className="flex flex-col mt-6 pb-10 gap-4 px-4">
            {contentBlocks.map((b) => (
              <div key={b.id} className="w-full">
                {renderBlock(b)}
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="border-t-[3px] border-black bg-[#FFE66D]">
          {/* Create your own CTA */}
          <div className="max-w-2xl mx-auto px-4 pt-4 pb-2 flex justify-center">
            <a
              href="https://metalinks.ar.io"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 text-black/60 hover:text-black text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <span className="text-sm">&#10024;</span>
              Create your own Metalinks page
              <svg
                className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </a>
          </div>

          {/* Powered by ar.io */}
          <div className="max-w-2xl mx-auto px-4 pb-6 pt-2 flex justify-center">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.open(
                  "https://ar.io/?utm_campaign=poweredbyario&utm_medium=affiliate&utm_source=metalinks",
                  "_blank",
                );
              }}
              className="inline-flex items-center justify-center rounded-lg bg-black text-white px-5 py-2.5 text-xs font-black uppercase tracking-wider border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
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
              Powered by <span className="ml-1 font-black">ar.io</span>
            </a>
          </div>
        </footer>
      </div>

      {/* ══════════════════════════════════════════════════════
          SHARE DIALOG
         ══════════════════════════════════════════════════════ */}
      {showShare && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          onClick={() => setShowShare(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          {/* Dialog */}
          <div
            className="relative w-full max-w-sm bg-white border-[3px] border-black shadow-[6px_6px_0px_#000] animate-[scaleIn_0.15s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#FFE66D] border-b-[3px] border-black">
              <h2 className="font-black text-base uppercase tracking-wider text-black">
                Share this page
              </h2>
              <button
                onClick={() => setShowShare(false)}
                className="p-1 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors"
              >
                <CloseIcon />
              </button>
            </div>
            {/* Share Options Grid */}
            <div className="grid grid-cols-3 gap-3 p-4">
              {/* X / Twitter */}
              <a
                href={`https://x.com/intent/tweet?text=${encodeURIComponent(pageTitle)}&url=${encodeURIComponent(pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 border-[2.5px] border-black bg-black text-white shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                <XIcon />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  X
                </span>
              </a>
              {/* WhatsApp */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(pageTitle + " " + pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 border-[2.5px] border-black bg-[#25D366] text-white shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                <WhatsAppIcon />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  WhatsApp
                </span>
              </a>
              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(pageTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 border-[2.5px] border-black bg-[#0088cc] text-white shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                <TelegramIcon />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Telegram
                </span>
              </a>
              {/* Email */}
              <a
                href={`mailto:?subject=${encodeURIComponent(pageTitle)}&body=${encodeURIComponent(pageTitle + "\n" + pageUrl)}`}
                className="flex flex-col items-center gap-2 p-3 border-[2.5px] border-black bg-[#6366F1] text-white shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                <MailIcon />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Email
                </span>
              </a>
              {/* Copy Link */}
              <button
                onClick={handleCopy}
                className={`flex flex-col items-center gap-2 p-3 border-[2.5px] border-black shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all ${
                  copied ? "bg-[#4ECDC4] text-white" : "bg-[#FFE66D] text-black"
                }`}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {copied ? "Copied!" : "Copy"}
                </span>
              </button>
              {/* More / Native Share */}
              {typeof navigator !== "undefined" &&
                typeof navigator.share === "function" && (
                  <button
                    onClick={handleNativeShare}
                    className="flex flex-col items-center gap-2 p-3 border-[2.5px] border-black bg-[#FF6B6B] text-white shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                  >
                    <MoreIcon />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      More
                    </span>
                  </button>
                )}
            </div>
            {/* QR Code */}
            <div className="flex flex-col items-center gap-2 px-4 pb-3">
              <div className="border-[2.5px] border-black p-1.5 bg-white shadow-[2px_2px_0px_#000]">
                <canvas
                  ref={qrCanvasRef}
                  className="w-28 h-28 md:w-36 md:h-36"
                />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-black/50">
                Scan to open
              </span>
            </div>
            {/* URL preview */}
            <div className="mx-4 mb-4 flex items-center gap-2 border-2 border-black bg-gray-50 px-3 py-2">
              <span className="flex-1 text-xs font-mono text-black/70 truncate select-all">
                {pageUrl}
              </span>
              <button
                onClick={handleCopy}
                className="text-black hover:text-[#4ECDC4] transition-colors shrink-0"
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          FEEDBACK / REPORT MODAL
         ══════════════════════════════════════════════════════ */}
      {showFeedback && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          onClick={() => {
            setShowFeedback(false);
            setFeedbackSent(false);
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          {/* Modal */}
          <div
            className="relative w-full max-w-md bg-white border-[3px] border-black shadow-[6px_6px_0px_#000] animate-[scaleIn_0.15s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#4ECDC4] border-b-[3px] border-black">
              <h2 className="font-black text-base uppercase tracking-wider text-black">
                Send Feedback
              </h2>
              <button
                onClick={() => {
                  setShowFeedback(false);
                  setFeedbackSent(false);
                }}
                className="p-1 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            {feedbackSent ? (
              /* Success state */
              <div className="flex flex-col items-center gap-3 p-8">
                <div className="w-14 h-14 border-[3px] border-black bg-[#4ECDC4] flex items-center justify-center shadow-[3px_3px_0px_#000]">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                </div>
                <p className="font-black text-lg text-black uppercase">
                  Thank you!
                </p>
                <p className="text-sm text-black/60 font-medium text-center">
                  Your feedback has been received. We'll review it shortly.
                </p>
              </div>
            ) : (
              /* Form */
              <div className="p-4 flex flex-col gap-4">
                <p className="text-xs text-black/60 font-medium leading-relaxed">
                  Have something to share? Found an issue? We'd love to hear
                  from you.
                </p>
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-black">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border-[2.5px] border-black px-3 py-2.5 text-sm font-medium text-black bg-white placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[#FFE66D] focus:ring-offset-1 shadow-[2px_2px_0px_#000] transition-shadow focus:shadow-[3px_3px_0px_#000]"
                  />
                </div>
                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-black">
                    Message
                  </label>
                  <textarea
                    value={feedbackMsg}
                    onChange={(e) => setFeedbackMsg(e.target.value)}
                    placeholder="Tell us what's on your mind..."
                    rows={4}
                    className="w-full border-[2.5px] border-black px-3 py-2.5 text-sm font-medium text-black bg-white placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[#FFE66D] focus:ring-offset-1 shadow-[2px_2px_0px_#000] transition-shadow focus:shadow-[3px_3px_0px_#000] resize-none"
                  />
                </div>
                {/* Submit */}
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={!feedbackEmail.trim() || !feedbackMsg.trim()}
                  className="flex items-center justify-center gap-2 w-full border-[2.5px] border-black bg-black text-white px-4 py-3 font-black text-sm uppercase tracking-wider shadow-[3px_3px_0px_#FFE66D] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-[3px_3px_0px_#FFE66D] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                >
                  <SendIcon /> Send Feedback
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
