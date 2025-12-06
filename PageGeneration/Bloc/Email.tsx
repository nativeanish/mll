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
        className={`group w-full flex items-center justify-between rounded-md px-5 py-3 text-white border border-white/10 bg-[#0f766e]/90 hover:bg-[#0f766e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200 transition duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_15px_25px_rgba(15,118,110,0.35)]`}
      >
        <span className="font-semibold  tracking-wide truncate">{title}</span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur transition duration-300 group-hover:bg-white/40">
          <Svg />
        </span>
      </button>
    </div>
  );
}

export default Email;
