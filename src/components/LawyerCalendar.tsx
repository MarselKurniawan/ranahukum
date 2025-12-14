import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface DaySchedule {
  date: Date;
  slots: TimeSlot[];
}

const defaultTimeSlots = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "19:00", "20:00"
];

export function LawyerCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [schedules, setSchedules] = useState<Record<string, TimeSlot[]>>({});

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const getSlotsForDate = (date: Date): TimeSlot[] => {
    const key = formatDateKey(date);
    if (schedules[key]) {
      return schedules[key];
    }
    return defaultTimeSlots.map(time => ({ time, available: true }));
  };

  const toggleSlot = (date: Date, time: string) => {
    const key = formatDateKey(date);
    const currentSlots = getSlotsForDate(date);
    const updatedSlots = currentSlots.map(slot =>
      slot.time === time ? { ...slot, available: !slot.available } : slot
    );
    setSchedules({ ...schedules, [key]: updatedSlots });
  };

  const toggleAllSlots = (date: Date, available: boolean) => {
    const key = formatDateKey(date);
    const updatedSlots = defaultTimeSlots.map(time => ({ time, available }));
    setSchedules({ ...schedules, [key]: updatedSlots });
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getAvailableCount = (date: Date) => {
    const slots = getSlotsForDate(date);
    return slots.filter(s => s.available).length;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Kalender Ketersediaan</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium w-32 text-center">{monthName}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(day => (
              <div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, idx) => {
              if (!date) {
                return <div key={idx} className="h-10" />;
              }

              const isToday = date.toDateString() === new Date().toDateString();
              const isPast = date < today;
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const availableCount = getAvailableCount(date);

              return (
                <button
                  key={idx}
                  disabled={isPast}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "h-10 rounded-lg text-sm relative transition-all",
                    isPast && "opacity-30 cursor-not-allowed",
                    !isPast && "hover:bg-accent",
                    isToday && "ring-1 ring-primary",
                    isSelected && "bg-primary text-primary-foreground"
                  )}
                >
                  {date.getDate()}
                  {!isPast && availableCount > 0 && (
                    <span className={cn(
                      "absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
                      availableCount >= 8 ? "bg-success" : availableCount >= 4 ? "bg-warning" : "bg-destructive"
                    )} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success" /> Banyak slot
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-warning" /> Sedikit slot
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-destructive" /> Hampir penuh
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots for Selected Date */}
      {selectedDate && (
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {selectedDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Semua</span>
                <Switch
                  checked={getSlotsForDate(selectedDate).every(s => s.available)}
                  onCheckedChange={(checked) => toggleAllSlots(selectedDate, checked)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {getSlotsForDate(selectedDate).map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => toggleSlot(selectedDate, slot.time)}
                  className={cn(
                    "py-2 px-1 rounded-lg text-xs font-medium transition-all",
                    slot.available
                      ? "bg-success/20 text-success border border-success/30"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {slot.time}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Klik slot waktu untuk mengaktifkan/menonaktifkan
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
