import { useState, useEffect } from "react";
import { Clock, AlertCircle, CheckCircle2, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays, parseISO, format, isAfter, isBefore, addHours } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface InterviewCountdownProps {
  scheduledDate: string;
  scheduledTime: string;
  status: string;
}

export function InterviewCountdown({ scheduledDate, scheduledTime, status }: InterviewCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [countdownStatus, setCountdownStatus] = useState<"upcoming" | "starting_soon" | "ongoing" | "ended">("upcoming");

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        // Parse date and time
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        const interviewDate = parseISO(scheduledDate);
        interviewDate.setHours(hours, minutes, 0, 0);
        
        const now = new Date();
        const interviewEnd = addHours(interviewDate, 1); // Assume 1 hour interview

        // Check status
        if (status === 'completed' || status === 'cancelled') {
          setCountdownStatus("ended");
          setTimeLeft("");
          return;
        }

        if (isAfter(now, interviewEnd)) {
          setCountdownStatus("ended");
          setTimeLeft("Interview telah berakhir");
          return;
        }

        if (isAfter(now, interviewDate) && isBefore(now, interviewEnd)) {
          setCountdownStatus("ongoing");
          const minsLeft = differenceInMinutes(interviewEnd, now);
          setTimeLeft(`Sedang berlangsung (${minsLeft} menit tersisa)`);
          return;
        }

        // Calculate time until interview
        const secondsUntil = differenceInSeconds(interviewDate, now);
        const daysUntil = differenceInDays(interviewDate, now);
        const hoursUntil = differenceInHours(interviewDate, now) % 24;
        const minsUntil = differenceInMinutes(interviewDate, now) % 60;
        const secsUntil = secondsUntil % 60;

        // Determine status
        if (secondsUntil <= 900) { // 15 minutes or less
          setCountdownStatus("starting_soon");
        } else {
          setCountdownStatus("upcoming");
        }

        // Format countdown
        if (daysUntil > 0) {
          setTimeLeft(`${daysUntil} hari ${hoursUntil} jam lagi`);
        } else if (hoursUntil > 0) {
          setTimeLeft(`${hoursUntil} jam ${minsUntil} menit lagi`);
        } else if (minsUntil > 0) {
          setTimeLeft(`${minsUntil} menit ${secsUntil} detik lagi`);
        } else {
          setTimeLeft(`${secsUntil} detik lagi`);
        }
      } catch (error) {
        console.error("Error calculating countdown:", error);
        setTimeLeft("");
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [scheduledDate, scheduledTime, status]);

  if (status === 'completed') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/20">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <span className="text-sm font-medium text-success">Interview Selesai</span>
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <span className="text-sm font-medium text-destructive">Interview Dibatalkan</span>
      </div>
    );
  }

  if (countdownStatus === "ended") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{timeLeft}</span>
      </div>
    );
  }

  if (countdownStatus === "ongoing") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/20 animate-pulse">
        <Timer className="h-4 w-4 text-success" />
        <span className="text-sm font-medium text-success">{timeLeft}</span>
      </div>
    );
  }

  if (countdownStatus === "starting_soon") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/20">
        <Timer className="h-4 w-4 text-warning animate-pulse" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-warning">Segera Dimulai!</span>
          <span className="text-xs text-warning/80">{timeLeft}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20">
      <Clock className="h-4 w-4 text-accent" />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Waktu Interview</span>
        <span className="text-sm font-medium text-accent">{timeLeft}</span>
      </div>
    </div>
  );
}
