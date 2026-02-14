import type { BlockData } from "@/store/useBlockStore";
import getStringFields from "../utils/getStringFields";
function Svg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="lucide lucide-at-sign-icon lucide-at-sign"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  );
}
function Email({ props }: { props: BlockData }) {
  const {
    description = "",
    email = "",
    title = "No email",
  } = getStringFields(props.data, ["description", "email", "title"]);

  const openMail = () => window.open(`mail:${email}`, "_blank");

  return (
    <div className="w-full" data-uuid={props.id} data-description={description}>
      <button
        type="button"
        onClick={openMail}
        aria-label={title}
        className={`group w-full flex items-center justify-between rounded-lg border-[3px] border-black bg-[#4ECDC4] px-5 py-3 text-black font-bold uppercase tracking-wide shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all`}
      >
        <span className="font-bold tracking-wide truncate">{title}</span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/10 transition-all">
          <Svg />
        </span>
      </button>
    </div>
  );
}

export default Email;
