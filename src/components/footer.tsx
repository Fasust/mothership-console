"use client";

import { useEmergency } from "@/src/context/emergency-context";
import { useScenario } from "@/src/context/scenario-context";
import { useEffect, useState } from "react";
import { EmergencyMenu } from "./emergency/emergency-menu";

const minClicksToOpenSecretMenus = 3;

export function Footer({ onTerminalClick }: { onTerminalClick: () => void }) {
  const { scenario } = useScenario();
  const { emergency, setEmergency } = useEmergency();
  const name = scenario.name;
  const [showEmergencyMenu, setShowEmergencyMenu] = useState(false);
  const [terminalClickCount, setTerminalClickCount] = useState(0);
  const [emergencyClickCount, setEmergencyClickCount] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+Shift+E (Mac) or Ctrl+Shift+E (Windows/Linux)
      if (
        (event.metaKey || event.ctrlKey) &&
        (event.shiftKey || event.altKey) &&
        event.key === "e"
      ) {
        event.preventDefault();
        // Toggle the emergency menu
        if (emergency.active) {
          setEmergency({
            active: false,
          });
        } else {
          setEmergency({
            active: true,
            reason: "emergency-protocol",
          });
        }
      }

      // Check for Cmd+E (Mac) or Ctrl+E (Windows/Linux)
      else if ((event.metaKey || event.ctrlKey) && event.key === "e") {
        event.preventDefault();
        // Toggle the emergency menu
        setShowEmergencyMenu((prev) => !prev);
      }

      // Check for Cmd+I (Mac) or Ctrl+I (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === "i") {
        event.preventDefault();
        onTerminalClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onTerminalClick]);

  const handleTerminalClick = () => {
    setTerminalClickCount((prev) => prev + 1);
    if (terminalClickCount >= minClicksToOpenSecretMenus) {
      setTerminalClickCount(0);
      onTerminalClick();
    }
  };

  const handleEmergencyClick = () => {
    setEmergencyClickCount((prev) => prev + 1);
    if (emergencyClickCount >= minClicksToOpenSecretMenus) {
      setEmergencyClickCount(0);
      setShowEmergencyMenu(true);
    }
  };

  return (
    <footer
      className="mt-4 border-t border-primary pt-2 text-xs text-primary/70"
      style={{ userSelect: "none" }}
    >
      <div className="flex justify-between">
        <div onClick={handleTerminalClick}>{name} TERMINAL INTERFACE</div>
        <div onClick={handleEmergencyClick}>AUTHORIZED ACCESS ONLY</div>
      </div>

      {showEmergencyMenu && (
        <EmergencyMenu setShowEmergencyMenu={setShowEmergencyMenu} />
      )}
    </footer>
  );
}
