import { useAudio } from "@/src/context/audio-context";
import { useEmergency } from "@/src/context/emergency-context";
import { useEffect, useState } from "react";

export function EmergencyMenu({
  setShowEmergencyMenu,
}: {
  setShowEmergencyMenu: (show: boolean) => void;
}) {
  const [countdownInput, setCountdownInput] = useState("05:00");
  const [inputError, setInputError] = useState("");
  const { emergency, setEmergency, startEmergency, resetEmergency } =
    useEmergency();
  const { setAlarmVolume, setTickVolume, alarmVolume, tickVolume } = useAudio();

  // Format countdown time consistently
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    // Pad minutes to at least 2 digits, but allow more for larger numbers
    const paddedMins =
      mins < 100 ? mins.toString().padStart(2, "0") : mins.toString();
    return `${paddedMins}:${secs.toString().padStart(2, "0")}`;
  };

  const stopEmergency = () => {
    resetEmergency();
    setShowEmergencyMenu(false);
  };

  const startEmergencyLocal = (seconds: number | null) => {
    // Use the combined method for both countdown and unlimited emergencies
    startEmergency("emergency-protocol", seconds);
    setShowEmergencyMenu(false);
  };

  const handleStartCountdown = () => {
    // Validate the input format (mmm:ss) - up to 999 minutes
    const timeRegex = /^([0-9]{1,3}):([0-5][0-9])$/;
    const match = countdownInput.match(timeRegex);

    if (!match) {
      setInputError("Invalid format. Use mmm:ss (e.g., 05:00, 120:30)");
      return;
    }

    // Parse minutes and seconds
    const minutes = Number.parseInt(match[1], 10);
    const seconds = Number.parseInt(match[2], 10);

    // Convert to total seconds
    const totalSeconds = minutes * 60 + seconds;

    if (totalSeconds <= 0) {
      setInputError("Time must be greater than 0");
      return;
    }

    // Clear any error and start the countdown
    setInputError("");
    startEmergencyLocal(totalSeconds);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowEmergencyMenu(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
      <div className="bg-black border-2 border-primary p-4 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-primary">
          EMERGENCY PROTOCOL CONTROL
        </h2>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="alarm-toggle"
              checked={emergency.alarm}
              onChange={(e) => setEmergency({ alarm: e.target.checked })}
              className="h-4 w-4 rounded border-primary bg-black text-primary focus:ring-primary focus:ring-offset-0 accent-primary"
            />
            <label htmlFor="alarm-toggle" className="text-primary">
              Alarm Active
            </label>
          </div>
        </div>

        {emergency.active ? (
          <div className="space-y-4">
            {emergency.countdown !== null && (
              <p className="text-primary text-xl">
                Countdown: {formatTime(emergency.countdown)}
              </p>
            )}
            <button
              onClick={stopEmergency}
              className="w-full p-2 border border-red-500 text-red-500 hover:bg-red-500/10 rounded"
            >
              DEACTIVATE EMERGENCY MODE
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="mb-2">Enter countdown duration (mmm:ss):</p>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="05:00"
                  className="flex-1 p-2 bg-black border border-primary text-primary rounded"
                  value={countdownInput}
                  onChange={(e) => setCountdownInput(e.target.value)}
                />
                <button
                  onClick={handleStartCountdown}
                  className="p-2 border border-primary text-primary hover:bg-primary/10 rounded"
                >
                  START
                </button>
              </div>
              {inputError && (
                <p className="text-red-500 text-xs">{inputError}</p>
              )}
              <button
                onClick={() => startEmergencyLocal(null)}
                className="w-full p-2 border border-primary text-primary hover:bg-primary/10 rounded"
              >
                UNLIMITED EMERGENCY
              </button>
            </div>
          </div>
        )}
        <div className="space-y-4 border-t border-primary pt-4">
          <h3 className="text-xl font-bold text-primary">Sound Controls</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm mb-1">Alarm Volume</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max=".5"
                  step="0.01"
                  value={alarmVolume}
                  onChange={(e) => setAlarmVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-black border border-primary rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <span className="text-primary font-mono text-sm w-12 text-right">
                  {Math.round(alarmVolume * 100)}%
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Tick Volume</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max=".5"
                  step="0.01"
                  value={tickVolume}
                  onChange={(e) => setTickVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-black border border-primary rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <span className="text-primary font-mono text-sm w-12 text-right">
                  {Math.round(tickVolume * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowEmergencyMenu(false)}
            className="px-4 py-2 border border-primary hover:bg-primary/20 rounded"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
