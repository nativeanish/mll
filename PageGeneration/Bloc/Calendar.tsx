import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import type { BlockData } from "@/store/useBlockStore";
import getStringFields from "../utils/getStringFields";

/* ─── Types ─── */
interface TimeSlot {
  start: string;
  end: string;
}

interface DayAvailability {
  date: string;
  available: boolean;
  slots: TimeSlot[];
}

type Step = "calendar" | "form" | "confirmed";

/* ─── SVG Icons (hand-crafted) ─── */

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width ?? 20}
      height={props.height ?? 20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width ?? 16}
      height={props.height ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width ?? 14}
      height={props.height ?? 14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width ?? 18}
      height={props.height ?? 18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width ?? 18}
      height={props.height ?? 18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width ?? 20}
      height={props.height ?? 20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width ?? 16}
      height={props.height ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width ?? 16}
      height={props.height ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function NoteIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width ?? 16}
      height={props.height ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 20h9" />
      <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
    </svg>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width ?? 48}
      height={props.height ?? 48}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11.5 14.5 16 9" />
    </svg>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width ?? 16}
      height={props.height ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/* ─── Helpers ─── */

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDateKey(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function generateSlotTimes(
  start: string,
  end: string,
  intervalMin: number,
): string[] {
  const times: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (cur + intervalMin <= endMin) {
    const h = Math.floor(cur / 60);
    const m = cur % 60;
    times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    cur += intervalMin;
  }
  return times;
}

function formatTime12(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function addMinutes(t: string, mins: number): string {
  const [h, m] = t.split(":").map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateLong(d: Date): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return `${days[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

function formatDateShort(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const ACCENT_GRADIENT = "linear-gradient(135deg, #5e5ce6 0%, #bf5af2 100%)";

function parseIntervalMinutes(
  intervalStr: string,
  customIntervalStr: string,
): number {
  const parsedInterval = parseInt(intervalStr);
  if (parsedInterval === 0) {
    const parsedCustom = parseInt(customIntervalStr);
    return parsedCustom > 0 ? parsedCustom : 30;
  }
  return parsedInterval > 0 ? parsedInterval : 30;
}

function useLocalTimezoneLabel(): string {
  return useMemo(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return tz ? tz.replace(/_/g, " ") : "Local time";
    } catch {
      return "Local time";
    }
  }, []);
}

/* ─── useMediaQuery hook ─── */
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false,
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
}

/* ─── Shared input style ─── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px 10px 38px",
  background: "#2c2c2e",
  border: "1px solid #3a3a3c",
  borderRadius: 10,
  color: "#fff",
  fontSize: 14,
  outline: "none",
  transition: "border-color 150ms",
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  paddingLeft: 12,
  minHeight: 72,
  resize: "vertical",
  fontFamily: "inherit",
};

/* ─── Component ─── */

function Calendar({ props }: { props: BlockData }) {
  const {
    title = "",
    description = "",
    timeSlotInterval: intervalStr = "30",
    customInterval: customIntervalStr = "",
  } = getStringFields(props.data, [
    "title",
    "description",
    "timeSlotInterval",
    "customInterval",
  ]);

  const localTimezone = useLocalTimezoneLabel();
  const interval = parseIntervalMinutes(intervalStr, customIntervalStr);

  const isMobile = useIsMobile();

  // Parse availability data
  const dayByDayAvailability: DayAvailability[] = useMemo(() => {
    const raw = props.data.dayByDayAvailability;
    if (!Array.isArray(raw)) return [];
    return raw as DayAvailability[];
  }, [props.data.dayByDayAvailability]);

  const availableDates = useMemo(() => {
    const m = new Map<string, DayAvailability>();
    for (const d of dayByDayAvailability) {
      if (d.available && d.slots.length > 0) {
        m.set(d.date, d);
      }
    }
    return m;
  }, [dayByDayAvailability]);

  const { minDate, maxDate } = useMemo(() => {
    if (dayByDayAvailability.length === 0) {
      return { minDate: new Date(), maxDate: new Date() };
    }
    const sorted = [...dayByDayAvailability].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    return {
      minDate: parseDateKey(sorted[0].date),
      maxDate: parseDateKey(sorted[sorted.length - 1].date),
    };
  }, [dayByDayAvailability]);

  /* ─── Dialog state ─── */
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("calendar");
  const [viewMonth, setViewMonth] = useState(minDate.getMonth());
  const [viewYear, setViewYear] = useState(minDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Form fields
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestNotes, setGuestNotes] = useState("");
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
  }>({});

  const dialogRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when dialog is open
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

  // ESC key closes dialog
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const resetState = useCallback(() => {
    setStep("calendar");
    setSelectedDate(null);
    setSelectedSlot(null);
    setGuestName("");
    setGuestEmail("");
    setGuestNotes("");
    setFormErrors({});
    setViewMonth(minDate.getMonth());
    setViewYear(minDate.getFullYear());
  }, [minDate]);

  const openDialog = () => {
    resetState();
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  /* ─── Calendar logic ─── */
  const calendarGrid = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const cells: Array<{ day: number; dateKey: string } | null> = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, dateKey });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dayData = availableDates.get(selectedDate);
    if (!dayData) return [];
    const allSlots: string[] = [];
    for (const slot of dayData.slots) {
      allSlots.push(...generateSlotTimes(slot.start, slot.end, interval));
    }
    return allSlots;
  }, [selectedDate, availableDates, interval]);

  const canGoPrev =
    viewYear > minDate.getFullYear() ||
    (viewYear === minDate.getFullYear() && viewMonth > minDate.getMonth());
  const canGoNext =
    viewYear < maxDate.getFullYear() ||
    (viewYear === maxDate.getFullYear() && viewMonth < maxDate.getMonth());

  const goToPrevMonth = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };
  const goToNextMonth = () => {
    if (!canGoNext) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDateClick = (dateKey: string) => {
    if (availableDates.has(dateKey)) {
      setSelectedDate(dateKey);
      setSelectedSlot(null);
    }
  };

  const handleSlotClick = (slot: string) => {
    setSelectedSlot(slot);
  };

  const goToForm = () => {
    if (selectedDate && selectedSlot) {
      setStep("form");
    }
  };

  const goBackToCalendar = () => {
    setStep("calendar");
    setFormErrors({});
  };

  const handleSubmit = () => {
    const errors: { name?: string; email?: string } = {};
    if (!guestName.trim()) errors.name = "Name is required";
    if (!guestEmail.trim()) errors.email = "Email is required";
    else if (!isValidEmail(guestEmail.trim()))
      errors.email = "Enter a valid email";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setStep("confirmed");
  };

  const displayTitle = title || "Schedule a Meeting";

  /* ─── Trigger Button ─── */
  const triggerButton = (
    <div data-uuid={props.id} style={{ width: "100%" }}>
      <button
        type="button"
        onClick={openDialog}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "14px 20px",
          background: "#1c1c1e",
          border: "1px solid #2c2c2e",
          borderRadius: 14,
          color: "#fff",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 200ms ease",
          fontFamily: FONT_STACK,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#2c2c2e";
          e.currentTarget.style.borderColor = "#5e5ce6";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(94,92,230,0.25)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#1c1c1e";
          e.currentTarget.style.borderColor = "#2c2c2e";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: ACCENT_GRADIENT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CalendarIcon width={17} height={17} style={{ color: "#fff" }} />
          </span>
          <span>{displayTitle}</span>
        </span>
        <ArrowRightIcon style={{ color: "#636366", flexShrink: 0 }} />
      </button>
    </div>
  );

  if (!open) return triggerButton;

  /* ─── Dialog Content Rendering ─── */

  const renderSidebar = () => (
    <div
      style={{
        padding: isMobile ? "20px 20px 16px" : "28px 24px",
        borderBottom: isMobile ? "1px solid #2c2c2e" : "none",
        borderRight: isMobile ? "none" : "1px solid #2c2c2e",
        flex: isMobile ? "none" : "0 0 240px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: "#161618",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: ACCENT_GRADIENT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <CalendarIcon width={20} height={20} style={{ color: "#fff" }} />
      </div>
      <div>
        <h2
          style={{
            color: "#fff",
            fontSize: 17,
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {displayTitle}
        </h2>
        {description && (
          <p
            style={{
              color: "#8e8e93",
              fontSize: 13,
              marginTop: 6,
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "#a1a1a6",
          }}
        >
          <ClockIcon width={14} height={14} style={{ color: "#636366" }} />
          {interval} min
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "#a1a1a6",
          }}
        >
          <GlobeIcon width={14} height={14} style={{ color: "#636366" }} />
          {localTimezone}
        </span>
      </div>

      {/* Show selection summary when available */}
      {selectedDate && selectedSlot && (
        <div
          style={{
            marginTop: "auto",
            padding: "12px 14px",
            background: "rgba(94,92,230,0.1)",
            border: "1px solid rgba(94,92,230,0.2)",
            borderRadius: 10,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#8e8ce6",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 6,
            }}
          >
            Selected
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#e5e5ea",
              lineHeight: 1.6,
            }}
          >
            {formatDateShort(parseDateKey(selectedDate))}
            <br />
            {formatTime12(selectedSlot)} –{" "}
            {formatTime12(addMinutes(selectedSlot, interval))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCalendarStep = () => (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        overflowX: "hidden",
        overflowY: isMobile ? "visible" : "hidden",
        minHeight: 0,
      }}
    >
      {/* Calendar Grid */}
      <div
        style={{
          flex: isMobile ? "none" : selectedDate ? "0 0 58%" : "1",
          padding: isMobile ? "16px 20px" : "24px",
          borderBottom: isMobile && selectedDate ? "1px solid #2c2c2e" : "none",
          borderRight: !isMobile && selectedDate ? "1px solid #2c2c2e" : "none",
          transition: "all 0.25s ease",
        }}
      >
        {/* Month Nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <button
            type="button"
            onClick={goToPrevMonth}
            disabled={!canGoPrev}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: canGoPrev ? "#2c2c2e" : "transparent",
              border: "none",
              color: canGoPrev ? "#fff" : "#3a3a3c",
              cursor: canGoPrev ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 150ms",
            }}
            onMouseEnter={(e) => {
              if (canGoPrev) e.currentTarget.style.background = "#3a3a3c";
            }}
            onMouseLeave={(e) => {
              if (canGoPrev) e.currentTarget.style.background = "#2c2c2e";
            }}
          >
            <ChevronLeft width={16} height={16} />
          </button>
          <span
            style={{
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.01em",
            }}
          >
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={goToNextMonth}
            disabled={!canGoNext}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: canGoNext ? "#2c2c2e" : "transparent",
              border: "none",
              color: canGoNext ? "#fff" : "#3a3a3c",
              cursor: canGoNext ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 150ms",
            }}
            onMouseEnter={(e) => {
              if (canGoNext) e.currentTarget.style.background = "#3a3a3c";
            }}
            onMouseLeave={(e) => {
              if (canGoNext) e.currentTarget.style.background = "#2c2c2e";
            }}
          >
            <ChevronRight width={16} height={16} />
          </button>
        </div>

        {/* Day headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            marginBottom: 6,
          }}
        >
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              style={{
                textAlign: "center",
                fontSize: 11,
                fontWeight: 500,
                color: "#636366",
                padding: "0 0 6px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 2,
          }}
        >
          {calendarGrid.map((cell, idx) => {
            if (!cell) {
              return (
                <div
                  key={`empty-${idx}`}
                  style={{ aspectRatio: "1", minHeight: isMobile ? 36 : 40 }}
                />
              );
            }
            const isAvailable = availableDates.has(cell.dateKey);
            const isSelected = selectedDate === cell.dateKey;
            const isToday = toDateKey(new Date()) === cell.dateKey;

            return (
              <button
                key={cell.dateKey}
                type="button"
                onClick={() => handleDateClick(cell.dateKey)}
                disabled={!isAvailable}
                style={{
                  aspectRatio: "1",
                  minHeight: isMobile ? 36 : 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 10,
                  border: isToday && !isSelected ? "1px solid #5e5ce6" : "none",
                  background: isSelected ? "#5e5ce6" : "transparent",
                  color: isSelected ? "#fff" : isAvailable ? "#fff" : "#3a3a3c",
                  fontSize: 13,
                  fontWeight: isSelected || isToday ? 600 : 400,
                  cursor: isAvailable ? "pointer" : "default",
                  transition: "all 150ms ease",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (isAvailable && !isSelected)
                    e.currentTarget.style.background = "#2c2c2e";
                }}
                onMouseLeave={(e) => {
                  if (isAvailable && !isSelected)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                {cell.day}
                {isAvailable && !isSelected && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 3,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#5e5ce6",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots Panel */}
      {selectedDate && (
        <div
          style={{
            flex: isMobile ? "none" : "1",
            padding: isMobile ? "16px 20px" : "24px 20px",
            display: "flex",
            flexDirection: "column",
            animation: "calSlideIn 0.2s ease",
            maxHeight: "none",
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <h3
              style={{
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                margin: 0,
              }}
            >
              {formatDateLong(parseDateKey(selectedDate))}
            </h3>
            <p
              style={{
                color: "#636366",
                fontSize: 12,
                marginTop: 3,
              }}
            >
              {availableSlots.length} slot
              {availableSlots.length !== 1 ? "s" : ""} available
            </p>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 5,
              paddingRight: 4,
            }}
          >
            {availableSlots.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 0",
                  color: "#636366",
                  fontSize: 13,
                }}
              >
                No available slots
              </div>
            ) : (
              availableSlots.map((slot) => {
                const end = addMinutes(slot, interval);
                const isActive = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleSlotClick(slot)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: isActive ? "space-between" : "center",
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: isActive
                        ? "1.5px solid #5e5ce6"
                        : "1px solid #3a3a3c",
                      background: isActive
                        ? "rgba(94,92,230,0.15)"
                        : "transparent",
                      color: isActive ? "#a5a3ff" : "#e5e5ea",
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      cursor: "pointer",
                      transition: "all 150ms ease",
                      textAlign: "center",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = "#5e5ce6";
                        e.currentTarget.style.color = "#a5a3ff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = "#3a3a3c";
                        e.currentTarget.style.color = "#e5e5ea";
                      }
                    }}
                  >
                    <span>
                      {formatTime12(slot)} – {formatTime12(end)}
                    </span>
                    {isActive && (
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "#5e5ce6",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Next button */}
          {selectedSlot && (
            <button
              type="button"
              onClick={goToForm}
              style={{
                marginTop: 14,
                width: "100%",
                padding: "11px 0",
                borderRadius: 10,
                border: "none",
                background: ACCENT_GRADIENT,
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "opacity 150ms, transform 150ms",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Next
              <ArrowRightIcon width={15} height={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderFormStep = () => {
    if (!selectedDate || !selectedSlot) return null;
    const dateObj = parseDateKey(selectedDate);

    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: isMobile ? "20px" : "28px 32px",
          animation: "calSlideIn 0.2s ease",
          overflowY: "auto",
        }}
      >
        {/* Back */}
        <button
          type="button"
          onClick={goBackToCalendar}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "none",
            border: "none",
            color: "#8e8e93",
            fontSize: 12,
            cursor: "pointer",
            padding: 0,
            marginBottom: 16,
            alignSelf: "flex-start",
          }}
        >
          <ChevronLeft width={14} height={14} /> Back
        </button>

        <h3
          style={{
            color: "#fff",
            fontSize: 17,
            fontWeight: 700,
            margin: "0 0 4px",
          }}
        >
          Enter your details
        </h3>
        <p style={{ color: "#636366", fontSize: 13, margin: "0 0 20px" }}>
          {formatDateLong(dateObj)} &middot; {formatTime12(selectedSlot)} –{" "}
          {formatTime12(addMinutes(selectedSlot, interval))}
        </p>

        {/* Name */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 500,
              color: "#a1a1a6",
              marginBottom: 6,
            }}
          >
            Name <span style={{ color: "#ff453a" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <UserIcon
              width={15}
              height={15}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#636366",
              }}
            />
            <input
              type="text"
              placeholder="John Doe"
              value={guestName}
              onChange={(e) => {
                setGuestName(e.target.value);
                if (formErrors.name)
                  setFormErrors((p) => ({ ...p, name: undefined }));
              }}
              style={{
                ...inputStyle,
                borderColor: formErrors.name ? "#ff453a" : "#3a3a3c",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = formErrors.name
                  ? "#ff453a"
                  : "#5e5ce6";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = formErrors.name
                  ? "#ff453a"
                  : "#3a3a3c";
              }}
            />
          </div>
          {formErrors.name && (
            <span style={{ fontSize: 11, color: "#ff453a", marginTop: 4 }}>
              {formErrors.name}
            </span>
          )}
        </div>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 500,
              color: "#a1a1a6",
              marginBottom: 6,
            }}
          >
            Email <span style={{ color: "#ff453a" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <MailIcon
              width={15}
              height={15}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#636366",
              }}
            />
            <input
              type="email"
              placeholder="john@example.com"
              value={guestEmail}
              onChange={(e) => {
                setGuestEmail(e.target.value);
                if (formErrors.email)
                  setFormErrors((p) => ({ ...p, email: undefined }));
              }}
              style={{
                ...inputStyle,
                borderColor: formErrors.email ? "#ff453a" : "#3a3a3c",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = formErrors.email
                  ? "#ff453a"
                  : "#5e5ce6";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = formErrors.email
                  ? "#ff453a"
                  : "#3a3a3c";
              }}
            />
          </div>
          {formErrors.email && (
            <span style={{ fontSize: 11, color: "#ff453a", marginTop: 4 }}>
              {formErrors.email}
            </span>
          )}
        </div>

        {/* Notes (optional) */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 500,
              color: "#a1a1a6",
              marginBottom: 6,
            }}
          >
            <NoteIcon width={13} height={13} style={{ color: "#636366" }} />
            Additional details{" "}
            <span style={{ color: "#636366", fontWeight: 400 }}>
              (optional)
            </span>
          </label>
          <textarea
            placeholder="Share anything that will help prepare for the meeting..."
            value={guestNotes}
            onChange={(e) => setGuestNotes(e.target.value)}
            style={textareaStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#5e5ce6";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#3a3a3c";
            }}
          />
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 10,
            border: "none",
            background: ACCENT_GRADIENT,
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "opacity 150ms, transform 150ms",
            marginTop: "auto",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Schedule Meeting
        </button>
      </div>
    );
  };

  const renderConfirmedStep = () => {
    if (!selectedDate || !selectedSlot) return null;
    const dateObj = parseDateKey(selectedDate);

    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobile ? "32px 20px" : "48px 32px",
          animation: "calFadeIn 0.3s ease",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(48,209,88,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <CheckCircleIcon
            width={40}
            height={40}
            style={{ color: "#30d158" }}
          />
        </div>

        <h3
          style={{
            color: "#fff",
            fontSize: 20,
            fontWeight: 700,
            margin: "0 0 6px",
          }}
        >
          You're booked!
        </h3>
        <p style={{ color: "#8e8e93", fontSize: 14, margin: "0 0 28px" }}>
          A calendar invite has been sent to your email.
        </p>

        {/* Summary Card */}
        <div
          style={{
            width: "100%",
            maxWidth: 340,
            background: "#2c2c2e",
            borderRadius: 12,
            padding: "18px 20px",
            textAlign: "left",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#fff",
              marginBottom: 14,
            }}
          >
            {displayTitle}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color: "#e5e5ea",
              }}
            >
              <CalendarIcon
                width={14}
                height={14}
                style={{ color: "#636366", flexShrink: 0 }}
              />
              {formatDateLong(dateObj)}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color: "#e5e5ea",
              }}
            >
              <ClockIcon
                width={14}
                height={14}
                style={{ color: "#636366", flexShrink: 0 }}
              />
              {formatTime12(selectedSlot)} –{" "}
              {formatTime12(addMinutes(selectedSlot, interval))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color: "#8e8e93",
              }}
            >
              <GlobeIcon
                width={14}
                height={14}
                style={{ color: "#636366", flexShrink: 0 }}
              />
              {localTimezone}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color: "#e5e5ea",
              }}
            >
              <UserIcon
                width={14}
                height={14}
                style={{ color: "#636366", flexShrink: 0 }}
              />
              {guestName}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color: "#e5e5ea",
              }}
            >
              <MailIcon
                width={14}
                height={14}
                style={{ color: "#636366", flexShrink: 0 }}
              />
              {guestEmail}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 340 }}>
          <button
            type="button"
            onClick={closeDialog}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 10,
              border: "1px solid #3a3a3c",
              background: "#2c2c2e",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 150ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#3a3a3c";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#2c2c2e";
            }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              resetState();
            }}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 10,
              border: "none",
              background: ACCENT_GRADIENT,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity 150ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            Book another
          </button>
        </div>
      </div>
    );
  };

  /* ─── Dialog Modal ─── */
  return (
    <>
      {triggerButton}

      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          animation: "calFadeIn 0.2s ease",
        }}
        onClick={closeDialog}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={displayTitle}
        style={{
          position: "fixed",
          zIndex: 9999,
          fontFamily: FONT_STACK,
          animation: "calDialogIn 0.25s ease",
          ...(isMobile
            ? {
                inset: 0,
                borderRadius: 0,
              }
            : {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "min(92vw, 780px)",
                maxHeight: "min(90vh, 600px)",
                borderRadius: 16,
              }),
          background: "#1c1c1e",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* Dialog close button */}
        <button
          type="button"
          onClick={closeDialog}
          aria-label="Close"
          style={{
            position: "absolute",
            top: isMobile ? 12 : 14,
            right: isMobile ? 12 : 14,
            zIndex: 10,
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "#2c2c2e",
            border: "none",
            color: "#8e8e93",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 150ms, color 150ms",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#3a3a3c";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#2c2c2e";
            e.currentTarget.style.color = "#8e8e93";
          }}
        >
          <CloseIcon width={16} height={16} />
        </button>

        {/* Step indicator */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            padding: "14px 0 0",
          }}
        >
          {(["calendar", "form", "confirmed"] as Step[]).map((s, i) => (
            <div
              key={s}
              style={{
                width: step === s ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background:
                  step === s
                    ? "#5e5ce6"
                    : (["calendar", "form", "confirmed"] as Step[]).indexOf(
                          step,
                        ) > i
                      ? "#5e5ce6"
                      : "#3a3a3c",
                transition: "all 0.25s ease",
                opacity:
                  (["calendar", "form", "confirmed"] as Step[]).indexOf(step) >
                  i
                    ? 0.5
                    : 1,
              }}
            />
          ))}
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            overflowX: "hidden",
            overflowY: isMobile ? "auto" : "hidden",
            minHeight: 0,
          }}
          className="cal-dialog-body"
        >
          {/* Sidebar - hide on confirmed step for mobile */}
          {!(isMobile && step === "confirmed") && renderSidebar()}

          {/* Main content */}
          {step === "calendar" && renderCalendarStep()}
          {step === "form" && renderFormStep()}
          {step === "confirmed" && renderConfirmedStep()}
        </div>
      </div>

      {/* Keyframes + scrollbar */}
      <style>{`
        @keyframes calSlideIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes calFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes calDialogIn {
          from { opacity: 0; transform: ${isMobile ? "translateY(20px)" : "translate(-50%, -48%)"}; }
          to   { opacity: 1; transform: ${isMobile ? "translateY(0)" : "translate(-50%, -50%)"}; }
        }
        .cal-dialog-body::-webkit-scrollbar {
          width: 6px;
        }
        .cal-dialog-body::-webkit-scrollbar-track {
          background: transparent;
        }
        .cal-dialog-body::-webkit-scrollbar-thumb {
          background: #3a3a3c;
          border-radius: 3px;
        }
        .cal-dialog-body::-webkit-scrollbar-thumb:hover {
          background: #636366;
        }
        .cal-dialog-body {
          scrollbar-width: thin;
          scrollbar-color: #3a3a3c transparent;
        }
        @media (max-width: 640px) {
          .cal-dialog-body {
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </>
  );
}

export default Calendar;
