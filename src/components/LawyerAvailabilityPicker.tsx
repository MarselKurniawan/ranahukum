import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLawyerSchedule, getSlotsForDate } from "@/hooks/useLawyerSchedules";

interface LawyerAvailabilityPickerProps {
  lawyerId: string;
  selectedSlot: { date: string; time: string } | null;
  onSelectSlot: (slot: { date: string; time: string } | null) => void;
}

export function LawyerAvailabilityPicker({ 
  lawyerId, 
  selectedSlot, 
  onSelectSlot 
}: LawyerAvailabilityPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const { data: schedules = [], isLoading } = useLawyerSchedule(lawyerId);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const getSlots = (date: Date) => {
    const key = formatDateKey(date);
    return getSlotsForDate(schedules, key);
  };

  const handleSelectTime = (date: Date, time: string) => {
    const dateKey = formatDateKey(date);
    if (selectedSlot?.date === dateKey && selectedSlot?.time === time) {
      onSelectSlot(null);
    } else {
      onSelectSlot({ date: dateKey, time });
    }
  };

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);
  const monthName = currentMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getAvailableCount = (date: Date) => {
    const slots = getSlots(date);
    return slots.filter(s => s.available).length;
  };

  const selectedSlots = selectedDate ? getSlots(selectedDate).filter(s => s.available) : [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Pilih Jadwal Konsultasi</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium w-32 text-center">{monthName}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
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
                  const hasNoSlots = availableCount === 0;

                  return (
                    <button
                      key={idx}
                      disabled={isPast || hasNoSlots}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "h-10 rounded-lg text-sm relative transition-all",
                        (isPast || hasNoSlots) && "opacity-30 cursor-not-allowed",
                        !isPast && !hasNoSlots && "hover:bg-accent",
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Time Slots for Selected Date */}
      {selectedDate && selectedSlots.length > 0 && (
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {selectedDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {selectedSlots.map((slot) => {
                const dateKey = formatDateKey(selectedDate);
                const isSelected = selectedSlot?.date === dateKey && selectedSlot?.time === slot.time;
                
                return (
                  <button
                    key={slot.time}
                    onClick={() => handleSelectTime(selectedDate, slot.time)}
                    className={cn(
                      "py-2 px-1 rounded-lg text-xs font-medium transition-all",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-success/20 text-success border border-success/30 hover:bg-success/30"
                    )}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Pilih waktu yang tersedia untuk konsultasi
            </p>
          </CardContent>
        </Card>
      )}

      {selectedDate && selectedSlots.length === 0 && (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Tidak ada slot tersedia untuk tanggal ini
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
