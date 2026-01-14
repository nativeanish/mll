import { useEffect, useMemo, useState } from "react";
import type { BlockData } from "@/store/useBlockStore";
import getStringFields from "../utils/getStringFields";

function Coffee(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width}
      height={props.height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="lucide lucide-coffee-icon lucide-coffee"
    >
      <path d="M10 2v2" />
      <path d="M14 2v2" />
      <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
      <path d="M6 2v2" />
    </svg>
  );
}

function Wallet(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width}
      height={props.height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="lucide lucide-wallet-icon lucide-wallet"
    >
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  );
}

function Copy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width}
      height={props.height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="lucide lucide-copy-icon lucide-copy"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}
function Coins(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width}
      height={props.height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-coins-icon lucide-coins"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  );
}
type ChainKey = "AO" | "ARIO" | "AR" | "wAR" | string;

const chainMeta: Record<
  ChainKey,
  { label: string; symbol: string; badge: string; accent: string }
> = {
  AO: {
    label: "AO",
    symbol: "AO",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    accent: "text-amber-700",
  },
  ARIO: {
    label: "ARIO",
    symbol: "ARIO",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    accent: "text-emerald-700",
  },
  AR: {
    label: "Arweave",
    symbol: "AR",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
    accent: "text-sky-700",
  },
  wAR: {
    label: "wAR",
    symbol: "wAR",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
    accent: "text-indigo-700",
  },
};

function parseTipAmounts(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((val) => val.trim())
    .filter((val) => val.length > 0)
    .map((val) => Number.parseFloat(val))
    .filter((num) => Number.isFinite(num) && num > 0)
    .map((num) => num.toString())
    .filter((val, idx, arr) => arr.indexOf(val) === idx)
    .sort((a, b) => Number.parseFloat(a) - Number.parseFloat(b));
}

function formatAddress(addr: string): string {
  if (!addr) return "";
  return addr.length > 16 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr;
}

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
    [tipAmounts]
  );
  const [selectedAmount, setSelectedAmount] = useState<string>(
    parsedTipAmounts[0] || ""
  );
  const [customValue, setCustomValue] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle"
  );
  const [inputError, setInputError] = useState<string>("");

  useEffect(() => {
    setSelectedAmount(parsedTipAmounts[0] || "");
  }, [parsedTipAmounts]);

  const chain = chainMeta[selectedChain as ChainKey] || {
    label: selectedChain || "Token",
    symbol: selectedChain || "Token",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    accent: "text-slate-700",
  };

  const onCopy = async () => {
    if (!paymentAddress) return;
    try {
      await navigator.clipboard.writeText(paymentAddress);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 1800);
    } catch (err) {
      console.error(err);
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 1800);
    }
  };

  const onCustomApply = () => {
    const value = Number.parseFloat(customValue);
    if (!Number.isFinite(value) || value <= 0) {
      setInputError("Enter a valid amount");
      return;
    }
    setInputError("");
    setSelectedAmount(value.toString());
  };

  const primaryCtaLabel = selectedAmount
    ? `${buttonName} - ${selectedAmount} ${chain.symbol}`
    : buttonName;
  const buttonDisabled = !paymentAddress || !selectedAmount;

  return (
    <div
      data-uuid={props.id}
      className="w-full max-w-xl mx-auto rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-[0_15px_40px_rgba(15,23,42,0.12)] backdrop-blur"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700 shadow-inner">
          <Coffee className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${chain.badge}`}
            >
              <Wallet className="h-3.5 w-3.5" />
              {chain.label}
            </span>
          </div>
          {description && (
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Payment Address
          </div>
          <button
            type="button"
            onClick={onCopy}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-amber-300 hover:text-amber-800"
          >
            <Copy className="h-3.5 w-3.5" />
            {copyStatus === "copied" ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 font-mono text-xs text-slate-800">
          <span>{formatAddress(paymentAddress)}</span>
          {copyStatus === "error" && (
            <span className="text-red-600">Copy failed</span>
          )}
        </div>
      </div>

      {parsedTipAmounts.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
            <Coins className="h-4 w-4 text-amber-600" />
            Select an amount
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {parsedTipAmounts.map((amt) => {
              const isSelected = selectedAmount === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setSelectedAmount(amt)}
                  className={`w-full rounded-xl border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-300 ${
                    isSelected
                      ? "border-amber-400 bg-amber-50 text-amber-900 shadow-sm"
                      : "border-slate-200 bg-white text-slate-800 hover:border-amber-200"
                  }`}
                >
                  {amt} {chain.symbol}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {allowCustom && (
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium text-slate-800">
            Custom amount
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="number"
              min="0"
              step="0.01"
              value={customValue}
              onChange={(e) => {
                setCustomValue(e.target.value);
                setInputError("");
              }}
              placeholder={`e.g. 3.5 ${chain.symbol}`}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
            <button
              type="button"
              onClick={onCustomApply}
              className="inline-flex items-center justify-center rounded-lg border border-amber-400 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
            >
              Set amount
            </button>
          </div>
          {inputError && <p className="text-xs text-red-600">{inputError}</p>}
        </div>
      )}

      <div className="mt-6 space-y-2">
        <button
          type="button"
          disabled={buttonDisabled}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            buttonDisabled
              ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-500"
              : "border border-amber-500 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white hover:brightness-105 focus:ring-amber-300"
          }`}
        >
          <Coffee className="h-4 w-4" />
          <span>{primaryCtaLabel}</span>
        </button>
        <p className={`text-xs ${chain.accent}`}>
          Send {selectedAmount || "an"} {chain.symbol} tip to support this
          creator.
        </p>
        {thankMessage && (
          <p className="text-xs text-slate-600">{thankMessage}</p>
        )}
      </div>
    </div>
  );
}

export default Brew;
