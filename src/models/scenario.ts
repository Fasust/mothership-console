import { Theme } from "../context/theme-context";
import { bellStation, deepStation } from "./scenarios/deep";
import { gretaBase } from "./scenarios/greta-base";
import { prosperosDream } from "./scenarios/prosperos-dream";
import { warped } from "./scenarios/warped";
import { ypsilon14, ypsilon14WithTunnels } from "./scenarios/ypsilon-14";

export type RoomId = string;
export type RoomType = "room" | "airlock" | "hallway";

export type RoomDefinition = {
  id: RoomId;
  type: RoomType;
  pressureLossRisk?: boolean; // true = opening all doors could cause pressure loss
};

export type ConnectionDefinition = {
  from: RoomId;
  to: RoomId;
  password?: string;
  defaultOpen?: boolean;
};

export type LevelDefinition = {
  rooms: (RoomId | RoomDefinition | null)[];
  horizontalSpacing?: number;
};

export type SystemLog = {
  time: string;
  message: string;
};

export type ControlButtonType = "toggle" | "action";
export type ControlButtonFunction = "emergency" | "self-destruct";

export type ControlButton = {
  label: string;
  defaultState: boolean;
  toggleStates?: {
    true: string;
    false: string;
  };
  restricted: boolean;
  type: ControlButtonType;
  function?: ControlButtonFunction;
  linkedRoom?: RoomId;
};

export type ChartType =
  | "oxygen"
  | "temperature"
  | "radiation"
  | "power"
  | "humidity"
  | "pressure";

export type ExteriorStatType =
  | "composition"
  | "rotationSpeed"
  | "surfaceTemp"
  | "radiationLevel"
  | "resourcesExtracted"
  | "remainingDeposits"
  | "atmosphericAnalysis"
  | "windSpeed"
  | "humidity"
  | "researchProgress"
  | "anomalyReadings";

export enum POI_ID {
  DRY_DOCK = 1,
  STELLAR_BURN = 2,
  CHOP_SHOP = 3,
  ICE_BOX = 4,
  FARM = 5,
  CANYON_HEAVY_MARKET = 6,
  COURT = 7,
  TEMPEST_HQ = 8,
  DOPTOWN = 9,
  CHOKE = 10,
  DEEP_RECEPTION_LANDING = 11,
  DEEP_EXEC_LOUNGE = 12,
  DEEP_PSEUDOFLESH_FARMS = 13,
  DEEP_AI_CORE = 14,
  DEEP_SKELETON_WORKS = 15,
  DEEP_STORAGE = 16,
  DEEP_DIS_ASSEMBLY = 17,
  DEEP_QA = 18,
  DEEP_MAINTAINANCE = 19,
  DEEP_BRAIN_CONSTRUCTION = 20,
  DEEP_HUMAN_EMULATION_LAB = 21,
  DEEP_ENGINEERING_AND_SUPPORT = 22,
}

export type PointOfInterest = {
  id: POI_ID;
  name: string;
  description: string;
  user_facing_id: string;
};

export type ExteriorStatConfig = {
  type: ExteriorStatType;
  label: string;
  unit?: string;
  defaultValue?: number | number[];
  min?: number;
  max?: number;
  isArray?: boolean;
  isAlert?: boolean; // Whether to show this stat in alert color when exceeding threshold
  alertThreshold?: number; // Value at which the stat should show as alert
};

export type DiagnosticMessageType = "check" | "warning" | "notice" | "summary";

export type DiagnosticMessage = {
  type: DiagnosticMessageType;
  message: string;
  status?: string; // For "check" type messages that have a status like "Done"
  delay?: number; // Optional delay in ms before showing this message
};

export type DiagnosticsData = {
  title: string;
  messages: DiagnosticMessage[];
};

export type ColumnType = "string" | "currency";

export type Scenario = {
  id: string;
  name: string;
  type: "asteroid" | "planet" | "bell" | "deep" | "prosperos" | "ship";
  crew: {
    current: number;
    capacity: number;
  };
  adminCredentials: {
    username: string;
    password: string;
  };
  charts: ChartType[];
  stats?: Record<string, string>;
  exteriorStats?: ExteriorStatConfig[];
  pointsOfInterest?: PointOfInterest[];
  map?: StationMap;
  asciiMap?: string;
  systemLogs?: SystemLog[];
  controlButtons?: ControlButton[];
  theme?: Theme;
  showPcView?: boolean;
};

export type MapLayout = {
  gridSize: {
    columns: number; // Number of columns in the grid
    rows: number; // Number of rows in the grid
  };
  airlockSizeModifier: {
    width: number;
    height: number;
  };
  outerPadding: {
    top: number;
  };
  roomPadding: {
    horizontal: number;
    vertical: number;
  };
};

const minRoomWidth = 150;
const minRoomHeight = 50;

export class StationMap {
  public readonly rooms: RoomDefinition[] = [];
  public readonly connections: ConnectionDefinition[] = [];
  public readonly levels: LevelDefinition[] = [];
  public readonly layout: MapLayout;
  public readonly diagnostics?: DiagnosticsData;

