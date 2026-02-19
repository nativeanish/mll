import NavBar from "@/Blocks/UI/NavBar";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Shield,
  KeyRound,
  Upload,
  Network,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Lock,
  Sparkles,
  Wallet,
  RefreshCw,
  PartyPopper,
  Zap,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  generateArweaveWallet,
  type GeneratedArweaveWallet,
} from "@/utils/wallet/keygeneration";
import encrypt from "@/utils/wallet/utils/encrypt";
import { create } from "@/utils/wallet/utils/createData";
import upload from "@/utils/wallet/utils/upload";

/* ─── Types ────────────────────────────────────────── */
type StepStatus = "idle" | "running" | "waiting" | "success" | "error";

interface Step {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  bgColor: string;
  accentColor: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: "Generating Wallet",
    subtitle: "Key Creation",
    description:
      "We're generating a unique cryptographic key pair. This is the foundation of your decentralized identity.",
    icon: KeyRound,
    bgColor: "bg-nb-yellow",
    accentColor: "#ffe66d",
  },
  {
    id: 2,
    title: "Encrypt Keys",
    subtitle: "Security Layer",
    description:
      "Sign a transaction with your wallet to encrypt your private keys. They'll never be stored in plain text.",
    icon: Lock,
    bgColor: "bg-nb-teal",
    accentColor: "#4ecdc4",
  },
  {
    id: 3,
    title: "Upload to Arweave",
    subtitle: "Permanent Storage",
    description:
      "Uploading your encrypted keys to the Arweave network for permanent, decentralized storage.",
    icon: Upload,
    bgColor: "bg-nb-coral",
    accentColor: "#ff6b6b",
  },
  {
    id: 4,
    title: "Register on Metalinks",
    subtitle: "Network Identity",
    description:
      "Sign to register your wallet address on the Metalinks network and claim your identity.",
    icon: Network,
    bgColor: "bg-nb-purple",
    accentColor: "#a855f7",
  },
  {
    id: 5,
    title: "All Set!",
    subtitle: "Complete",
    description: "Your wallet is live. Welcome to the decentralized web.",
    icon: PartyPopper,
    bgColor: "bg-nb-mint",
    accentColor: "#a8e6cf",
  },
];

