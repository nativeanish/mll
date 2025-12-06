import type { BlockData } from "@/store/useBlockStore";
import getStringFields from "../utils/getStringFields";

function Svg({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-5 w-5 text-white/95 ${className}`}
    >
      <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
    </svg>
  );
}

function Phone({ props }: { props: BlockData }) {
  const {
    countryCode = "",
    phoneNumber = "",
    flag: flags = "",
    description = "",
  } = getStringFields(props.data, [
    "countryCode",
    "phoneNumber",
    "flag",
    "description",
  ]);
  const displayNumber = phoneNumber
    ? `${countryCode ? countryCode + " " : ""}${phoneNumber}`
    : "No number";

  // sanitized tel: href (keep + if present)
  const rawTel = `${countryCode}${phoneNumber}`;
  const telHref = `tel:${rawTel.replace(/[^\d+]/g, "")}`;
  const isClickable = Boolean(phoneNumber);

  return (
    <div
      className="w-full cursor-pointer"
      data-uuid={props.id}
      data-description={description}
      onClick={() => {
        window.open(`tel:${countryCode}${phoneNumber}`, "_blank");
      }}
    >
      <a
        href={isClickable ? telHref : undefined}
        aria-label={`Call ${displayNumber}`}
        aria-disabled={!isClickable}
        tabIndex={isClickable ? 0 : -1}
        className={`group relative block w-full focus:outline-none ${
          isClickable ? "" : "pointer-events-none opacity-70"
        }`}
      >
        <div className="relative w-full overflow-hidden rounded-md border border-white/10 bg-blue-800 text-white p-2 shadow-2xl backdrop-blur-sm ring-1 ring-black/20 transition-transform duration-300 transform-gpu group-hover:-translate-y-0.5 group-hover:shadow-[0_15px_45px_-15px_rgba(59,130,246,0.7)] group-focus-visible:ring-2 group-focus-visible:ring-blue-300/50">
          <div
            className="absolute inset-1 rounded-[18px] bg-white/5 opacity-30 transition duration-500 group-hover:opacity-50 group-focus-visible:opacity-60"
            aria-hidden
          />

          <div className="relative flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <div
                  className="absolute inset-0 rounded-2xl bg-white/10 opacity-40 blur-md transition duration-500 group-hover:opacity-70"
                  aria-hidden
                />
                <Svg className="relative" />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-3 min-w-0">
                  {flags ? (
                    <img
                      src={`https://arweave.net/${flags}`}
                      alt="flag"
                      className="h-7 w-10 rounded-md object-cover ring-1 ring-white/20 shrink-0"
                    />
                  ) : (
                    <div className="h-7 w-10 rounded-md bg-white/10 flex items-center justify-center text-xs font-semibold text-white/90 ring-1 ring-white/10 shrink-0">
                      {countryCode || "--"}
                    </div>
                  )}

                  <span className="text-sm font-semibold tracking-wide truncate">
                    {displayNumber}
                  </span>
                </div>
              </div>

              <div className="hidden sm:flex h-full items-center border-l border-white/10 pl-4 text-white/70">
                <Svg className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}

export default Phone;