  constructor({
    levels,
    connections = [],
    layout = {
      gridSize: {
        columns: 3,
        rows: 8,
      },
      airlockSizeModifier: {
        width: 0.6,
        height: 0.9,
      },
      outerPadding: {
        top: 60,
      },
      roomPadding: {
        horizontal: 60,
        vertical: 10,
      },
    },
    diagnostics,
    systemLogs,
    controlButtons,
  }: {
    levels: LevelDefinition[];
    connections?: ConnectionDefinition[];
    layout?: MapLayout;
    diagnostics?: DiagnosticsData;
    systemLogs?: SystemLog[];
    controlButtons?: ControlButton[];
  }) {
    this.layout = layout;
    this.connections = connections;
    this.diagnostics = diagnostics;
    // Process levels to extract rooms
    for (const level of levels) {
      for (const room of level.rooms) {
        if (room !== null) {
          const id = typeof room === "string" ? room : room?.id;
          let type: RoomType = "room";
          let pressureLossRisk = false;

          if (typeof room === "string") {
            const isAirlock = id.includes("AIRLOCK");
            const isHallway = id.includes("HALLWAY");
            pressureLossRisk = isAirlock;
            type = isAirlock ? "airlock" : isHallway ? "hallway" : "room";
          } else {
            pressureLossRisk = room.pressureLossRisk ?? false;
            type = room.type;
          }

          if (!this.rooms.some((r) => r.id === id)) {
            this.rooms.push({
              id,
              type,
              pressureLossRisk,
            });
          }
        }
      }
    }

    this.levels = levels;
  }

  getRoomById(id: RoomId): RoomDefinition | undefined {
    return this.rooms.find((room) => room.id === id);
  }

  isAirlock(roomId: RoomId): boolean {
    return this.getRoomById(roomId)?.type === "airlock";
  }

  isHallway(roomId: RoomId): boolean {
    return this.getRoomById(roomId)?.type === "hallway";
  }

  getConnectionsForRoom(roomId: RoomId): ConnectionDefinition[] {
    return this.connections.filter(
      (conn) => conn.from === roomId || conn.to === roomId
    );
  }

  getConnectionBetweenRooms(
    roomId1: RoomId,
    roomId2: RoomId
  ): ConnectionDefinition | undefined {
    return this.connections.find(
      (conn) =>
        (conn.from === roomId1 && conn.to === roomId2) ||
        (conn.from === roomId2 && conn.to === roomId1)
    );
  }

  getConnectionPassword(fromId: RoomId, toId: RoomId): string | undefined {
    return this.connections.find(
      (conn) =>
        (conn.from === fromId && conn.to === toId) ||
        (conn.from === toId && conn.to === fromId)
    )?.password;
  }

  getRoomPosition(
    roomId: RoomId,
    availableWidth: number,
    availableHeight: number
  ): { x: number; y: number } | undefined {
    const cellSize = this.calculateCellSize(availableWidth, availableHeight);

    for (let levelIndex = 0; levelIndex < this.levels.length; levelIndex++) {
      const level = this.levels[levelIndex];
      const roomIndex = level.rooms.findIndex(
        (room) => (typeof room === "string" ? room : room?.id) === roomId
      );

      if (roomIndex !== -1) {
        return {
          x: roomIndex * cellSize.width,
          y: this.layout.outerPadding.top + levelIndex * cellSize.height,
        };
      }
    }
    return undefined;
  }

  calculateCellSize(
    availableWidth: number,
    availableHeight: number
  ): { width: number; height: number } {
    // Calculate the available space for the grid
    const gridWidth = availableWidth;
    const gridHeight = availableHeight;

    // Calculate cell size based on grid dimensions
    const cellWidth = gridWidth / (this.layout.gridSize.columns + 1);
    const cellHeight = gridHeight / this.layout.gridSize.rows;

    return {
      width: cellWidth,
      height: cellHeight,
    };
  }

  calculateRoomSize(
    availableWidth: number,
    availableHeight: number
  ): { width: number; height: number } {
    const cellSize = this.calculateCellSize(availableWidth, availableHeight);
    const roomWidth = Math.max(
      minRoomWidth,
      cellSize.width - this.layout.roomPadding.horizontal * 2
    );
    const roomHeight = Math.max(
      minRoomHeight,
      cellSize.height - this.layout.roomPadding.vertical * 2
    );
    return { width: roomWidth, height: roomHeight };
  }

  calculateAirlockSize(
    availableWidth: number,
    availableHeight: number
  ): { width: number; height: number } {
    const roomSize = this.calculateRoomSize(availableWidth, availableHeight);
    const airlockWidth = roomSize.width * this.layout.airlockSizeModifier.width;
    const airlockHeight =
      roomSize.height * this.layout.airlockSizeModifier.height;
    return { width: airlockWidth, height: airlockHeight };
  }
}

export const allScenarios = [
  ypsilon14(),
  ypsilon14WithTunnels(),
  gretaBase(),
  bellStation(),
  deepStation(),
  prosperosDream(),
  warped(),
];
