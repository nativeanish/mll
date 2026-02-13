import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import type { BlockData } from "@/store/useBlockStore";
import getStringFields from "../utils/getStringFields";

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                  */
/* ------------------------------------------------------------------ */

function CoffeeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10 2v2" />
      <path d="M14 2v2" />
      <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
      <path d="M6 2v2" />
    </svg>
  );
}

function WalletIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  );
}

function CoinsIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  );
}

function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function CheckCircleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function LoaderIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2v4" />
      <path d="m16.2 7.8 2.9-2.9" />
      <path d="M18 12h4" />
      <path d="m16.2 16.2 2.9 2.9" />
      <path d="M12 18v4" />
      <path d="m4.9 19.1 2.9-2.9" />
      <path d="M2 12h4" />
      <path d="m4.9 4.9 2.9 2.9" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Minimal keyframes (Tailwind doesn't ship these)                   */
/* ------------------------------------------------------------------ */

const BREW_KEYFRAMES = `
@keyframes brew-slide-up{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes brew-scale-in{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
@keyframes brew-check-pop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
@keyframes brew-progress{0%{width:0%}100%{width:100%}}
.brew-slide-up{animation:brew-slide-up .25s ease-out}
.brew-scale-in{animation:brew-scale-in .2s ease-out}
.brew-check-pop{animation:brew-check-pop .4s ease-out}
.brew-progress{animation:brew-progress 1.8s ease-in-out}
.brew-progress-slow{animation:brew-progress 2.2s ease-in-out}
`;

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

type ChainKey = "AO" | "ARIO" | "AR" | "wAR" | string;

const chainMeta: Record<ChainKey, { label: string; symbol: string }> = {
  AO: { label: "AO", symbol: "AO" },
  ARIO: { label: "ARIO", symbol: "ARIO" },
  AR: { label: "Arweave", symbol: "AR" },
  wAR: { label: "wAR", symbol: "wAR" },
};

function parseTipAmounts(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0)
    .map((v) => Number.parseFloat(v))
    .filter((n) => Number.isFinite(n) && n > 0)
    .map((n) => n.toString())
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => Number.parseFloat(a) - Number.parseFloat(b));
}

function formatAddress(addr: string): string {
  if (!addr) return "";
  return addr.length > 16 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr;
}

/* ------------------------------------------------------------------ */
/*  Step type                                                         */
/* ------------------------------------------------------------------ */

type ModalStep = "connecting" | "tip" | "processing" | "success";

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

