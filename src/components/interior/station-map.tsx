"use client";

import { useMarkers } from "@/src/context/marker-context";
import { useScenario } from "@/src/context/scenario-context";
import type { RoomDefinition, RoomId } from "@/src/models/station-graph-map";
import { type JSX, useEffect, useState } from "react";

export function StationMap() {
  const { scenario, map, activeRooms, airlockStates } = useScenario();
  if (!map) return <div>Loading...</div>;

  const { markers, addMarker, removeMarker, updateMarker } = useMarkers();
  const [connections, setConnections] = useState<
    Array<{ from: RoomId; to: RoomId }>
  >([]);
  const [roomPositions, setRoomPositions] = useState<
    Map<RoomId, { x: number; y: number }>
  >(new Map());
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [showMarkerModal, setShowMarkerModal] = useState(false);
  const [markerText, setMarkerText] = useState("");
  const [clickPosition, setClickPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [availableSpace, setAvailableSpace] = useState<{
    width: number;
    height: number;
  }>({ width: 1000, height: 800 });

  // Update available space when container size changes
  useEffect(() => {
    const updateSize = () => {
      const container = document.querySelector(".station-map-container");
      if (container) {
        // Account for the container's padding
        setAvailableSpace({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Calculate the total grid size needed
  const cellSize = map.calculateCellSize(
    availableSpace.width,
    availableSpace.height
  );

  // Calculate the total grid size needed - adjusted to match grid
  const gridWidth = cellSize.width * map.layout.gridSize.columns;

  // Calculate centering offsets based purely on available space
  const xOffset = availableSpace.width - gridWidth;

  // Update room positions with offset
  useEffect(() => {
    const mapConnections = map.connections;
    setConnections(mapConnections);

    const newPositions = new Map<RoomId, { x: number; y: number }>();

    for (const room of map.rooms) {
      const basePos = map.getRoomPosition(
        room.id,
        availableSpace.width,
        availableSpace.height
      );
      if (basePos) {
        newPositions.set(room.id, {
          x: xOffset + basePos.x,
          y: basePos.y,
        });
      }
    }

    setRoomPositions(newPositions);
  }, [map, availableSpace, xOffset, cellSize.width]);

  // Draw connections between rooms
  const renderConnections = () => {
    const connectionLines: JSX.Element[] = [];

    connections.forEach((conn) => {
      const fromPos = roomPositions.get(conn.from);
      const toPos = roomPositions.get(conn.to);
      if (!fromPos || !toPos) return;

      // Determine connection type
      const isFromAirlock = map.isAirlock(conn.from);
      const isToAirlock = map.isAirlock(conn.to);
      const isHallwayConnection =
        map.isHallway(conn.from) && map.isHallway(conn.to);

      // Get door state if this is an airlock connection
      let isDoorOpen = false;
      if (isFromAirlock) {
        isDoorOpen = airlockStates.get(conn.from)?.doors.get(conn.to) ?? false;
      } else if (isToAirlock) {
        isDoorOpen = airlockStates.get(conn.to)?.doors.get(conn.from) ?? false;
      }

      // Determine connection color
      const getConnectionColor = () => {
        if (isDoorOpen) return "#00ff00"; // Green for open doors
        if (isFromAirlock || isToAirlock) return "#ff5500"; // Orange for closed airlock doors
        if (isHallwayConnection) return "#5FA5F9"; // Blue for hallways
        return "hsl(var(--amber-400))"; // Amber for other connections
      };

      connectionLines.push(
        <line
          key={`line-${conn.from}-${conn.to}`}
          x1={fromPos.x}
          y1={fromPos.y}
          x2={toPos.x}
          y2={toPos.y}
          stroke={getConnectionColor()}
          strokeWidth={isFromAirlock || isToAirlock ? 3 : 2}
        />
      );
    });

    return connectionLines;
  };

  const renderRoom = (roomDef: RoomDefinition) => {
    const pos = roomPositions.get(roomDef.id);
    if (!pos) return null;

    // Use consistent cell sizes for all rooms
    const roomSize = map.calculateRoomSize(
      availableSpace.width,
      availableSpace.height
    );
    const roomWidth = roomSize.width;
    const roomHeight = roomSize.height;
    const fontSize = "text-2xl";

    const linkedButton = scenario.controlButtons?.find(
      (button) => button.linkedRoom === roomDef.id
    );
    const isActive =
      linkedButton !== undefined &&
      activeRooms?.has(roomDef.id) !== linkedButton.defaultState;

    // Always use amber color for rooms regardless of emergency mode
    let strokeColor = "stroke-amber-400";
    let fillColor = "fill-black";
    let textColor = "fill-amber-400";

    if (isActive) {
      strokeColor = "stroke-green-500";
      fillColor = "fill-green-900";
      textColor = "fill-green-400";
    }

    return (
      <g
        key={roomDef.id}
        transform={`translate(${pos.x - roomWidth / 2}, ${
          pos.y - roomHeight / 2
        })`}
      >
        <rect
          width={roomWidth}
          height={roomHeight}
          rx="5"
          className={`stroke-2 ${strokeColor} ${fillColor}`}
        />
        <text
          x={roomWidth / 2}
          y={roomHeight / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`font-bold ${fontSize} ${textColor}`}
        >
          {roomDef.id.replace(/_/g, " ")}
        </text>
      </g>
    );
  };

  const renderHallway = (roomDef: RoomDefinition) => {
    const pos = roomPositions.get(roomDef.id);
    if (!pos) return null;

    const roomSize = map.calculateRoomSize(
      availableSpace.width,
      availableSpace.height
    );
    const roomWidth = roomSize.width;
    const roomHeight = roomSize.height;
    const fontSize = "text-2xl";

    return (
      <g
        key={roomDef.id}
        transform={`translate(${pos.x - roomWidth / 2}, ${
          pos.y - roomHeight / 2
        })`}
      >
        <rect
          width={roomWidth}
          height={roomHeight}
          rx="5"
          className="stroke-2 stroke-blue-400 fill-black"
        />
        <text
          x={roomWidth / 2}
          y={roomHeight / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`font-bold ${fontSize} fill-blue-400`}
        >
          {roomDef.id.replace(/_/g, " ")}
        </text>
      </g>
    );
  };

  const renderAirlock = (roomDef: RoomDefinition) => {
    const pos = roomPositions.get(roomDef.id);
    if (!pos) return null;

    const airlockSize = map.calculateAirlockSize(
      availableSpace.width,
      availableSpace.height
    );
    const airlockWidth = airlockSize.width;
    const airlockHeight = airlockSize.height;
    const fontSize = "text-xl";

    const airlockState = airlockStates.get(roomDef.id);
    const isUnlocked = airlockState?.doors.size
      ? Array.from(airlockState.doors.values()).some((isOpen) => isOpen)
      : false;

    return (
      <g
        key={roomDef.id}
        transform={`translate(${pos.x - airlockWidth / 2}, ${
          pos.y - airlockHeight / 2
        })`}
        className={`crt-effect`}
      >
        <rect
          width={airlockWidth}
          height={airlockHeight}
          rx="5"
          className={`
              stroke-2 
              ${
                isUnlocked
                  ? "stroke-green-500 fill-green-900"
                  : "stroke-red-500 fill-red-900"
              }
            `}
        />
        <text
          x={airlockWidth / 2}
          y={airlockHeight / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`font-bold ${fontSize} ${
            isUnlocked ? "fill-green-400" : "fill-red-400"
          }`}
        >
          {roomDef.id.replace(/_/g, " ")}
        </text>
      </g>
    );
  };

  const handleMarkerDragStart = (e: React.MouseEvent, markerId: string) => {
    e.preventDefault();
    setIsDragging(markerId);
  };

  const handleMarkerDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const svg = e.currentTarget.closest("svg");
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;

    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    const svgPoint = point.matrixTransform(ctm.inverse());

    updateMarker(isDragging, { x: svgPoint.x, y: svgPoint.y });
  };

  const handleMarkerDragEnd = () => {
    setIsDragging(null);
  };

  const handleMarkerContextMenu = (e: React.MouseEvent, markerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeMarker(markerId);
  };

  const handleMapContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const svg = e.currentTarget.closest("svg");
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;

    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    const svgPoint = point.matrixTransform(ctm.inverse());
    setClickPosition({ x: svgPoint.x, y: svgPoint.y });
    setShowMarkerModal(true);
  };

  const handleMarkerSubmit = () => {
    if (!markerText.trim() || !clickPosition) return;

    addMarker({
      text: markerText.toUpperCase(),
      x: clickPosition.x,
      y: clickPosition.y,
    });
    setMarkerText("");
    setShowMarkerModal(false);
    setClickPosition(null);
  };

  const renderMarkers = () => {
    return markers.map((marker) => (
      <g
        key={marker.id}
        transform={`translate(${marker.x}, ${marker.y})`}
        onMouseDown={(e) => handleMarkerDragStart(e, marker.id)}
        onContextMenu={(e) => handleMarkerContextMenu(e, marker.id)}
        className="cursor-move crt-effect"
        style={{ pointerEvents: "all" }}
      >
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white text-base font-bold"
          style={{ textShadow: "0 0 2px rgba(0,0,0,0.5)" }}
        >
          {`{{${marker.text}}}`}
        </text>
      </g>
    ));
  };

  const gridLineColor = "border-primary/20";

  return (
    <div
      className="station-map-container border border-primary p-4 md:p-8 h-[500px] md:h-[800px] relative overflow-hidden"
      style={{ userSelect: "none" }}
    >
      <div className="absolute top-2 left-2 z-10">
        <h2 className="text-lg md:text-xl font-bold">
          {scenario.name} - INTERIOR VIEW
        </h2>
        <p className="text-xs md:text-sm">AUTHORIZED ACCESS ONLY</p>
      </div>

      <div className="absolute top-2 right-2 z-10 flex flex-wrap justify-end gap-1 md:gap-2 text-[10px] md:text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 md:w-3 h-2 md:h-3 bg-green-500 rounded-full"></div>
          <span>UNLOCKED</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 md:w-3 h-2 md:h-3 bg-amber-400 rounded-full"></div>
          <span>ROOM</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 md:w-3 h-2 md:h-3 bg-red-500 rounded-full"></div>
          <span>LOCKED</span>
        </div>
        {map.rooms.some((room) => room.type === "hallway") && (
          <div className="flex items-center gap-1">
            <div className="w-2 md:w-3 h-2 md:h-3 bg-blue-400 rounded-full"></div>
            <span>HALLWAY</span>
          </div>
        )}
      </div>

      <div className="absolute inset-0 grid grid-cols-11 grid-rows-10">
        {Array.from({ length: 11 }).map((_, i) => (
          <div
            key={`col-${i}`}
            className={`border-r ${gridLineColor} h-full`}
          />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <div
            key={`row-${i}`}
            className={`border-b ${gridLineColor} w-full`}
          />
        ))}
      </div>

      <svg
        className="w-full h-full"
        viewBox={`0 0 ${availableSpace.width} ${availableSpace.height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ position: "relative", zIndex: 1 }}
        onMouseMove={handleMarkerDrag}
        onMouseUp={handleMarkerDragEnd}
        onMouseLeave={handleMarkerDragEnd}
        onContextMenu={handleMapContextMenu}
      >
        <g>
          {renderConnections()}
          {map.rooms.map((room) => {
            switch (room.type) {
              case "room":
                return renderRoom(room);
              case "hallway":
                return renderHallway(room);
              case "airlock":
                return renderAirlock(room);
            }
          })}
          {renderMarkers()}
        </g>
      </svg>

      {showMarkerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black border border-primary p-4 rounded max-w-sm">
            <h3 className="text-xl font-bold mb-2">ADD MARKER</h3>
            <div className="space-y-2 mb-4">
              <input
                type="text"
                value={markerText}
                onChange={(e) => setMarkerText(e.target.value)}
                placeholder="MARKER TEXT"
                autoFocus={true}
                className="w-full bg-black border border-primary p-2 rounded text-primary uppercase"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleMarkerSubmit();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowMarkerModal(false);
                  setMarkerText("");
                  setClickPosition(null);
                }}
                className="px-4 py-2 border border-primary rounded hover:bg-primary/10"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkerSubmit}
                className="px-4 py-2 border border-primary rounded hover:bg-primary/10"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
