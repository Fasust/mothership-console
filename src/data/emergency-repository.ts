export interface EmergencyPersistentState {
  active: boolean;
  destinationTime: number | null; // timestamp in milliseconds when countdown ends
  reason: "self-destruct" | "emergency-protocol" | null;
  alarm: boolean;
  startTime: number | null; // timestamp when emergency started
}

export class EmergencyRepository {
  private readonly storageKey = "mothership_emergency_state";

  /**
   * Get the persisted emergency state from localStorage
   */
  get(): EmergencyPersistentState | null {
    if (typeof window === "undefined") {
      return null; // SSR safe
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return null;
      }
      return JSON.parse(stored) as EmergencyPersistentState;
    } catch (error) {
      console.error("Failed to load emergency state from localStorage:", error);
      return null;
    }
  }

  /**
   * Save the emergency state to localStorage
   */
  set(state: EmergencyPersistentState): void {
    if (typeof window === "undefined") {
      return; // SSR safe
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save emergency state to localStorage:", error);
    }
  }

  /**
   * Clear the emergency state from localStorage
   */
  clear(): void {
    if (typeof window === "undefined") {
      return; // SSR safe
    }

    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error(
        "Failed to clear emergency state from localStorage:",
        error
      );
    }
  }

  /**
   * Start an emergency with countdown
   */
  startEmergency(
    countdownSeconds: number,
    reason: "self-destruct" | "emergency-protocol",
    alarm: boolean = true
  ): void {
    const now = Date.now();
    const destinationTime = now + countdownSeconds * 1000;

    const state: EmergencyPersistentState = {
      active: true,
      destinationTime,
      reason,
      alarm,
      startTime: now,
    };

    this.set(state);
  }

  /**
   * Start an emergency without countdown
   */
  startEmergencyWithoutCountdown(
    reason: "self-destruct" | "emergency-protocol",
    alarm: boolean = true
  ): void {
    const state: EmergencyPersistentState = {
      active: true,
      destinationTime: null,
      reason,
      alarm,
      startTime: Date.now(),
    };

    this.set(state);
  }

  /**
   * Calculate remaining countdown seconds based on current time
   */
  getRemainingSeconds(): number | null {
    const state = this.get();
    if (!state || !state.active || !state.destinationTime) {
      return null;
    }

    const now = Date.now();
    const remainingMs = state.destinationTime - now;

    if (remainingMs <= 0) {
      return 0;
    }

    return Math.ceil(remainingMs / 1000);
  }

  /**
   * Check if emergency is expired (countdown reached zero)
   */
  isExpired(): boolean {
    const remaining = this.getRemainingSeconds();
    return remaining === 0;
  }

  /**
   * Update emergency state properties
   */
  updateState(updates: Partial<EmergencyPersistentState>): void {
    const current = this.get();
    if (!current) {
      return;
    }

    const updated = { ...current, ...updates };
    this.set(updated);
  }

  /**
   * Reset/clear the emergency state
   */
  reset(): void {
    this.clear();
  }
}

// Export a singleton instance
export const emergencyRepository = new EmergencyRepository();
