"use client";

import { useEmergency } from "@/src/context/emergency-context";
import { useEffect, useState } from "react";

export function EmergencyOverlay() {
  const { emergency } = useEmergency();
  const [isVisible, setIsVisible] = useState(false);

  // Format countdown time as MMM:SS (supports up to 999 minutes)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    // Pad minutes to at least 2 digits, but allow more for larger numbers
    const paddedMins =
      mins < 100 ? mins.toString().padStart(2, "0") : mins.toString();
    return `${paddedMins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (emergency.active) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [emergency.active]);

  if (!isVisible || (emergency.countdown === null && !emergency.active))
    return null;

  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none"
      style={{ userSelect: "none" }}
    >
      {/* Countdown display - only show if there's a countdown */}
      {emergency.countdown !== null && (
        <div
          className={
            emergency.alarm
              ? "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              : "absolute top-[120px] left-1/2 transform -translate-x-1/2"
          }
        >
          <div
            className={
              emergency.alarm
                ? "bg-black/80 border-4 border-red-500 p-6 rounded-lg text-center min-w-[300px]"
                : "bg-black/60 border-2 border-red-500 p-3 rounded-lg text-center min-w-[150px]"
            }
          >
            <h2
              className={
                emergency.alarm
                  ? "text-red-500 text-xl font-bold mb-2"
                  : "text-red-500 text-sm font-bold mb-1"
              }
            >
              {emergency.alarm ? "EMERGENCY PROTOCOL" : "COUNTDOWN"}
            </h2>
            <div
              className={
                emergency.alarm
                  ? "text-red-500 text-6xl font-mono font-bold countdown-display"
                  : "text-red-500 text-2xl font-mono font-bold"
              }
            >
              {formatTime(emergency.countdown)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
