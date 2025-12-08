"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { emergencyRepository } from "../data/emergency-repository";
import { useAudio } from "./audio-context";

type EmergencyState = {
  active: boolean;
  countdown: number | null; // in seconds, null means no countdown
  reason: "self-destruct" | "emergency-protocol" | null;
  alarm: boolean; // whether alarm sound and styling should be active
};

type EmergencyContextType = {
  emergency: EmergencyState;
  setEmergency: (state: Partial<EmergencyState>) => void;
  startEmergency: (
    reason: "self-destruct" | "emergency-protocol",
    countdownSeconds?: number | null,
    alarm?: boolean
  ) => void;
  resetEmergency: () => void;
};

const EmergencyContext = createContext<EmergencyContextType | undefined>(
  undefined
);

export function EmergencyProvider({ children }: { children: ReactNode }) {
  const [emergency, setEmergencyState] = useState<EmergencyState>({
    active: false,
    countdown: null,
    reason: null,
    alarm: true,
  });

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { playAlarm, stopAlarm, playTick } = useAudio();
  const lastTickRef = useRef<number | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    const persistedState = emergencyRepository.get();

    if (persistedState && persistedState.active) {
      const countdown = emergencyRepository.getRemainingSeconds();

      // Only load if countdown is still valid or no countdown was set
      if (countdown === null || countdown > 0) {
        setEmergencyState({
          active: persistedState.active,
          countdown,
          reason: persistedState.reason,
          alarm: persistedState.alarm,
        });
      } else {
        // Emergency has expired, clear it
        emergencyRepository.reset();
      }
    }
  }, []);

  // Handle countdown timer - recalculate from destination time
  useEffect(() => {
    // Clear any existing interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // Only start interval if we have an active emergency with a countdown
    if (
      emergency.active &&
      emergency.countdown !== null &&
      emergency.countdown > 0
    ) {
      countdownIntervalRef.current = setInterval(() => {
        const remainingSeconds = emergencyRepository.getRemainingSeconds();

        if (remainingSeconds === null) {
          // Emergency was cleared externally
          setEmergencyState((prev) => ({
            ...prev,
            active: false,
            countdown: null,
          }));
          return;
        }

        if (remainingSeconds <= 0) {
          // Countdown reached zero
          setEmergencyState((prev) => ({
            ...prev,
            countdown: 0,
          }));

          // Clear interval but keep emergency active
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          return;
        }

        // Update countdown with calculated remaining time
        setEmergencyState((prev) => ({
          ...prev,
          countdown: remainingSeconds,
        }));
      }, 1000);
    }

    // Cleanup on unmount
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [emergency.active, emergency.countdown !== null]); // Only depend on whether countdown exists, not its value

  // Play/pause alarm sound based on emergency state AND alarm toggle
  useEffect(() => {
    if (emergency.active && emergency.alarm) {
      playAlarm();
    } else {
      stopAlarm();
    }
  }, [emergency.active, emergency.alarm]);

  // Play tick sound for countdown
  useEffect(() => {
    if (emergency.active && emergency.countdown !== null && emergency.alarm) {
      // Play tick sound when countdown changes
      if (lastTickRef.current !== emergency.countdown) {
        playTick(emergency.countdown);
        lastTickRef.current = emergency.countdown;
      }
    }
  }, [emergency.countdown, emergency.active, emergency.alarm, playTick]);

  const setEmergency = (state: Partial<EmergencyState>) => {
    setEmergencyState((prev) => {
      const newState = { ...prev, ...state };

      // Only update persistent storage for simple state changes like alarm toggle
      const currentPersisted = emergencyRepository.get();
      if (currentPersisted && currentPersisted.active) {
        // Update only specific persistent properties
        emergencyRepository.updateState({
          alarm: newState.alarm,
        });
      } else if (!newState.active && prev.active) {
        // Emergency is being deactivated
        emergencyRepository.reset();
      }

      return newState;
    });
  };

  const startEmergency = (
    reason: "self-destruct" | "emergency-protocol",
    countdownSeconds?: number | null,
    alarm: boolean = true
  ) => {
    // Save to persistent storage first
    if (countdownSeconds !== null && countdownSeconds !== undefined) {
      emergencyRepository.startEmergency(countdownSeconds, reason, alarm);
    } else {
      emergencyRepository.startEmergencyWithoutCountdown(reason, alarm);
    }

    // Update local state
    setEmergencyState({
      active: true,
      countdown: countdownSeconds ?? null,
      reason,
      alarm,
    });
  };

  const resetEmergency = () => {
    // Clear persistent storage
    emergencyRepository.reset();

    // Reset local state
    setEmergencyState({
      active: false,
      countdown: null,
      reason: null,
      alarm: true,
    });
  };

  return (
    <EmergencyContext.Provider
      value={{
        emergency,
        setEmergency,
        startEmergency,
        resetEmergency,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const context = useContext(EmergencyContext);
  if (context === undefined) {
    throw new Error("useEmergency must be used within an EmergencyProvider");
  }
  return context;
}

export type { EmergencyState };
