"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/alert-dialog";
import { useAdmin } from "@/src/context/admin-context";
import { useDiagnostics } from "@/src/context/diagnostics-context";
import { useEmergency } from "@/src/context/emergency-context";
import { useScenario } from "@/src/context/scenario-context";
import type { RoomId } from "@/src/models/scenario";
import { useState } from "react";
import { AirlockControlPanel } from "./airlock-controls";
import { ControlButton } from "./control-button";

export function StationControls() {
  const { isAdmin, showLogin } = useAdmin();
  const { scenario, map, toggleRoom, airlockStates, setAirlockState } =
    useScenario();
  const { setEmergency, startEmergency } = useEmergency();
  const { diagnosticsVisible, showDiagnostics, hideDiagnostics } =
    useDiagnostics();

  if (!map || !scenario.controlButtons) return <div>Loading...</div>;

  const controlButtons = scenario.controlButtons;

  const [buttonStates, setButtonStates] = useState<Record<string, boolean>>(
    () => {
      // Initialize button states from scenario defaults
      const initialStates: Record<string, boolean> = {};
      controlButtons.forEach((button) => {
        initialStates[button.label] = button.defaultState;
      });
      return initialStates;
    }
  );

  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [emergencyButtonLabel, setEmergencyButtonLabel] = useState<
    string | null
  >(null);
  const emergencyButton = controlButtons.find(
    (b) => b.label === emergencyButtonLabel
  );
  const [actionMessages, setActionMessages] = useState<Record<string, string>>(
    {}
  );

  // Get all airlocks from the map definition
  const airlocks = map.rooms
    .filter((room) => room.type === "airlock")
    .map((room) => ({ id: room.id }));

  const [selectedAirlock, setSelectedAirlock] = useState<RoomId | null>(null);

  const handleButtonClick = (buttonLable: string) => {
    // Find the button definition
    const buttonDef = controlButtons.find((b) => b.label === buttonLable);
    if (!buttonDef) return;

    // Check if this is a restricted button that needs admin privileges
    if (buttonDef.restricted && !isAdmin) {
      showLogin();
      return;
    }

    if (buttonDef.function === "emergency") {
      if (isAdmin) {
        // For Greta Base, toggle emergency mode without countdown
        setButtonStates((prev) => ({
          ...prev,
          [buttonLable]: !prev[buttonLable],
        }));

        // Toggle emergency mode based on the new button state
        const newState = !buttonStates[buttonLable];
        setEmergency({
          active: newState,
          countdown: null, // No countdown for Greta Base
          reason: newState ? "emergency-protocol" : null,
        });
      } else {
        showLogin();
      }
      return;
    }

    // Check if this is a critical button that needs confirmation
    const isCritical =
      buttonDef.function === "self-destruct" ||
      buttonDef.function === "emergency";

    if (isCritical) {
      setEmergencyButtonLabel(buttonLable);
      setShowEmergencyConfirm(true);
      return;
    }

    // Handle action buttons
    if (buttonDef.type === "action") {
      // For action buttons, we don't toggle state but show a message
      const actionMessage = getActionMessage(buttonLable);
      setActionMessages((prev) => ({
        ...prev,
        [buttonLable]: actionMessage,
      }));

      // Clear the message after 3 seconds
      setTimeout(() => {
        setActionMessages((prev) => {
          const newMessages = { ...prev };
          delete newMessages[buttonLable];
          return newMessages;
        });
      }, 3000);
    } else {
      if (buttonDef.linkedRoom) {
        toggleRoom(buttonDef.linkedRoom);
      }
      // Toggle the button state for toggle buttons
      setButtonStates((prev) => ({
        ...prev,
        [buttonLable]: !prev[buttonLable],
      }));
    }
  };

  const handleAirlockClick = (roomId: RoomId) => {
    setSelectedAirlock(roomId);
  };

  const handleEmergencyConfirm = () => {
    if (emergencyButtonLabel) {
      if (emergencyButton?.type === "action") {
        // For action buttons, show a message
        const actionMessage = getActionMessage(emergencyButtonLabel);
        setActionMessages((prev) => ({
          ...prev,
          [emergencyButtonLabel]: actionMessage,
        }));

        // Activate emergency mode
        if (emergencyButton.function === "self-destruct") {
          startEmergency("self-destruct", 600); // 10 minutes in seconds
        } else if (emergencyButton.function === "emergency") {
          startEmergency("emergency-protocol", 300); // 5 minutes in seconds
        }

        // Clear the message after 3 seconds
        setTimeout(() => {
          setActionMessages((prev) => {
            const newMessages = { ...prev };
            delete newMessages[emergencyButtonLabel];
            return newMessages;
          });
        }, 3000);
      } else {
        // Toggle the button state for toggle buttons
        setButtonStates((prev) => ({
          ...prev,
          [emergencyButtonLabel]: !prev[emergencyButtonLabel],
        }));
      }
    }
    setShowEmergencyConfirm(false);
    setEmergencyButtonLabel(null);
  };

  const getActionMessage = (buttonId: string): string => {
    switch (buttonId) {
      case "elevator":
        return "ELEVATOR CALLED";
      case "self-destruct":
        return "SELF-DESTRUCT SEQUENCE INITIATED";
      case "emergency":
        return "EMERGENCY PROTOCOL ACTIVATED";
      default:
        return "ACTION PERFORMED";
    }
  };

  const getButtonLabel = (buttonLabel: string, buttonType: string) => {
    if (buttonType === "action") {
      return buttonLabel;
    }

    const state = buttonStates[buttonLabel];
    const button = controlButtons.find((b) => b.label === buttonLabel);
    if (!button) return buttonLabel;
    if (button.toggleStates) {
      return `${buttonLabel} - ${
        state ? button.toggleStates.true : button.toggleStates.false
      }`;
    }
    return `${buttonLabel} - ${state ? "ON" : "OFF"}`;
  };

  return (
    <div className="grid grid-cols-2 gap-2 [&>*]:h-full auto-rows-fr">
      {controlButtons.map((button) => {
        const isRestricted = button.restricted;
        const isActive = buttonStates[button.label];

        return (
          <ControlButton
            key={button.label}
            label={getButtonLabel(button.label, button.type)}
            type={button.type}
            isActive={isActive}
            isRestricted={isRestricted && !isAdmin}
            onClick={() => handleButtonClick(button.label)}
          >
            {actionMessages[button.label] && (
              <div className="absolute -top-8 left-0 right-0 bg-primary text-black text-xs p-1 rounded text-center">
                {actionMessages[button.label]}
              </div>
            )}
          </ControlButton>
        );
      })}

      {airlocks.map((airlock) => (
        <ControlButton
          key={airlock.id}
          label={airlock.id.replace(/_/g, " ")}
          type="toggle"
          // acitve when any door is open
          isActive={airlockStates
            .get(airlock.id)
            ?.doors.values()
            .some((isOpen) => isOpen)}
          onClick={() => handleAirlockClick(airlock.id)}
        />
      ))}

      <ControlButton
        label={diagnosticsVisible ? "ABORT DIAGNOSTICS" : "RUN DIAGNOSTICS"}
        type="action"
        onClick={() =>
          diagnosticsVisible ? hideDiagnostics() : showDiagnostics()
        }
      />

      <AlertDialog
        open={showEmergencyConfirm}
        onOpenChange={setShowEmergencyConfirm}
      >
        <AlertDialogContent className="bg-black border-red-500 border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">
              WARNING: EMERGENCY PROTOCOL
            </AlertDialogTitle>
            <AlertDialogDescription className="text-primary">
              {emergencyButton?.function === "self-destruct"
                ? "This action will initiate a 10-minute countdown to station destruction. This process cannot be reversed once started."
                : "This will activate emergency protocols and may lock down certain areas of the facility."}{" "}
              Are you absolutely certain you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-primary text-primary hover:bg-primary hover:text-black">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmergencyConfirm}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {emergencyButton?.function === "self-destruct"
                ? "Confirm Self-Destruct"
                : "Confirm Emergency Protocol"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedAirlock && airlockStates.has(selectedAirlock) && (
        <AirlockControlPanel
          roomId={selectedAirlock}
          state={airlockStates.get(selectedAirlock)!}
          onStateChange={(state) => setAirlockState(selectedAirlock, state)}
          onClose={() => setSelectedAirlock(null)}
        />
      )}
    </div>
  );
}
