"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

type AudioContextType = {
  playAlarm: () => void;
  stopAlarm: () => void;
  playTick: (countdown: number) => void;
  setAlarmVolume: (volume: number) => void;
  setTickVolume: (volume: number) => void;
  alarmVolume: number;
  tickVolume: number;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const alarmSoundRef = useRef<HTMLAudioElement | null>(null);
  const tickSoundRef = useRef<HTMLAudioElement | null>(null);
  const loopCountRef = useRef(0);
  const [alarmVolume, setAlarmVolumeState] = useState(0.02);
  const [tickVolume, setTickVolumeState] = useState(0.05);

  // Load saved volume settings from localStorage
  useEffect(() => {
    const savedAlarmVolume = localStorage.getItem("alarmVolume");
    const savedTickVolume = localStorage.getItem("tickVolume");

    if (savedAlarmVolume) {
      setAlarmVolumeState(parseFloat(savedAlarmVolume));
    }
    if (savedTickVolume) {
      setTickVolumeState(parseFloat(savedTickVolume));
    }
  }, []);

  // Initialize audio elements once
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        alarmSoundRef.current = new Audio("/sounds/alarm_loop.wav");
        alarmSoundRef.current.loop = false;
        alarmSoundRef.current.volume = alarmVolume;
        alarmSoundRef.current.addEventListener("ended", () => {
          loopCountRef.current++;
          if (loopCountRef.current < 3) {
            alarmSoundRef.current?.play();
          }
        });

        tickSoundRef.current = new Audio("/sounds/clock_beep.mp3");
        tickSoundRef.current.volume = tickVolume;
      } catch (e) {
        console.warn("Audio not supported:", e);
      }
    }

    return () => {
      if (alarmSoundRef.current) {
        alarmSoundRef.current.pause();
        alarmSoundRef.current.currentTime = 0;
        alarmSoundRef.current.removeEventListener("ended", () => {});
      }
      if (tickSoundRef.current) {
        tickSoundRef.current.pause();
        tickSoundRef.current.currentTime = 0;
      }
    };
  }, []); // Remove volume dependencies

  // Update volume when it changes
  useEffect(() => {
    if (alarmSoundRef.current) {
      alarmSoundRef.current.volume = alarmVolume;
    }
  }, [alarmVolume]);

  useEffect(() => {
    if (tickSoundRef.current) {
      tickSoundRef.current.volume = tickVolume;
    }
  }, [tickVolume]);

  const playAlarm = () => {
    if (alarmSoundRef.current) {
      loopCountRef.current = 0;
      alarmSoundRef.current.volume = alarmVolume;
      alarmSoundRef.current
        .play()
        .catch((e) => console.warn("Error playing alarm sound:", e));
    }
  };

  const stopAlarm = () => {
    if (alarmSoundRef.current) {
      alarmSoundRef.current.pause();
      if (!isNaN(alarmSoundRef.current.duration)) {
        alarmSoundRef.current.currentTime = 0;
      }
    }
  };

  const playTick = (countdown: number) => {
    if (tickSoundRef.current) {
      if (countdown <= 10) {
        tickSoundRef.current.playbackRate = 1.5;
        tickSoundRef.current.volume = tickVolume * 1.5;
      } else if (countdown <= 30) {
        tickSoundRef.current.playbackRate = 1.2;
        tickSoundRef.current.volume = tickVolume * 1.3;
      } else {
        tickSoundRef.current.playbackRate = 1.0;
        tickSoundRef.current.volume = tickVolume;
      }

      tickSoundRef.current
        .play()
        .catch((e) => console.warn("Error playing tick sound:", e));
    }
  };

  const setAlarmVolume = (volume: number) => {
    setAlarmVolumeState(volume);
    localStorage.setItem("alarmVolume", volume.toString());
  };

  const setTickVolume = (volume: number) => {
    setTickVolumeState(volume);
    localStorage.setItem("tickVolume", volume.toString());
  };

  return (
    <AudioContext.Provider
      value={{
        playAlarm,
        stopAlarm,
        playTick,
        setAlarmVolume,
        setTickVolume,
        alarmVolume,
        tickVolume,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