/* ─── Confetti burst (on final success) ────────────── */
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 1.5 + Math.random() * 1.5,
        color: [
          "#ffe66d",
          "#4ecdc4",
          "#ff6b6b",
          "#a855f7",
          "#ff9f43",
          "#a8e6cf",
        ][i % 6],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
      })),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: "-5%",
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            border: "1px solid rgba(0,0,0,0.3)",
            transform: `rotate(${p.rotation}deg)`,
            animation: `confettiFall ${p.dur}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Dot grid background ──────────────────────────── */
function DotGrid() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage:
          "radial-gradient(circle, var(--border) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        opacity: 0.08,
      }}
    />
  );
}

/* ─── Floating shapes ──────────────────────────────── */
function FloatingShapes() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-nb-yellow/15 border-2 border-border/10 rounded-2xl rotate-12 animate-[float_8s_ease-in-out_infinite]" />
      <div className="absolute top-24 -right-10 w-36 h-36 bg-nb-coral/15 border-2 border-border/10 rounded-full animate-[float_10s_ease-in-out_infinite_1s]" />
      <div className="absolute bottom-20 left-8 w-24 h-24 bg-nb-teal/15 border-2 border-border/10 rotate-45 animate-[float_9s_ease-in-out_infinite_0.5s]" />
      <div className="absolute -bottom-8 right-16 w-40 h-40 bg-nb-purple/10 border-2 border-border/10 rounded-2xl -rotate-6 animate-[float_11s_ease-in-out_infinite_2s]" />
    </div>
  );
}

/* ─── Segmented progress ───────────────────────────── */
function SegmentedProgress({
  current,
  total,
  statuses,
}: {
  current: number;
  total: number;
  statuses: StepStatus[];
}) {
  return (
    <div className="flex items-center gap-1.5 w-full max-w-sm">
      {Array.from({ length: total }, (_, i) => {
        const done = statuses[i] === "success";
        const active = i === current - 1;
        return (
          <div
            key={i}
            className={`
              h-2 flex-1 rounded-full border border-border/60 transition-all duration-500
              ${done ? "bg-nb-teal" : active ? "bg-nb-yellow animate-pulse" : "bg-muted"}
            `}
          />
        );
      })}
    </div>
  );
}

/* ─── Vertical timeline (left rail) ────────────────── */
function Timeline({
  steps,
  currentStep,
  stepStatuses,
}: {
  steps: Step[];
  currentStep: number;
  stepStatuses: StepStatus[];
}) {
  return (
    <div className="hidden md:flex flex-col items-center gap-0 select-none">
      {steps.map((step, idx) => {
        const status = stepStatuses[idx];
        const active = currentStep === step.id;
        const done = status === "success";
        const upcoming = step.id > currentStep;
        const StepIcon = step.icon;
        return (
          <div key={step.id} className="flex flex-col items-center">
            {/* Node */}
            <div
              className={`
                relative z-10 flex items-center justify-center w-12 h-12 rounded-xl border-2 border-border
                transition-all duration-400
                ${done ? "bg-nb-mint shadow-[2px_2px_0px_var(--border)] scale-100" : ""}
                ${active ? `${step.bgColor} shadow-[4px_4px_0px_var(--border)] scale-110` : ""}
                ${upcoming ? "bg-muted/60 shadow-[1px_1px_0px_var(--border)] opacity-50" : ""}
                ${status === "error" ? "bg-destructive/20 shadow-[2px_2px_0px_var(--border)]" : ""}
              `}
            >
              {done ? (
                <CheckCircle2 className="w-5 h-5 text-black" />
              ) : active && status === "running" ? (
                <Loader2 className="w-5 h-5 text-black animate-spin" />
              ) : active && status === "error" ? (
                <AlertTriangle className="w-5 h-5 text-destructive" />
              ) : (
                <StepIcon
                  className={`w-5 h-5 ${active ? "text-black" : "text-foreground/40"}`}
                />
              )}
              {active && status !== "error" && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-nb-coral rounded-full border border-border animate-ping" />
              )}
            </div>
            {/* Connector */}
            {idx < steps.length - 1 && (
              <div
                className={`w-0.5 h-10 transition-all duration-500 ${done ? "bg-nb-teal" : "bg-border/30"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Mobile step pills ────────────────────────────── */
function MobileStepPills({
  steps,
  currentStep,
  stepStatuses,
}: {
  steps: Step[];
  currentStep: number;
  stepStatuses: StepStatus[];
}) {
  return (
    <div className="flex md:hidden items-center justify-center gap-2 flex-wrap">
      {steps.map((step, idx) => {
        const status = stepStatuses[idx];
        const active = currentStep === step.id;
        const done = status === "success";
        const StepIcon = step.icon;
        return (
          <div
            key={step.id}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 border-border text-xs font-bold uppercase tracking-wide
              transition-all duration-300
              ${done ? "bg-nb-mint shadow-[2px_2px_0px_var(--border)] text-black" : ""}
              ${active ? `${step.bgColor} shadow-[3px_3px_0px_var(--border)] text-black scale-105` : ""}
              ${!done && !active ? "bg-muted/50 text-muted-foreground shadow-[1px_1px_0px_var(--border)] opacity-60" : ""}
            `}
          >
            {done ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : active && status === "running" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <StepIcon className="w-3 h-3" />
            )}
            <span className={active ? "inline" : "hidden sm:inline"}>
              {step.id}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Hero step card ───────────────────────────────── */
function HeroCard({
  step,
  status,
  onAction,
  onRetry,
}: {
  step: Step;
  status: StepStatus;
  onAction: () => void;
  onRetry: () => void;
}) {
  const StepIcon = step.icon;

  return (
    <div className="relative w-full animate-[cardIn_0.45s_ease-out]">
      {/* Shadow layer */}
      <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl bg-border/80" />
      {/* Card */}
      <div className="relative rounded-2xl border-2 border-border bg-card overflow-hidden">
        {/* Colored header strip */}
        <div
          className={`${step.bgColor} px-6 py-4 md:px-8 md:py-5 border-b-2 border-border`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-black/10 border-2 border-black/20">
                <StepIcon className="w-5 h-5 md:w-6 md:h-6 text-black" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.15em] text-black/60">
                  {step.subtitle}
                </p>
                <h2 className="text-lg md:text-2xl font-black text-black leading-tight">
                  {step.title}
                </h2>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/10 border border-black/20">
              <span className="text-xs font-mono font-bold text-black">
                {step.id}/{STEPS.length}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 md:px-8 md:py-8">
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-8 max-w-md">
            {step.description}
          </p>

          {/* ── Running ── */}
          {status === "running" && (
            <div className="flex flex-col items-center gap-5 py-4 animate-[fadeIn_0.3s_ease]">
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-2xl border-2 border-border shadow-[4px_4px_0px_var(--border)] flex items-center justify-center"
                  style={{ backgroundColor: `${step.accentColor}30` }}
                >
                  <Loader2 className="w-9 h-9 text-foreground animate-spin" />
                </div>
                {/* Orbiting dot */}
                <div className="absolute w-4 h-4 rounded-full border-2 border-border bg-nb-yellow shadow-[1px_1px_0px_var(--border)] animate-[orbit_2s_linear_infinite] top-0 left-0" />
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-nb-teal border border-border"
                      style={{
                        animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Working on it...
                </span>
              </div>
            </div>
          )}

          {/* ── Waiting for wallet ── */}
          {status === "waiting" && (
            <div className="flex flex-col items-center gap-5 py-4 animate-[fadeIn_0.3s_ease]">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl border-2 border-border bg-nb-yellow/20 shadow-[4px_4px_0px_var(--border)] flex items-center justify-center">
                  <Wallet className="w-9 h-9 text-foreground animate-[wiggle_1.5s_ease-in-out_infinite]" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-nb-orange rounded-lg border-2 border-border shadow-[2px_2px_0px_var(--border)] flex items-center justify-center animate-bounce">
                  <Zap className="w-3.5 h-3.5 text-black" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-black text-foreground uppercase tracking-wide">
                  Wallet Approval Needed
                </p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Your wallet will prompt you to confirm a transaction.
                </p>
              </div>
              <Button
                onClick={onAction}
                className="group relative rounded-xl bg-nb-yellow text-black border-2 border-border px-8 py-3 h-auto font-black text-sm uppercase tracking-widest shadow-[5px_5px_0px_var(--border)] hover:shadow-[7px_7px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_var(--border)] transition-all duration-150"
              >
                <Shield className="w-4 h-4 mr-2 group-hover:animate-[wiggle_0.4s_ease]" />
                Sign Transaction
              </Button>
            </div>
          )}

          {/* ── Error ── */}
          {status === "error" && (
            <div className="flex flex-col items-center gap-5 py-4 animate-[shake_0.4s_ease]">
              <div className="w-20 h-20 rounded-2xl border-2 border-border bg-destructive/15 shadow-[4px_4px_0px_var(--border)] flex items-center justify-center">
                <AlertTriangle className="w-9 h-9 text-destructive" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-black text-destructive uppercase tracking-wide">
                  Transaction Rejected
                </p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  The transaction was cancelled or failed. No worries — you can
                  try again.
                </p>
              </div>
              <Button
                onClick={onRetry}
                className="rounded-xl bg-nb-coral text-black border-2 border-border px-8 py-3 h-auto font-black text-sm uppercase tracking-widest shadow-[5px_5px_0px_var(--border)] hover:shadow-[7px_7px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_var(--border)] transition-all duration-150"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* ── Success (mid-step) ── */}
          {status === "success" && step.id < STEPS.length && (
            <div className="flex flex-col items-center gap-4 py-4 animate-[scaleIn_0.35s_ease-out]">
              <div className="w-16 h-16 rounded-2xl border-2 border-border bg-nb-mint shadow-[3px_3px_0px_var(--border)] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-black" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-nb-teal">
                Step complete — moving on...
              </p>
            </div>
          )}

          {/* ── Final success ── */}
          {status === "success" && step.id === STEPS.length && (
            <div className="flex flex-col items-center gap-5 py-6 animate-[scaleIn_0.4s_ease-out]">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl border-2 border-border bg-nb-mint shadow-[6px_6px_0px_var(--border)] flex items-center justify-center">
                  <PartyPopper className="w-12 h-12 text-black" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-nb-yellow rounded-lg border-2 border-border shadow-[2px_2px_0px_var(--border)] flex items-center justify-center animate-bounce">
                  <Sparkles className="w-4 h-4 text-black" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-nb-coral rounded-md border-2 border-border shadow-[1px_1px_0px_var(--border)] animate-ping" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl md:text-2xl font-black text-foreground">
                  Welcome to Metalinks!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your decentralized identity is ready.
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg border border-border">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                <span className="text-xs font-mono font-bold text-muted-foreground">
                  Redirecting to dashboard...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Checking wallet overlay ──────────────────────── */
function CheckingWallet() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-[slideUp_0.4s_ease-out]">
      <div className="relative">
        {/* Glow ring */}
        <div className="absolute inset-0 -m-4 rounded-3xl bg-nb-yellow/20 animate-[pulse_2s_ease-in-out_infinite]" />
        <div className="relative w-28 h-28 rounded-2xl border-2 border-border bg-nb-yellow shadow-[6px_6px_0px_var(--border)] flex items-center justify-center">
          <Network className="w-14 h-14 text-black" />
        </div>
        <div className="absolute -top-3 -right-3 w-10 h-10 bg-nb-teal rounded-xl border-2 border-border shadow-[3px_3px_0px_var(--border)] flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-black animate-spin" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
          Checking Network
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          Looking up your wallet on the Metalinks network...
        </p>
      </div>
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-3 h-3 bg-nb-coral rounded-md border border-border"
            style={{
              animation: `bounce 1.4s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */
function WalletGeneration() {
  const [phase, setPhase] = useState<"checking" | "generating">("checking");
  const [currentStep, setCurrentStep] = useState(1);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    STEPS.map(() => "idle"),
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [generatedWallet, setGeneratedWallet] =
    useState<GeneratedArweaveWallet | null>(null);
  const [encryptedWalletData, setEncryptedWalletData] = useState<unknown>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const updateStatus = useCallback((idx: number, status: StepStatus) => {
    setStepStatuses((prev) => {
      const next = [...prev];
      next[idx] = status;
      return next;
    });
  }, []);

  /* Phase 0: check wallet */
  useEffect(() => {
    const t = setTimeout(() => setPhase("generating"), 2500);
    return () => clearTimeout(t);
  }, []);

  /* Auto-advance */
  const runStep = useCallback(
    (stepIdx: number) => {
      const step = STEPS[stepIdx];
      if (!step) return;
      if (step.id === 2 || step.id === 4) {
        updateStatus(stepIdx, "waiting");
        return;
      }

      if (step.id === 3) {
        updateStatus(stepIdx, "running");
        void (async () => {
          try {
            if (!(encryptedWalletData instanceof ArrayBuffer)) {
              throw new Error("No encrypted wallet data found to upload");
            }

            const txId = await upload(encryptedWalletData);
            console.log("Upload result:", txId);

            updateStatus(stepIdx, "success");
            setTimeout(() => setCurrentStep(4), 700);
          } catch (error) {
            console.error("Wallet upload failed:", error);
            updateStatus(stepIdx, "error");
          }
        })();
        return;
      }

      if (step.id === 1) {
        void generateArweaveWallet()
          .then((wallet) => {
            setGeneratedWallet(wallet);
            console.log("Wallet JWK:", wallet.jwk);
            console.log("Address:", wallet.address);
            console.log("Public Key (n):", wallet.publicKey);
          })
          .catch((error) => {
            console.error("Wallet generation failed:", error);
          });
      }

      updateStatus(stepIdx, "running");
      const delay = step.id === 5 ? 1500 : 2000 + Math.random() * 1000;
      timerRef.current = setTimeout(() => {
        updateStatus(stepIdx, "success");
        if (step.id === STEPS.length) {
          setShowConfetti(true);
          setTimeout(() => (window.location.href = "/"), 3000);
        } else {
          setTimeout(() => setCurrentStep(step.id + 1), 700);
        }
      }, delay);
    },
    [encryptedWalletData, updateStatus],
  );

  useEffect(() => {
    if (phase !== "generating") return;
    const idx = currentStep - 1;
    if (stepStatuses[idx] === "idle") runStep(idx);
  }, [phase, currentStep, stepStatuses, runStep]);

  /* Sign transaction */
  const handleSign = useCallback(() => {
    const idx = currentStep - 1;
    updateStatus(idx, "running");

    if (currentStep === 2) {
      void (async () => {
        try {
          if (!generatedWallet) {
            throw new Error("No generated wallet found to encrypt");
          }

          const encrypted = await encrypt(JSON.stringify(generatedWallet.jwk));
          if (!encrypted) {
            throw new Error("Encryption returned null or undefined");
          }
          const dat = await create(encrypted);
          console.log("Encrypted wallet data:", dat);
          if (!dat) {
            throw new Error("Failed to create encrypted data item");
          }
          setEncryptedWalletData(dat);
          updateStatus(idx, "success");
          setCurrentStep(3);
        } catch (error) {
          console.error("Wallet encryption failed:", error);
          updateStatus(idx, "error");
        }
      })();
      return;
    }

    timerRef.current = setTimeout(() => {
      const ok = Math.random() > 0.2;
      if (ok) {
        updateStatus(idx, "success");
        if (STEPS[idx].id === STEPS.length) {
          setShowConfetti(true);
          setTimeout(() => (window.location.href = "/"), 3000);
        } else {
          setTimeout(() => setCurrentStep(currentStep + 1), 700);
        }
      } else {
        updateStatus(idx, "error");
      }
    }, 1800);
  }, [currentStep, generatedWallet, updateStatus]);

  /* Retry */
  const handleRetry = useCallback(() => {
    const idx = currentStep - 1;
    const step = STEPS[idx];
    if (step.id === 2 || step.id === 4) updateStatus(idx, "waiting");
    else runStep(idx);
  }, [currentStep, runStep, updateStatus]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (!generatedWallet) return;
    console.log("Stored generated wallet in state:", generatedWallet);
  }, [generatedWallet]);

  useEffect(() => {
    if (!encryptedWalletData) return;
    console.log("Stored encrypted wallet in state:", encryptedWalletData);
  }, [encryptedWalletData]);

  const doneCount = stepStatuses.filter((s) => s === "success").length;

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <NavBar showNotifications={false} showPublishButton={false} />
      <DotGrid />
      <FloatingShapes />
      {showConfetti && <Confetti />}

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-12">
        {phase === "checking" ? (
          <CheckingWallet />
        ) : (
          <div className="w-full max-w-2xl flex flex-col items-center gap-8 animate-[slideUp_0.45s_ease-out]">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-nb-yellow/30 border-2 border-border rounded-xl shadow-[2px_2px_0px_var(--border)]">
                <Sparkles className="w-3.5 h-3.5 text-foreground" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
                  Wallet Setup
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight">
                Creating Your Wallet
              </h1>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {doneCount}/{STEPS.length} steps complete — your decentralized
                identity is almost ready
              </p>
            </div>

            {/* Segmented progress */}
            <SegmentedProgress
              current={currentStep}
              total={STEPS.length}
              statuses={stepStatuses}
            />

            {/* Mobile step pills */}
            <MobileStepPills
              steps={STEPS}
              currentStep={currentStep}
              stepStatuses={stepStatuses}
            />

            {/* Desktop: timeline + card */}
            <div className="w-full flex gap-8 items-start">
              <Timeline
                steps={STEPS}
                currentStep={currentStep}
                stepStatuses={stepStatuses}
              />
              <div className="flex-1 min-w-0">
                <HeroCard
                  key={currentStep}
                  step={STEPS[currentStep - 1]}
                  status={stepStatuses[currentStep - 1]}
                  onAction={handleSign}
                  onRetry={handleRetry}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(44px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(44px) rotate(-360deg); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default WalletGeneration;
