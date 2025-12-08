"use client";

import { useEffect, useState } from "react";

/**
 * Check if the device is mobile
 * @returns True if the device is mobile, false otherwise
 */
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window !== "undefined") {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      // Initial check
      checkMobile();

      // Add event listener for window resize
      window.addEventListener("resize", checkMobile);

      // Clean up
      return () => {
        window.removeEventListener("resize", checkMobile);
      };
    }
  }, []);

  return isMobile;
}
