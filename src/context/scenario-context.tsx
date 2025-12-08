"use client";

import {
  allScenarios,
  type RoomId,
  Scenario,
  StationMap,
} from "@/src/models/scenario";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { ypsilon14 } from "../models/scenarios/ypsilon-14";
import { useTheme } from "./theme-context";

export type AirlockState = {
  doors: Map<RoomId, boolean>; // Maps connected room IDs to door states (true = open, false = closed)
  passwordVerified?: string[]; // Array of room IDs that have had their passwords verified
  pressureLossRisk: boolean; // Whether opening all doors could cause pressure loss
};

type ScenarioContextType = {
  scenario: Scenario;
  setScenario: (scenario: Scenario) => void;
  activeRooms: Set<RoomId>;
  toggleRoom: (roomId: RoomId) => void;
  airlockStates: Map<RoomId, AirlockState>;
  setAirlockState: (roomId: RoomId, state: Partial<AirlockState>) => void;
  map: StationMap | undefined;
};

const ScenarioContext = createContext<ScenarioContextType | undefined>(
  undefined
);

export function ScenarioProvider({
  children,
  initialMapId,
}: {
  children: ReactNode;
  initialMapId?: string;
}) {
  // Get the initial map based on the URL parameter
  const getInitialMap = () => {
    if (initialMapId !== undefined) {
      const mapIndex = Number.parseInt(initialMapId);
      if (!isNaN(mapIndex) && mapIndex >= 0 && mapIndex < allScenarios.length) {
        return allScenarios[mapIndex];
      }
    }
    return ypsilon14();
  };

  const [scenario, setScenario] = useState<Scenario>(getInitialMap());
  const map = scenario.map;
  const [activeRooms, setActiveRooms] = useState<Set<RoomId>>(new Set());
  const [airlockStates, setAirlockStates] = useState<Map<RoomId, AirlockState>>(
    new Map()
  );
  const { setTheme } = useTheme();

  // Update the map when the URL parameter changes
  useEffect(() => {
    if (initialMapId !== undefined) {
      const mapIndex = Number.parseInt(initialMapId);
      if (!isNaN(mapIndex) && mapIndex >= 0 && mapIndex < allScenarios.length) {
        setScenario(allScenarios[mapIndex]);
      }
    }
  }, [initialMapId]);

  // Update the theme when the scenario changes
  useEffect(() => {
    if (scenario.theme) {
      setTheme(scenario.theme);
    }
  }, [scenario, setTheme]);

  // Initialize airlock states for all airlocks
  useEffect(() => {
    const newStates = new Map<RoomId, AirlockState>();
    if (!map) return;
    map.rooms.forEach((room) => {
      if (room.type === "airlock") {
        // Find all connected rooms
        const connectedRooms = new Map<RoomId, boolean>();
        map.connections.forEach((conn) => {
          if (conn.from === room.id) {
            connectedRooms.set(conn.to, conn.defaultOpen ?? false);
          } else if (conn.to === room.id) {
            connectedRooms.set(conn.from, conn.defaultOpen ?? false);
          }
        });
        newStates.set(room.id, {
          doors: connectedRooms,
          pressureLossRisk: room.pressureLossRisk ?? true,
        });
      }
    });
    setAirlockStates(newStates);
  }, [map]);

  const toggleRoom = (roomId: RoomId) => {
    const newSet = new Set(activeRooms);
    if (newSet.has(roomId)) {
      console.log("deactivating room", roomId);
      newSet.delete(roomId);
    } else {
      console.log("activating room", roomId);
      newSet.add(roomId);
    }
    setActiveRooms(newSet);
  };

  const setAirlockState = (roomId: RoomId, state: Partial<AirlockState>) => {
    setAirlockStates((prev) => {
      const newStates = new Map(prev);
      const currentState = newStates.get(roomId);
      if (currentState) {
        newStates.set(roomId, {
          ...currentState,
          ...state,
          doors: new Map([
            ...currentState.doors,
            ...(state.doors || new Map()),
          ]),
        });
      }
      return newStates;
    });
  };

  return (
    <ScenarioContext.Provider
      value={{
        scenario,
        setScenario,
        activeRooms,
        toggleRoom,
        airlockStates,
        setAirlockState,
        map,
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const context = useContext(ScenarioContext);
  if (context === undefined) {
    throw new Error("useScenario must be used within a ScenarioProvider");
  }
  return context;
}