function Brew({ props }: { props: BlockData }) {
  const {
    title = "Fund My Brew",
    description = "Support my work by buying me a brew! Your contributions help me keep creating awesome content.",
    buttonName = "Buy Me a Brew",
    paymentAddress = "yourpaymentaddress",
    selectedChain = "AO",
    tipAmounts = "5,10,15",
    customAmount = "true",
    thankMessage = "Thank you for your support! Your contribution means a lot to me.",
  } = getStringFields(props.data, [
    "title",
    "description",
    "buttonName",
    "paymentAddress",
    "selectedChain",
    "tipAmounts",
    "customAmount",
    "thankMessage",
  ]);

  const allowCustom = (customAmount || "").toLowerCase() !== "false";
  const parsedTipAmounts = useMemo(
    () => parseTipAmounts(tipAmounts),
    [tipAmounts],
  );

  const chain = chainMeta[selectedChain as ChainKey] || {
    label: selectedChain || "Token",
    symbol: selectedChain || "Token",
  };

  /* ---- state ---- */
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ModalStep>("connecting");
  const [selectedAmt, setSelectedAmt] = useState<string>("");
  const [customVal, setCustomVal] = useState("");
  const [inputErr, setInputErr] = useState("");
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const stylesInjected = useRef(false);

  /* inject minimal keyframes once */
  useEffect(() => {
    if (stylesInjected.current) return;
    stylesInjected.current = true;
    const tag = document.createElement("style");
    tag.textContent = BREW_KEYFRAMES;
    document.head.appendChild(tag);
    return () => {
      tag.remove();
      stylesInjected.current = false;
    };
  }, []);

  /* lock body scroll when modal open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* ---- open modal ---- */
  const handleOpen = useCallback(() => {
    setOpen(true);
    setStep("connecting");
    setSelectedAmt(parsedTipAmounts[0] || "");
    setCustomVal("");
    setInputErr("");
    setWalletBalance(null);

    // TODO: replace this simulated wallet connection with real logic
    setTimeout(() => {
      setWalletBalance("128.42"); // simulated balance
      setStep("tip");
    }, 2000);
  }, [parsedTipAmounts]);

  /* ---- close modal ---- */
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  /* close on Escape */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  /* ---- custom amount ---- */
  const applyCustom = () => {
    const v = Number.parseFloat(customVal);
    if (!Number.isFinite(v) || v <= 0) {
      setInputErr("Enter a valid amount");
      return;
    }
    setInputErr("");
    setSelectedAmt(v.toString());
  };

  /* ---- submit tip ---- */
  const handleSubmitTip = () => {
    if (!selectedAmt) return;
    setStep("processing");

    // TODO: replace this simulated tip processing with real logic
    setTimeout(() => {
      setStep("success");
    }, 2500);
  };

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */

  return (
    <div data-uuid={props.id} className="w-full">
      {/* ---- Trigger button (full-width, dark-gray) ---- */}
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl border-none bg-gray-700 text-white text-sm font-semibold cursor-pointer shadow-sm transition-all hover:bg-gray-800 active:scale-[0.97]"
      >
        <CoffeeIcon className="h-[1.1rem] w-[1.1rem]" />
        {title}
      </button>

      {/* ---- Modal ---- */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-[brew-fade-in_0.2s_ease-out]"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div
            className="relative w-full max-h-[92dvh] sm:max-w-[440px] sm:max-h-[85dvh] overflow-y-auto overscroll-contain bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl brew-slide-up sm:brew-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* drag indicator (mobile only) */}
            <div className="block sm:hidden w-9 h-1 mx-auto mt-2 rounded-full bg-slate-300" />

            {/* header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <CoffeeIcon className="h-5 w-5 text-amber-800" />
                <span className="font-bold text-[1.05rem] text-slate-800">
                  {title}
                </span>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex p-1 rounded-lg text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 pb-5">
              {/* ======= STEP: CONNECTING ======= */}
              {step === "connecting" && (
                <div className="flex flex-col items-center justify-center py-12 px-4 gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                    <WalletIcon className="h-6 w-6 text-slate-600 animate-spin" />
                  </div>
                  <p className="font-semibold text-slate-700 text-[0.95rem]">
                    Connecting wallet...
                  </p>
                  <p className="text-xs text-slate-400">
                    Verifying your balance
                  </p>
                  {/* progress bar */}
                  <div className="w-[70%] h-1 rounded-full bg-slate-200 overflow-hidden mt-2">
                    <div className="h-full rounded-full bg-slate-500 brew-progress" />
                  </div>
                </div>
              )}

              {/* ======= STEP: TIP SELECTION ======= */}
              {step === "tip" && (
                <div className="flex flex-col gap-4">
                  {/* balance badge */}
                  {walletBalance && (
                    <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[0.82rem]">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <WalletIcon className="h-3.5 w-3.5" /> Balance
                      </span>
                      <span className="font-bold text-slate-700">
                        {walletBalance} {chain.symbol}
                      </span>
                    </div>
                  )}

                  {/* description */}
                  {description && (
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {description}
                    </p>
                  )}

                  {/* payment address */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 text-xs">
                    <span className="text-slate-400">To:</span>
                    <span className="font-mono text-slate-600">
                      {formatAddress(paymentAddress)}
                    </span>
                  </div>

                  {/* tip amounts */}
                  {parsedTipAmounts.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2 text-[0.82rem] font-semibold text-slate-600">
                        <CoinsIcon className="h-4 w-4 text-amber-800" />
                        Select an amount
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {parsedTipAmounts.map((amt) => {
                          const active = selectedAmt === amt;
                          return (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => {
                                setSelectedAmt(amt);
                                setInputErr("");
                              }}
                              className={`py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-all ${
                                active
                                  ? "border-2 border-gray-700 bg-slate-50 text-slate-900"
                                  : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                              }`}
                            >
                              {amt} {chain.symbol}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* custom amount */}
                  {allowCustom && (
                    <div>
                      <label className="block text-[0.82rem] font-semibold text-slate-600 mb-1.5">
                        Custom amount
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={customVal}
                          onChange={(e) => {
                            setCustomVal(e.target.value);
                            setInputErr("");
                          }}
                          placeholder={`e.g. 3.5 ${chain.symbol}`}
                          className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        />
                        <button
                          type="button"
                          onClick={applyCustom}
                          className="px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 font-semibold text-[0.82rem] text-gray-700 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          Set
                        </button>
                      </div>
                      {inputErr && (
                        <p className="text-xs text-red-600 mt-1">{inputErr}</p>
                      )}
                    </div>
                  )}

                  {/* submit tip */}
                  <button
                    type="button"
                    disabled={!selectedAmt}
                    onClick={handleSubmitTip}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-none font-semibold text-sm transition-colors mt-1 ${
                      selectedAmt
                        ? "bg-gray-700 text-white cursor-pointer hover:bg-gray-800"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <CoffeeIcon className="h-4 w-4" />
                    {selectedAmt
                      ? `${buttonName} — ${selectedAmt} ${chain.symbol}`
                      : buttonName}
                  </button>
                </div>
              )}

              {/* ======= STEP: PROCESSING ======= */}
              {step === "processing" && (
                <div className="flex flex-col items-center justify-center py-12 px-4 gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                    <LoaderIcon className="h-6 w-6 text-slate-600 animate-spin" />
                  </div>
                  <p className="font-semibold text-slate-700 text-[0.95rem]">
                    Processing your tip...
                  </p>
                  <p className="text-xs text-slate-400 text-center">
                    Sending {selectedAmt} {chain.symbol}
                  </p>
                  <div className="w-[70%] h-1 rounded-full bg-slate-200 overflow-hidden mt-2">
                    <div className="h-full rounded-full bg-slate-500 brew-progress-slow" />
                  </div>
                </div>
              )}

              {/* ======= STEP: SUCCESS ======= */}
              {step === "success" && (
                <div className="flex flex-col items-center justify-center pt-10 pb-8 px-4 gap-3">
                  <div className="brew-check-pop w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircleIcon className="h-7 w-7 text-green-600" />
                  </div>
                  <p className="font-bold text-slate-800 text-base">
                    Tip Sent!
                  </p>
                  <p className="text-sm text-slate-500 text-center">
                    You tipped {selectedAmt} {chain.symbol}
                  </p>
                  {thankMessage && (
                    <p className="text-[0.82rem] text-slate-600 text-center px-3.5 py-2.5 bg-slate-50 rounded-lg border border-slate-200 mt-1 leading-relaxed">
                      &ldquo;{thankMessage}&rdquo;
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-3 px-8 py-2.5 rounded-xl border-none bg-gray-700 text-white font-semibold text-sm cursor-pointer hover:bg-gray-800 transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Brew;
