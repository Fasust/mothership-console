"use client";

import { ControlButtonType } from "@/src/models/scenario";
import { ReactNode } from "react";

interface ControlButtonProps {
  label: string;
  restrictionLabel?: string;
  isActive?: boolean;
  isRestricted?: boolean;
  type: ControlButtonType;
  onClick: () => void;
  children?: ReactNode;
}

/**
 * A button that can be displayed in the interior view.
 *
 * Allows the user to perform actions or toggle states.
 */
export function ControlButton({
  label,
  isActive = false,
  isRestricted = false,
  type,
  onClick,
  children,
  restrictionLabel = "ADMIN",
}: ControlButtonProps) {
  let color = "";
  switch (type) {
    case "action":
      color = "primary";
      break;
    case "toggle":
      if (isActive) {
        color = "green-500";
      } else {
        color = "red-500";
      }
      break;
  }

  const style = `border-${color} text-${color} hover:bg-${color}/10 ${
    isRestricted ? "opacity-50" : ""
  }`;

  return (
    <div className="relative h-full">
      <button
        onClick={onClick}
        className={`w-full h-full p-2 border rounded ${style}`}
      >
        {`${label}${isRestricted ? ` [${restrictionLabel}]` : ""}`}
        {children}
      </button>
    </div>
  );
}
