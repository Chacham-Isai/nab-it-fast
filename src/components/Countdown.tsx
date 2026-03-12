import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CountdownProps {
  seconds: number;
  urgentThreshold?: number;
  className?: string;
}

const Countdown = ({ seconds: initialSeconds, urgentThreshold = 300, className }: CountdownProps) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isUrgent = seconds < urgentThreshold;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const display = hours > 0
    ? `${hours}h ${mins}m`
    : `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <span className={cn(
      "font-mono font-bold tabular-nums",
      isUrgent ? "text-destructive animate-pulse" : "text-foreground",
      className
    )}>
      {display}
    </span>
  );
};

export default Countdown;
