import type { BlockData } from "@/store/useBlockStore";
import getStringFields from "../utils/getStringFields";
import React from "react";

function MailCheckIcon({ className = "" }: { className?: string }) {
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
      <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      <path d="m16 19 2 2 4-4" />
    </svg>
  );
}

function MailIcon({ className = "" }: { className?: string }) {
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
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function Newsletter({ props }: { props: BlockData }) {
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");

  const {
    title = "Subscribe to our Newsletter",
    description = "Join thousands getting emails in their inbox.",
    emailPlaceholder = "Your email",
    buttonText = "Yeah, thanks!",
    successTitle = "All set!",
    successDescription = "Thanks for subscribing – expect the next update in your inbox soon.",
  } = getStringFields(props.data, [
    "title",
    "description",
    "emailPlaceholder",
    "buttonText",
    "successTitle",
    "successDescription",
  ]);

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white shadow-sm">
      {isSubscribed ? (
        <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
            <MailCheckIcon className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-base font-bold text-slate-800">{successTitle}</h2>
          <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
            {successDescription}
          </p>
        </div>
      ) : (
        <div className="px-5 py-6">
          <div className="flex items-center gap-2.5 mb-1.5">
            <MailIcon className="h-5 w-5 text-slate-400 shrink-0" />
            <h2 className="text-[0.95rem] font-bold text-slate-800">{title}</h2>
          </div>

          {description && (
            <p className="text-sm text-slate-500 leading-relaxed mb-4 ml-[1.875rem]">
              {description}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isValidEmail(email)) {
                setError("Please enter a valid email");
                return;
              }
              // TODO: actual subscribe logic
              setIsSubscribed(true);
            }}
            className="flex flex-col gap-2.5"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              placeholder={emailPlaceholder}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-colors"
            />

            <button
              type="submit"
              className="w-full rounded-lg bg-gray-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 active:scale-[0.98] cursor-pointer"
            >
              {buttonText}
            </button>

            {error && (
              <p className="text-xs text-red-600 mt-0.5" role="alert">
                {error}
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

export default Newsletter;
