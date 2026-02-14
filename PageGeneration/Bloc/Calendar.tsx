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
  background: "#fff",
  border: "3px solid #000",
  borderRadius: 8,
  color: "#000",
  fontSize: 14,
  fontWeight: 500,
  outline: "none",
  transition: "all 150ms",
  boxSizing: "border-box",
  boxShadow: "2px 2px 0px #000",
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
          background: "#fff",
          border: "3px solid #000",
          borderRadius: 8,
          color: "#000",
          fontSize: 15,
          fontWeight: 800,
          cursor: "pointer",
          transition: "all 150ms ease",
          fontFamily: FONT_STACK,
          boxShadow: "4px 4px 0px #000",
          textTransform: "uppercase",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translate(2px, 2px)";
          e.currentTarget.style.boxShadow = "2px 2px 0px #000";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translate(0, 0)";
          e.currentTarget.style.boxShadow = "4px 4px 0px #000";
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "#FFE66D",
              border: "2px solid #000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CalendarIcon width={17} height={17} style={{ color: "#000" }} />
          </span>
          <span>{displayTitle}</span>
        </span>
        <ArrowRightIcon style={{ color: "#000", flexShrink: 0 }} />
      </button>
    </div>
  );

  if (!open) return triggerButton;

  /* ─── Dialog Content Rendering ─── */

  const renderSidebar = () => (
    <div
      style={{
        padding: isMobile ? "20px 20px 16px" : "28px 24px",
        borderBottom: isMobile ? "3px solid #000" : "none",
        borderRight: isMobile ? "none" : "3px solid #000",
        flex: isMobile ? "none" : "0 0 240px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: "#FFE66D",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: "#000",
          border: "2px solid #000",
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
            color: "#000",
            fontSize: 17,
            fontWeight: 900,
            margin: 0,
            lineHeight: 1.3,
            textTransform: "uppercase",
          }}
        >
          {displayTitle}
        </h2>
        {description && (
          <p
            style={{
              color: "#000",
              opacity: 0.7,
              fontSize: 13,
              marginTop: 6,
              lineHeight: 1.5,
              fontWeight: 500,
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
            color: "#000",
            fontWeight: 700,
          }}
        >
          <ClockIcon width={14} height={14} style={{ color: "#000" }} />
          {interval} min
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "#000",
            fontWeight: 700,
          }}
        >
          <GlobeIcon width={14} height={14} style={{ color: "#000" }} />
          {localTimezone}
        </span>
      </div>

      {/* Show selection summary when available */}
      {selectedDate && selectedSlot && (
        <div
          style={{
            marginTop: "auto",
            padding: "12px 14px",
            background: "#fff",
            border: "3px solid #000",
            borderRadius: 8,
            boxShadow: "2px 2px 0px #000",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: "#000",
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
              color: "#000",
              lineHeight: 1.6,
              fontWeight: 500,
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
          borderBottom: isMobile && selectedDate ? "3px solid #000" : "none",
          borderRight: !isMobile && selectedDate ? "3px solid #000" : "none",
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
              background: canGoPrev ? "#fff" : "transparent",
              border: canGoPrev ? "2px solid #000" : "2px solid #ccc",
              color: canGoPrev ? "#000" : "#ccc",
              cursor: canGoPrev ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 150ms",
            }}
            onMouseEnter={(e) => {
              if (canGoPrev) e.currentTarget.style.background = "#FFE66D";
            }}
            onMouseLeave={(e) => {
              if (canGoPrev) e.currentTarget.style.background = "#fff";
            }}
          >
            <ChevronLeft width={16} height={16} />
          </button>
          <span
            style={{
              color: "#000",
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: "0.01em",
              textTransform: "uppercase",
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
              background: canGoNext ? "#fff" : "transparent",
              border: canGoNext ? "2px solid #000" : "2px solid #ccc",
              color: canGoNext ? "#000" : "#ccc",
              cursor: canGoNext ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 150ms",
            }}
            onMouseEnter={(e) => {
              if (canGoNext) e.currentTarget.style.background = "#FFE66D";
            }}
            onMouseLeave={(e) => {
              if (canGoNext) e.currentTarget.style.background = "#fff";
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
                fontWeight: 900,
                color: "#000",
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
                  borderRadius: 8,
                  border: isSelected
                    ? "2px solid #000"
                    : isToday
                      ? "2px solid #000"
                      : isAvailable
                        ? "2px solid #000"
                        : "2px solid transparent",
                  background: isSelected
                    ? "#000"
                    : isToday
                      ? "#FFE66D"
                      : "transparent",
                  color: isSelected ? "#fff" : "#000",
                  fontSize: 13,
                  fontWeight:
                    isSelected || isToday ? 900 : isAvailable ? 700 : 400,
                  cursor: isAvailable ? "pointer" : "default",
                  transition: "all 150ms ease",
                  position: "relative",
                  boxShadow: isSelected ? "2px 2px 0px #000" : "none",
                }}
                onMouseEnter={(e) => {
                  if (isAvailable && !isSelected)
                    e.currentTarget.style.background = "#FFE66D";
                }}
                onMouseLeave={(e) => {
                  if (isAvailable && !isSelected)
                    e.currentTarget.style.background = isToday
                      ? "#FFE66D"
                      : "transparent";
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
                      background: "#000",
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
                color: "#000",
                fontSize: 14,
                fontWeight: 900,
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              {formatDateLong(parseDateKey(selectedDate))}
            </h3>
            <p
              style={{
                color: "#000",
                opacity: 0.7,
                fontSize: 12,
                marginTop: 3,
                fontWeight: 500,
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
                  color: "#000",
                  opacity: 0.5,
                  fontSize: 13,
                  fontWeight: 700,
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
                      border: isActive ? "3px solid #000" : "2px solid #000",
                      background: isActive ? "#FFE66D" : "#fff",
                      color: "#000",
                      fontSize: 13,
                      fontWeight: isActive ? 900 : 600,
                      cursor: "pointer",
                      transition: "all 150ms ease",
                      textAlign: "center",
                      flexShrink: 0,
                      boxShadow: isActive ? "2px 2px 0px #000" : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "#FFE66D";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "#fff";
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
                          background: "#000",
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
                borderRadius: 8,
                border: "3px solid #000",
                background: "#000",
                color: "#fff",
                fontSize: 14,
                fontWeight: 900,
                cursor: "pointer",
                transition: "all 150ms",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                textTransform: "uppercase",
                boxShadow: "4px 4px 0px #000",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translate(2px, 2px)";
                e.currentTarget.style.boxShadow = "2px 2px 0px #000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translate(0, 0)";
                e.currentTarget.style.boxShadow = "4px 4px 0px #000";
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
            border: "2px solid #000",
            borderRadius: 8,
            color: "#000",
            fontSize: 12,
            fontWeight: 900,
            cursor: "pointer",
            padding: "4px 10px",
            marginBottom: 16,
            alignSelf: "flex-start",
            textTransform: "uppercase",
          }}
        >
          <ChevronLeft width={14} height={14} /> Back
        </button>

        <h3
          style={{
            color: "#000",
            fontSize: 17,
            fontWeight: 900,
            margin: "0 0 4px",
            textTransform: "uppercase",
          }}
        >
          Enter your details
        </h3>
        <p
          style={{
            color: "#000",
            opacity: 0.7,
            fontSize: 13,
            fontWeight: 500,
            margin: "0 0 20px",
          }}
        >
          {formatDateLong(dateObj)} &middot; {formatTime12(selectedSlot)} –{" "}
          {formatTime12(addMinutes(selectedSlot, interval))}
        </p>

        {/* Name */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 900,
              color: "#000",
              marginBottom: 6,
              textTransform: "uppercase",
            }}
          >
            Name <span style={{ color: "#000" }}>*</span>
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
                color: "#000",
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
                borderColor: formErrors.name ? "#FF6B6B" : "#000",
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translate(2px, 2px)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "2px 2px 0px #000";
                e.currentTarget.style.transform = "translate(0, 0)";
              }}
            />
          </div>
          {formErrors.name && (
            <span
              style={{
                fontSize: 11,
                color: "#000",
                fontWeight: 700,
                background: "#FF6B6B",
                padding: "2px 6px",
                borderRadius: 4,
                marginTop: 4,
                display: "inline-block",
              }}
            >
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
              fontWeight: 900,
              color: "#000",
              marginBottom: 6,
              textTransform: "uppercase",
            }}
          >
            Email <span style={{ color: "#000" }}>*</span>
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
                color: "#000",
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
                borderColor: formErrors.email ? "#FF6B6B" : "#000",
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translate(2px, 2px)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "2px 2px 0px #000";
                e.currentTarget.style.transform = "translate(0, 0)";
              }}
            />
          </div>
          {formErrors.email && (
            <span
              style={{
                fontSize: 11,
                color: "#000",
                fontWeight: 700,
                background: "#FF6B6B",
                padding: "2px 6px",
                borderRadius: 4,
                marginTop: 4,
                display: "inline-block",
              }}
            >
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
            <NoteIcon width={13} height={13} style={{ color: "#000" }} />
            Additional details{" "}
            <span style={{ color: "#000", opacity: 0.5, fontWeight: 400 }}>
              (optional)
            </span>
          </label>
          <textarea
            placeholder="Share anything that will help prepare for the meeting..."
            value={guestNotes}
            onChange={(e) => setGuestNotes(e.target.value)}
            style={textareaStyle}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translate(2px, 2px)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "2px 2px 0px #000";
              e.currentTarget.style.transform = "translate(0, 0)";
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
            borderRadius: 8,
            border: "3px solid #000",
            background: "#FFE66D",
            color: "#000",
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: "0.5px",
            textTransform: "uppercase" as const,
            cursor: "pointer",
            transition: "transform 150ms, box-shadow 150ms",
            boxShadow: "4px 4px 0px #000",
            marginTop: "auto",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translate(2px, 2px)";
            e.currentTarget.style.boxShadow = "2px 2px 0px #000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translate(0, 0)";
            e.currentTarget.style.boxShadow = "4px 4px 0px #000";
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
            borderRadius: 8,
            background: "#4ECDC4",
            border: "3px solid #000",
            boxShadow: "4px 4px 0px #000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <CheckCircleIcon width={40} height={40} style={{ color: "#000" }} />
        </div>

        <h3
          style={{
            color: "#000",
            fontSize: 20,
            fontWeight: 900,
            margin: "0 0 6px",
          }}
        >
          You're booked!
        </h3>
        <p
          style={{
            color: "#000",
            fontSize: 14,
            margin: "0 0 28px",
            opacity: 0.6,
          }}
        >
          A calendar invite has been sent to your email.
        </p>

        {/* Summary Card */}
        <div
          style={{
            width: "100%",
            maxWidth: 340,
            background: "#FFE66D",
            borderRadius: 8,
            border: "3px solid #000",
            boxShadow: "4px 4px 0px #000",
            padding: "18px 20px",
            textAlign: "left",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#000",
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
                color: "#000",
              }}
            >
              <CalendarIcon
                width={14}
                height={14}
                style={{ color: "#000", flexShrink: 0 }}
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
                style={{ color: "#000", flexShrink: 0 }}
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
                color: "#000",
              }}
            >
              <GlobeIcon
                width={14}
                height={14}
                style={{ color: "#000", flexShrink: 0 }}
              />
              {localTimezone}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color: "#000",
              }}
            >
              <UserIcon
                width={14}
                height={14}
                style={{ color: "#000", flexShrink: 0 }}
              />
              {guestName}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color: "#000",
              }}
            >
              <MailIcon
                width={14}
                height={14}
                style={{ color: "#000", flexShrink: 0 }}
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
              borderRadius: 8,
              border: "2px solid #000",
              background: "#fff",
              color: "#000",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              transition: "transform 150ms, box-shadow 150ms",
              boxShadow: "3px 3px 0px #000",
              textTransform: "uppercase" as const,
              letterSpacing: "0.5px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translate(2px, 2px)";
              e.currentTarget.style.boxShadow = "1px 1px 0px #000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translate(0, 0)";
              e.currentTarget.style.boxShadow = "3px 3px 0px #000";
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
              borderRadius: 8,
              border: "2px solid #000",
              background: "#000",
              color: "#fff",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              transition: "transform 150ms, box-shadow 150ms",
              boxShadow: "3px 3px 0px #000",
              textTransform: "uppercase" as const,
              letterSpacing: "0.5px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translate(2px, 2px)";
              e.currentTarget.style.boxShadow = "1px 1px 0px #000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translate(0, 0)";
              e.currentTarget.style.boxShadow = "3px 3px 0px #000";
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
          background: "rgba(0,0,0,0.5)",
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
                borderRadius: 8,
              }),
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "3px solid #000",
          boxShadow: "8px 8px 0px #000",
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
            borderRadius: 6,
            background: "#fff",
            border: "2px solid #000",
            color: "#000",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 150ms, box-shadow 150ms",
            boxShadow: "2px 2px 0px #000",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translate(2px, 2px)";
            e.currentTarget.style.boxShadow = "0 0 0 #000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translate(0, 0)";
            e.currentTarget.style.boxShadow = "2px 2px 0px #000";
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
                    ? "#000"
                    : (["calendar", "form", "confirmed"] as Step[]).indexOf(
                          step,
                        ) > i
                      ? "#000"
                      : "#ddd",
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
          background: #000;
          border-radius: 3px;
        }
        .cal-dialog-body::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
        .cal-dialog-body {
          scrollbar-width: thin;
          scrollbar-color: #000 transparent;
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
