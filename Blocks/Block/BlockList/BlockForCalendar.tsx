import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
const discard_timezone = ["Europe/Uzhhorod", "Europe/Zaporizhzhia"];
interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface DayAvailability {
  date: string;
  available: boolean;
  slots: TimeSlot[];
}

interface CalendarBlockData {
  title: string;
  description: string;
  timezone: string;
  dateRange: DateRange | undefined;
  defaultTimeSlots: TimeSlot[];
  weeklyAvailability: {
    sunday: boolean;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
  };
  timeSlotInterval: number;
  customInterval: string;
  dayByDayAvailability: DayAvailability[];
}

const PRESET_INTERVALS = [
  { value: 5, label: "5 minutes" },
  { value: 10, label: "10 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 25, label: "25 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 35, label: "35 minutes" },
  { value: 40, label: "40 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 50, label: "50 minutes" },
  { value: 55, label: "55 minutes" },
  { value: 60, label: "60 minutes" },
  { value: 0, label: "Custom" },
];

const WEEKDAYS = [
  { key: "sunday" as const, label: "Sun" },
  { key: "monday" as const, label: "Mon" },
  { key: "tuesday" as const, label: "Tue" },
  { key: "wednesday" as const, label: "Wed" },
  { key: "thursday" as const, label: "Thu" },
  { key: "friday" as const, label: "Fri" },
  { key: "saturday" as const, label: "Sat" },
];

function BlockForCalendar({ isEdit, setError }: Props) {
  const toLocalDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [timezone, setTimezone] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const [blockData, setBlockData] = useState<CalendarBlockData>({
    title: "",
    description: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateRange: undefined,
    defaultTimeSlots: [{ start: "09:00", end: "17:00" }],
    weeklyAvailability: {
      sunday: false,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
    },
    timeSlotInterval: 30,
    customInterval: "",
    dayByDayAvailability: [],
  });

  const timezone_data = useQuery({
    queryKey: ["timezones"],
    queryFn: async () => {
      const res = await fetch(
        "https://arweave.net/8kcrMR_jflTOqkGED1EmQaTYjy1Jjj8lMZ7Qa4h2P7Q"
      );
      if (!res.ok) {
        toast.error("Failed to load timezone data");
        throw new Error("Failed to fetch timezones");
      }
      return res.json();
    },
  });

  useEffect(() => {
    if (timezone_data.data) {
      if (Array.isArray(timezone_data.data)) {
        const dt = timezone_data.data as Array<{
          value: string;
          abbr: string;
          offset: number;
          isdt: false;
          text: string;
          utc: Array<string>;
        }>;
        const fs: Array<{ value: string; label: string }> = [];
        const seen = new Set<string>();
        dt.forEach((tz) => {
          tz.utc.forEach((utcZone) => {
            if (!seen.has(utcZone) && !discard_timezone.includes(utcZone)) {
              seen.add(utcZone);
              fs.push({ value: String(tz.offset), label: utcZone });
            }
          });
        });
        setTimezone(fs);
      }
    }
  }, [timezone_data.data]);

  const [showDayEditor, setShowDayEditor] = useState(false);

  useEffect(() => {
    if (
      !blockData.title ||
      !blockData.dateRange?.from ||
      !blockData.dateRange?.to
    ) {
      setError(true);
    } else if (blockData.dateRange?.from && blockData.dateRange?.to) {
      const daysDiff = Math.ceil(
        (blockData.dateRange.to.getTime() -
          blockData.dateRange.from.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysDiff > 60) {
        setError(true);
      } else {
        setError(false);
      }
    } else {
      setError(false);
    }
  }, [blockData.title, blockData.dateRange, setError]);

  useEffect(() => {
    if (blockData.dateRange?.from && blockData.dateRange?.to) {
      const from = blockData.dateRange.from;
      const to = blockData.dateRange.to;
      setBlockData((prev) => {
        const days: DayAvailability[] = [];
        const currentDate = new Date(from);
        const endDate = new Date(to);

        while (currentDate <= endDate) {
          // Use local date key to avoid off-by-one day shifts due to UTC conversion
          const dateStr = toLocalDateKey(currentDate);
          const dayOfWeek = currentDate.getDay();
          const weekdayKey = WEEKDAYS[dayOfWeek].key;
          const isAvailableByDefault = prev.weeklyAvailability[weekdayKey];

          const existingDay = prev.dayByDayAvailability.find(
            (d) => d.date === dateStr
          );

          if (existingDay) {
            days.push({
              ...existingDay,
              available: isAvailableByDefault,
              slots: isAvailableByDefault
                ? existingDay.slots.length > 0
                  ? existingDay.slots
                  : prev.defaultTimeSlots.map((s) => ({ ...s }))
                : [],
            });
          } else {
            days.push({
              date: dateStr,
              available: isAvailableByDefault,
              slots: isAvailableByDefault
                ? prev.defaultTimeSlots.map((s) => ({ ...s }))
                : [],
            });
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }

        return {
          ...prev,
          dayByDayAvailability: days,
        };
      });
      setShowDayEditor(true);
    } else {
      setShowDayEditor(false);
    }
  }, [
    blockData.dateRange?.from,
    blockData.dateRange?.to,
    blockData.weeklyAvailability,
  ]);

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (!range) {
      setBlockData((prev) => ({ ...prev, dateRange: undefined }));
      return;
    }

    const { from, to } = range;
    if (from && to) {
      const start = new Date(from);
      const end = new Date(to);
      const diffDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays > 60) {
        const cappedEnd = new Date(start);
        cappedEnd.setDate(cappedEnd.getDate() + 60);
        setBlockData((prev) => ({
          ...prev,
          dateRange: { from: start, to: cappedEnd },
        }));
        toast.warning(
          `You can select up to 60 days. End date adjusted to ${cappedEnd.toLocaleDateString()}.`
        );
        return;
      }
    }

    setBlockData((prev) => ({ ...prev, dateRange: range }));
  };

  const toggleWeekday = (
    day: keyof CalendarBlockData["weeklyAvailability"]
  ) => {
    setBlockData((prev) => ({
      ...prev,
      weeklyAvailability: {
        ...prev.weeklyAvailability,
        [day]: !prev.weeklyAvailability[day],
      },
    }));
  };

  const updateDayAvailability = (
    dateStr: string,
    available: boolean,
    slots?: TimeSlot[]
  ) => {
    setBlockData((prev) => ({
      ...prev,
      dayByDayAvailability: prev.dayByDayAvailability.map((day) =>
        day.date === dateStr
          ? {
              ...day,
              available,
              slots:
                slots !== undefined
                  ? slots
                  : prev.defaultTimeSlots.map((s) => ({ ...s })),
            }
          : day
      ),
    }));
  };

  const addTimeSlot = (dateStr: string) => {
    const day = blockData.dayByDayAvailability.find((d) => d.date === dateStr);
    if (day) {
      const newSlots = [...day.slots, { start: "09:00", end: "17:00" }];
      updateDayAvailability(dateStr, day.available, newSlots);
    }
  };

  const removeTimeSlot = (dateStr: string, slotIndex: number) => {
    const day = blockData.dayByDayAvailability.find((d) => d.date === dateStr);
    if (day) {
      const newSlots = day.slots.filter((_, i) => i !== slotIndex);
      updateDayAvailability(dateStr, day.available, newSlots);
    }
  };

  const updateTimeSlot = (
    dateStr: string,
    slotIndex: number,
    field: "start" | "end",
    value: string
  ) => {
    const day = blockData.dayByDayAvailability.find((d) => d.date === dateStr);
    if (day) {
      const newSlots = day.slots.map((slot, i) =>
        i === slotIndex ? { ...slot, [field]: value } : slot
      );
      updateDayAvailability(dateStr, day.available, newSlots);
    }
  };

  // Default time slots helpers
  const addDefaultTimeSlot = () => {
    setBlockData((prev) => ({
      ...prev,
      defaultTimeSlots: [
        ...prev.defaultTimeSlots,
        { start: "09:00", end: "17:00" },
      ],
    }));
  };

  const removeDefaultTimeSlot = (index: number) => {
    setBlockData((prev) => ({
      ...prev,
      defaultTimeSlots: prev.defaultTimeSlots.filter((_, i) => i !== index),
    }));
  };

  const updateDefaultTimeSlot = (
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    setBlockData((prev) => ({
      ...prev,
      defaultTimeSlots: prev.defaultTimeSlots.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      ),
    }));
  };

  const applyDefaultToAllDays = () => {
    setBlockData((prev) => ({
      ...prev,
      dayByDayAvailability: prev.dayByDayAvailability.map((day) =>
        day.available
          ? { ...day, slots: prev.defaultTimeSlots.map((s) => ({ ...s })) }
          : day
      ),
    }));
    toast.success("Default time slots applied to all available days.");
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getActiveInterval = () => {
    if (blockData.timeSlotInterval === 0) {
      return blockData.customInterval ? parseInt(blockData.customInterval) : 30;
    }
    return blockData.timeSlotInterval;
  };

  return (
    <div>
      {isEdit ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Calendar Title</Label>
            <Input
              placeholder="e.g., Book a Meeting"
              value={blockData.title}
              onChange={(e) =>
                setBlockData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="bg-muted/40"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              placeholder="Describe your availability..."
              value={blockData.description}
              onChange={(e) =>
                setBlockData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="min-h-20 bg-muted/40"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Timezone</Label>
            <Select
              value={blockData.timezone}
              onValueChange={(value) =>
                setBlockData((prev) => ({ ...prev, timezone: value }))
              }
            >
              <SelectTrigger className="bg-muted/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezone.map((tz) => {
                  // Get current time in that timezone
                  const currentTime = new Intl.DateTimeFormat("en-US", {
                    timeZone: tz.label,
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }).format(new Date());

                  return (
                    <SelectItem key={tz.label} value={tz.label}>
                      {`${tz.label} (${currentTime})`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Select Date Range (Max 60 days)
            </Label>
            <div className="border rounded-lg bg-muted/40 p-2">
              <Calendar
                mode="range"
                selected={blockData.dateRange}
                onSelect={handleDateRangeSelect}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (date < today) return true;
                  if (blockData.dateRange?.from && !blockData.dateRange?.to) {
                    const maxDate = new Date(blockData.dateRange.from);
                    maxDate.setDate(maxDate.getDate() + 60);
                    return date > maxDate;
                  }
                  return false;
                }}
                numberOfMonths={2}
              />
            </div>
            {blockData.dateRange?.from && blockData.dateRange?.to && (
              <p className="text-xs text-muted-foreground">
                Selected: {blockData.dateRange.from.toLocaleDateString()} -{" "}
                {blockData.dateRange.to.toLocaleDateString()}
              </p>
            )}
          </div>

          {blockData.dateRange?.from && blockData.dateRange?.to && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Default Weekly Availability
                  </Label>
                  {blockData.dateRange?.from &&
                    blockData.dateRange?.to &&
                    (() => {
                      const availableDays =
                        blockData.dayByDayAvailability.filter(
                          (d) => d.available
                        ).length;
                      const totalDays = blockData.dayByDayAvailability.length;
                      const statusType =
                        availableDays === 0
                          ? "unavailable"
                          : availableDays === totalDays
                            ? "full"
                            : "partial";
                      const statusText =
                        statusType === "unavailable"
                          ? "Unavailable"
                          : statusType === "full"
                            ? "Full"
                            : "Partial";
                      const statusColor =
                        statusType === "unavailable"
                          ? "text-destructive bg-destructive/10"
                          : statusType === "full"
                            ? "text-green-600 bg-green-50"
                            : "text-yellow-600 bg-yellow-50";
                      return (
                        <span
                          className={`text-xs px-2 py-1 rounded-md font-medium ${statusColor}`}
                        >
                          {statusText}
                        </span>
                      );
                    })()}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {WEEKDAYS.map((day) => (
                    <Button
                      key={day.key}
                      type="button"
                      variant={
                        blockData.weeklyAvailability[day.key]
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => toggleWeekday(day.key)}
                      className="flex-1 min-w-[60px]"
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select days when you're typically available
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Time Slot Interval
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={blockData.timeSlotInterval.toString()}
                    onValueChange={(value) =>
                      setBlockData((prev) => ({
                        ...prev,
                        timeSlotInterval: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger className="bg-muted/40 flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESET_INTERVALS.map((interval) => (
                        <SelectItem
                          key={interval.value}
                          value={interval.value.toString()}
                        >
                          {interval.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {blockData.timeSlotInterval === 0 && (
                    <Input
                      type="number"
                      placeholder="Minutes"
                      value={blockData.customInterval}
                      onChange={(e) =>
                        setBlockData((prev) => ({
                          ...prev,
                          customInterval: e.target.value,
                        }))
                      }
                      className="bg-muted/40 w-32"
                      min="1"
                      max="480"
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Duration for each meeting slot ({getActiveInterval()} min)
                </p>
              </div>

              {/* Default Time Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Default Time Slots
                </Label>
                <div className="space-y-2 p-3 border rounded-lg bg-muted/40">
                  {blockData.defaultTimeSlots.map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={slot.start}
                        onChange={(e) =>
                          updateDefaultTimeSlot(idx, "start", e.target.value)
                        }
                        className="bg-muted/40 w-32"
                      />
                      <span className="text-xs text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={slot.end}
                        onChange={(e) =>
                          updateDefaultTimeSlot(idx, "end", e.target.value)
                        }
                        className="bg-muted/40 w-32"
                      />
                      {blockData.defaultTimeSlots.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeDefaultTimeSlot(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDefaultTimeSlot}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Default Slot
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="ml-auto"
                      onClick={applyDefaultToAllDays}
                    >
                      Apply to all days
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  These default slots are used when generating day-by-day
                  availability and when enabling a day.
                </p>
              </div>

              {showDayEditor && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Day-by-Day Availability Editor
                  </Label>
                  <div className="border rounded-lg bg-muted/40 p-3 max-h-96 overflow-y-auto space-y-2">
                    {blockData.dayByDayAvailability.map((day) => (
                      <div
                        key={day.date}
                        className="border rounded-lg p-3 bg-background space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {formatDateDisplay(day.date)}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant={day.available ? "default" : "outline"}
                            size="sm"
                            onClick={() =>
                              updateDayAvailability(
                                day.date,
                                !day.available,
                                day.available
                                  ? []
                                  : blockData.defaultTimeSlots.map((s) => ({
                                      ...s,
                                    }))
                              )
                            }
                          >
                            {day.available ? "Available" : "Unavailable"}
                          </Button>
                        </div>

                        {day.available && (
                          <div className="space-y-2 pl-6">
                            {day.slots.map((slot, slotIndex) => (
                              <div
                                key={slotIndex}
                                className="flex items-center gap-2"
                              >
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="time"
                                  value={slot.start}
                                  onChange={(e) =>
                                    updateTimeSlot(
                                      day.date,
                                      slotIndex,
                                      "start",
                                      e.target.value
                                    )
                                  }
                                  className="bg-muted/40 w-32"
                                />
                                <span className="text-xs text-muted-foreground">
                                  to
                                </span>
                                <Input
                                  type="time"
                                  value={slot.end}
                                  onChange={(e) =>
                                    updateTimeSlot(
                                      day.date,
                                      slotIndex,
                                      "end",
                                      e.target.value
                                    )
                                  }
                                  className="bg-muted/40 w-32"
                                />
                                {day.slots.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() =>
                                      removeTimeSlot(day.date, slotIndex)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addTimeSlot(day.date)}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Time Slot
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {blockData.title ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">{blockData.title}</h3>
                </div>
                {blockData.description && (
                  <p className="text-sm text-muted-foreground">
                    {blockData.description}
                  </p>
                )}
              </div>

              {blockData.dateRange?.from && blockData.dateRange?.to && (
                <>
                  <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Date Range:</span>
                      <span className="font-medium">
                        {blockData.dateRange.from.toLocaleDateString()} -{" "}
                        {blockData.dateRange.to.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Timezone:</span>
                      <span className="font-medium">{blockData.timezone}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Session Duration:
                      </span>
                      <span className="font-medium">
                        {getActiveInterval()} minutes
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Available Days Summary
                    </Label>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {blockData.dayByDayAvailability
                        .filter((day) => day.available)
                        .map((day) => (
                          <div
                            key={day.date}
                            className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
                          >
                            <span className="font-medium">
                              {formatDateDisplay(day.date)}
                            </span>
                            <div className="flex gap-2 flex-wrap justify-end">
                              {day.slots.map((slot, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs text-muted-foreground"
                                >
                                  {slot.start} - {slot.end}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="p-6 bg-muted/30 rounded-lg text-center">
              <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No calendar configured
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BlockForCalendar;
