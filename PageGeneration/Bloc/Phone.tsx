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
        <div className="relative w-full overflow-hidden rounded-lg border-[3px] border-black bg-[#6366F1] text-white p-2 font-bold shadow-[4px_4px_0px_#000] transition-all">
          <div className="hidden" aria-hidden />

          <div className="relative flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-black/20 border-2 border-black">
                <div className="hidden" aria-hidden />
                <Svg className="relative" />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-3 min-w-0">
                  {flags ? (
                    <img
                      src={`https://arweave.net/${flags}`}
                      alt="flag"
                      className="h-7 w-10 rounded-md object-cover border-2 border-black shrink-0"
                    />
                  ) : (
                    <div className="h-7 w-10 rounded-md bg-black/20 flex items-center justify-center text-xs font-bold text-white border-2 border-black shrink-0">
                      {countryCode || "--"}
                    </div>
                  )}

                  <span className="text-sm font-bold tracking-wide truncate">
                    {displayNumber}
                  </span>
                </div>
              </div>

              <div className="hidden sm:flex h-full items-center border-l-[2px] border-black pl-4 text-white">
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
