import type { BlockData } from "@/store/useBlockStore";
import getStringFields from "../utils/getStringFields";
import React from "react";
function Svg({ size }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="lucide lucide-mail-check-icon lucide-mail-check"
    >
      <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      <path d="m16 19 2 2 4-4" />
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
  const check = (e: string) => {
    //Regex for email validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(e);
  };
  return (
    <div className="relative w-full max-w-md rounded-xl border border-slate-300 bg-white p-6 shadow-[0_20px_40px_rgba(15,23,42,0.15)]">
      {isSubscribed ? (
        <div className="space-y-3 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <Svg size={24} />
          </span>
          <h2 className="text-lg font-semibold text-slate-800">
            {successTitle}
          </h2>
          <p className="text-sm text-slate-500">{successDescription}</p>
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold text-slate-800 text-center">
            {title}
          </h2>
          <p className="mt-2 text-sm text-slate-500 text-center">
            {description}
          </p>
          <form
            onSubmit={(event) => {
              console.log("Subscribed to newsletter");
              event.preventDefault();
              setIsSubscribed(true);
            }}
            className="mt-6 flex flex-col gap-3"
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
                if (!check(e.target.value) && e.target.value.length > 0) {
                  setError("Invalid email address");
                } else {
                  setError("");
                }
              }}
              placeholder={emailPlaceholder}
              className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <button
              type="submit"
              disabled={!!error}
              className="rounded-xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white shadow-[0_10px_30px_rgba(16,185,129,0.25)] transition hover:opacity-90"
            >
              {buttonText}
            </button>
            {error && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </form>
        </>
      )}
    </div>
  );
}

export default Newsletter;
