"use client";

import { useAdmin } from "@/src/context/admin-context";
import { AirlockState, useScenario } from "@/src/context/scenario-context";
import type { RoomId } from "@/src/models/scenario";
import { useEffect, useState } from "react";
import { ControlButton } from "./control-button";

interface AirlockControlPanelProps {
  roomId: RoomId;
  state: AirlockState;
  onStateChange: (state: Partial<AirlockState>) => void;
  onClose: () => void;
}

export function AirlockControlPanel({
  roomId,
  state,
  onStateChange,
  onClose,
}: AirlockControlPanelProps) {
  const { isAdmin, showLogin } = useAdmin();
  const { map } = useScenario();
  if (!map) return <div>Loading...</div>;

  const [showAllOpenWarning, setAllOpenWarning] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [targetDoorRoom, setTargetDoorRoom] = useState<RoomId | null>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleOpenAll = () => {
    if (state.pressureLossRisk && !isAdmin) {
      showLogin();
      return;
    }
    if (state.pressureLossRisk) {
      setAllOpenWarning(true);
    } else {
      openAllDoorsThatDoNotNeedPassword();
    }
  };

  const handleCloseAll = () => {
    const allDoorsClosed = new Map<RoomId, boolean>();
    state.doors.forEach((_, roomId) => {
      allDoorsClosed.set(roomId, false);
    });
    onStateChange({ doors: allDoorsClosed });
  };

  const checkAllDoorsOpen = (newDoors: Map<RoomId, boolean>) => {
    return Array.from(newDoors.values()).every((isOpen) => isOpen);
  };

  const handleConfirmAllOpen = () => {
    setAllOpenWarning(false);
    if (!isAdmin) return;

    openAllDoorsThatDoNotNeedPassword();
  };

  const openAllDoorsThatDoNotNeedPassword = () => {
    const allDoorsOpen = new Map<RoomId, boolean>();
    state.doors.forEach((_, connectedRoomId) => {
      // Check if the door is restricted
      const password = map.getConnectionPassword(roomId, connectedRoomId);
      const isRestricted = password !== undefined;
      const hasPassword = state.passwordVerified?.includes(connectedRoomId);
      if (isRestricted && !hasPassword) {
        allDoorsOpen.set(connectedRoomId, false);
      } else {
        allDoorsOpen.set(connectedRoomId, true);
      }
    });
    onStateChange({ doors: allDoorsOpen });
  };

  const handleCancelAllOpen = () => {
    setAllOpenWarning(false);
  };

  const handleDoorToggle = (connectedRoomId: RoomId, currentState: boolean) => {
    // Check if this connection requires a password
    const password = map.getConnectionPassword(roomId, connectedRoomId);
    const verifiedDoors = state.passwordVerified
      ? new Set(state.passwordVerified)
      : new Set<string>();

    // If the door requires a password and hasn't been verified, show password prompt
    if (password && !verifiedDoors.has(connectedRoomId)) {
      setTargetDoorRoom(connectedRoomId);
      setShowPasswordPrompt(true);
      return;
    }

    const newDoors = new Map(state.doors);
    newDoors.set(connectedRoomId, !currentState);

    // If this action would result in all doors being open, show warning
    if (checkAllDoorsOpen(newDoors) && state.pressureLossRisk) {
      setAllOpenWarning(true);
    } else {
      onStateChange({ doors: newDoors });
    }
  };

  const handlePasswordSubmit = () => {
    if (!targetDoorRoom) return;

    const requiredPassword = map.getConnectionPassword(roomId, targetDoorRoom);
    if (passwordInput === requiredPassword) {
      setPasswordError(false);
      setShowPasswordPrompt(false);
      setPasswordInput("");

      // Add this door to the verified set
      const verifiedDoors = state.passwordVerified
        ? new Set(state.passwordVerified)
        : new Set<string>();
      verifiedDoors.add(targetDoorRoom);
      onStateChange({ passwordVerified: Array.from(verifiedDoors) });

      // Toggle the door
      const newDoors = new Map(state.doors);
      newDoors.set(targetDoorRoom, !state.doors.get(targetDoorRoom));
      onStateChange({ doors: newDoors });

      setTargetDoorRoom(null);
    } else {
      setPasswordError(true);
    }
  };

  const isAnyDoorOpen = Array.from(state.doors.values()).some(
    (isOpen) => isOpen
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-black border border-primary p-4 rounded max-w-sm w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">{roomId.replace(/_/g, " ")}</h3>
              {state.pressureLossRisk && (
                <div className="flex items-center gap-1 text-red-500">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>PRESSURE LOSS RISK</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-primary hover:text-primary/80"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6 crt-effect">
            <div className="relative w-full h-32 mb-4">
              <svg className="w-full h-full">
                <rect
                  width="100%"
                  height="100%"
                  rx="5"
                  className={`stroke-2 ${
                    isAnyDoorOpen
                      ? "stroke-green-500 fill-green-900"
                      : "stroke-red-500 fill-red-900"
                  }`}
                />
                {Array.from(state.doors.entries()).map(
                  ([connectedRoomId, isOpen], index) => {
                    const isLeft = index % 2 === 0;
                    return (
                      <rect
                        key={connectedRoomId}
                        x={isLeft ? "0" : "90%"}
                        y="30%"
                        width="10%"
                        height="40%"
                        className={`stroke-2 ${
                          isOpen
                            ? "stroke-green-500 fill-green-900"
                            : "stroke-red-500 fill-red-900"
                        }`}
                      />
                    );
                  }
                )}
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`font-bold ${
                    isAnyDoorOpen ? "fill-green-400" : "fill-red-400"
                  }`}
                >
                  {roomId.replace(/_/g, " ")}
                </text>
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Array.from(state.doors.entries()).map(
                ([connectedRoomId, isOpen]) => {
                  const connectionPassword = map.getConnectionPassword(
                    roomId,
                    connectedRoomId
                  );
                  const isRestricted =
                    connectionPassword !== undefined &&
                    !state.passwordVerified?.includes(connectedRoomId);

                  return (
                    <ControlButton
                      key={connectedRoomId}
                      onClick={() => handleDoorToggle(connectedRoomId, isOpen)}
                      label={`${connectedRoomId.replace(/_/g, " ")}: ${
                        isOpen ? "UNLOCKED" : "LOCKED"
                      }`}
                      type="toggle"
                      isActive={isOpen}
                      restrictionLabel="MANUAL OVERRIDE"
                      isRestricted={isRestricted}
                    />
                  );
                }
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-6">
              <ControlButton
                label="UNLOCK ALL"
                isActive={false}
                type={state.pressureLossRisk ? "toggle" : "action"}
                isRestricted={state.pressureLossRisk && !isAdmin}
                onClick={handleOpenAll}
              />
              <ControlButton
                label="LOCK ALL"
                type="action"
                onClick={handleCloseAll}
              />
            </div>
          </div>
        </div>
      </div>
      {showAllOpenWarning && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[60]">
          <div className="bg-black border border-red-500 p-4 rounded max-w-sm w-full">
            <h3 className="text-xl font-bold text-red-500 mb-2">DANGER</h3>
            <p className="mb-4">
              {isAdmin
                ? "Opening all doors on an airlock may result in loss of cabin pressure. Are you sure you want to proceed?"
                : "Opening all doors on an airlock may result in loss of cabin pressure. Administrator privileges required to unlock all doors."}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelAllOpen}
                className="px-4 py-2 border border-primary rounded hover:bg-primary/20"
              >
                CANCEL
              </button>
              {isAdmin && (
                <ControlButton
                  label="UNLOCK ALL"
                  isActive={false}
                  type="toggle"
                  isRestricted={!isAdmin}
                  onClick={handleConfirmAllOpen}
                />
              )}
            </div>
          </div>
        </div>
      )}
      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[60]">
          <div className="bg-black border border-primary p-4 rounded max-w-sm w-full">
            <h3 className="text-xl font-bold mb-2">ACCESS CODE REQUIRED</h3>
            <p className="mb-4">
              Please enter the access code to operate this door.
            </p>
            <div className="space-y-2 mb-4">
              <input
                type="text"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="ENTER ACCESS CODE"
                className="w-full bg-black border border-primary p-2 rounded text-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePasswordSubmit();
                  }
                }}
              />
              {passwordError && (
                <p className="text-red-500 text-sm">Invalid access code</p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowPasswordPrompt(false);
                  setPasswordInput("");
                  setPasswordError(false);
                  setTargetDoorRoom(null);
                }}
                className="px-4 py-2 border border-primary rounded hover:bg-primary/20"
              >
                CANCEL
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="px-4 py-2 border border-primary rounded hover:bg-primary/20"
              >
                SUBMIT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
