export interface AudioSettings {
  alarmVolume: number;
  tickVolume: number;
}

/**
 * Repository for storing and retrieving audio settings.
 *
 * Centralizes all localStorage interactions related to audio,
 * and is safe to import from both client and server code.
 */
export class AudioRepository {
  private readonly alarmVolumeKey = "alarmVolume";
  private readonly tickVolumeKey = "tickVolume";

  /**
   * Get the persisted alarm volume from localStorage.
   */
  getAlarmVolume(): number | null {
    if (typeof window === "undefined") {
      return null; // SSR safe
    }

    try {
      const stored = localStorage.getItem(this.alarmVolumeKey);
      if (stored === null) {
        return null;
      }
      const parsed = parseFloat(stored);
      return Number.isNaN(parsed) ? null : parsed;
    } catch (error) {
      console.error("Failed to load alarm volume from localStorage:", error);
      return null;
    }
  }

  /**
   * Persist the alarm volume to localStorage.
   */
  setAlarmVolume(volume: number): void {
    if (typeof window === "undefined") {
      return; // SSR safe
    }

    try {
      localStorage.setItem(this.alarmVolumeKey, volume.toString());
    } catch (error) {
      console.error("Failed to save alarm volume to localStorage:", error);
    }
  }

  /**
   * Get the persisted tick volume from localStorage.
   */
  getTickVolume(): number | null {
    if (typeof window === "undefined") {
      return null; // SSR safe
    }

    try {
      const stored = localStorage.getItem(this.tickVolumeKey);
      if (stored === null) {
        return null;
      }
      const parsed = parseFloat(stored);
      return Number.isNaN(parsed) ? null : parsed;
    } catch (error) {
      console.error("Failed to load tick volume from localStorage:", error);
      return null;
    }
  }

  /**
   * Persist the tick volume to localStorage.
   */
  setTickVolume(volume: number): void {
    if (typeof window === "undefined") {
      return; // SSR safe
    }

    try {
      localStorage.setItem(this.tickVolumeKey, volume.toString());
    } catch (error) {
      console.error("Failed to save tick volume to localStorage:", error);
    }
  }

  /**
   * Convenience method to load both alarm and tick volume at once.
   */
  getSettings(): Partial<AudioSettings> {
    const alarmVolume = this.getAlarmVolume();
    const tickVolume = this.getTickVolume();

    const settings: Partial<AudioSettings> = {};
    if (alarmVolume !== null) {
      settings.alarmVolume = alarmVolume;
    }
    if (tickVolume !== null) {
      settings.tickVolume = tickVolume;
    }
    return settings;
  }
}

// Export a singleton instance
export const audioRepository = new AudioRepository();
