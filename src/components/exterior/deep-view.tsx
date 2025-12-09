"use client";

import { usePoi } from "@/src/context/poi-context";
import { useScenario } from "@/src/context/scenario-context";
import { POI_ID } from "@/src/models/scenario";
import { useMobile } from "@/src/use-mobile";
import {
  Line as DreiLine,
  OrbitControls,
  PerspectiveCamera,
  Stars,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// Constants used in both Bell and Deep views
export const bellColor = "#40FECA";
export const theDeepColor = "#157892";
export const orbitColor = "#40FECA";
export const roomHighlight = "#CB133B";
export const roomConnection = "#CB133B";

/**
 * Renders a 3D view of The Deep space station and the Bell station orbiting it.
 *
 * The view allows switching between fixed view, orbit view, and free cam mode.
 */
export function DeepView() {
  // 0: Fixed View, 1: Orbit View, 2: Free Cam
  const [cameraMode, setCameraMode] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobile();
  const { scenario: currentMap } = useScenario();

  // Handle touch events to prevent scrolling issues on mobile
  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    const preventScroll = (e: TouchEvent) => {
      if (cameraMode === 2) {
        // Only prevent default if in free cam mode
        e.preventDefault();
      }
    };

    // Add touch event listeners
    canvasElement.addEventListener("touchmove", preventScroll, {
      passive: false,
    });

    return () => {
      // Clean up event listeners
      canvasElement.removeEventListener("touchmove", preventScroll);
    };
  }, [cameraMode]);

  const toggleCameraMode = () => {
    setCameraMode((prev) => (prev + 1) % 3);
  };

  const getCameraModeText = () => {
    switch (cameraMode) {
      case 0:
        return "FIXED VIEW";
      case 1:
        return "ORBIT VIEW";
      case 2:
        return "FREE CAM";
      default:
        return "FIXED VIEW";
    }
  };

  return (
    <div className="border border-primary p-2 md:p-4 w-full h-full relative overflow-hidden">
      <div className="absolute top-2 left-2 z-10">
        <h2 className="text-lg md:text-xl font-bold">
          {currentMap.name} - EXTERIOR VIEW
        </h2>
        <p className="text-xs md:text-sm">STATUS: BLOCKADED</p>
      </div>
      <div
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: cameraMode === 2 ? "none" : "auto" }}
      >
        <Canvas
          gl={{
            powerPreference: "high-performance",
            antialias: true,
            stencil: false,
            depth: true,
            failIfMajorPerformanceCaveat: false,
          }}
          camera={{
            near: 0.1,
            far: 10000,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color("#000000"));
          }}
        >
          <PerspectiveCamera
            makeDefault
            position={[orbitRadius + 50, 30, 0]}
            fov={isMobile ? 40 : 30}
          />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />

          <DeepStation showSectors={true} />
          <BellStation orbit={true} />
          <OrbitalPath />
          <Stars
            radius={500}
            depth={50}
            count={25000}
            factor={25}
            saturation={0}
            fade
            speed={1}
          />

          {cameraMode === 0 && <FixedCameraController />}
          {cameraMode === 1 && <OrbitCameraController />}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            zoomSpeed={0.6}
            panSpeed={0.5}
            rotateSpeed={0.2}
            target={[0, 0, 0]}
            enabled={cameraMode === 2}
            enableDamping={false}
          />
        </Canvas>
      </div>
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={toggleCameraMode}
          className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm font-bold ${
            cameraMode === 2
              ? "bg-primary text-black"
              : "bg-black text-primary border border-primary"
          }`}
        >
          {getCameraModeText()}
        </button>
      </div>
      <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 border border-primary bg-black/90 p-2 md:p-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm md:text-lg">FACILITY STATUS</h3>
          <div className="px-1 md:px-2 py-0.5 md:py-1 rounded bg-red-500 text-black uppercase font-bold text-[10px] md:text-xs">
            DANGER ZONE
          </div>
        </div>
        <p className="text-xs md:text-base mt-1 md:mt-2">
          Property of CLOUDBANK. Facility is under blockade. No access allowed.
          Intruders will be prosecuted.
        </p>
      </div>
    </div>
  );
}

export const orbitRadius = 400; // Distance of The Bell from The Deep
// Base horizontal angle for fixed camera view (radians)
export const FIXED_VIEW_BASE_YAW = -1.5;

/**
 * Renders the The Deep space station with its distinct levels.
 */
export function DeepStation({ showSectors }: { showSectors: boolean }) {
  const stationRef = useRef<THREE.Group>(null);
  const { selectedPOI } = usePoi();

  type DeepPOI =
    | POI_ID.DEEP_RECEPTION_LANDING
    | POI_ID.DEEP_EXEC_LOUNGE
    | POI_ID.DEEP_PSEUDOFLESH_FARMS
    | POI_ID.DEEP_AI_CORE
    | POI_ID.DEEP_SKELETON_WORKS
    | POI_ID.DEEP_STORAGE
    | POI_ID.DEEP_DIS_ASSEMBLY
    | POI_ID.DEEP_QA
    | POI_ID.DEEP_MAINTAINANCE
    | POI_ID.DEEP_BRAIN_CONSTRUCTION
    | POI_ID.DEEP_HUMAN_EMULATION_LAB
    | POI_ID.DEEP_ENGINEERING_AND_SUPPORT;

  const DEEP_POI_IDS: DeepPOI[] = [
    POI_ID.DEEP_RECEPTION_LANDING,
    POI_ID.DEEP_EXEC_LOUNGE,
    POI_ID.DEEP_PSEUDOFLESH_FARMS,
    POI_ID.DEEP_AI_CORE,
    POI_ID.DEEP_SKELETON_WORKS,
    POI_ID.DEEP_STORAGE,
    POI_ID.DEEP_DIS_ASSEMBLY,
    POI_ID.DEEP_QA,
    POI_ID.DEEP_MAINTAINANCE,
    POI_ID.DEEP_BRAIN_CONSTRUCTION,
    POI_ID.DEEP_HUMAN_EMULATION_LAB,
    POI_ID.DEEP_ENGINEERING_AND_SUPPORT,
  ];

  const isDeepPoi = (id: POI_ID | null): id is DeepPOI =>
    id !== null && DEEP_POI_IDS.includes(id as DeepPOI);

  const activeSelectedPOI = isDeepPoi(selectedPOI as POI_ID)
    ? selectedPOI
    : null;

  // Opacity levels
  const selectedNodeOpacity = 1.0;
  const connectedNodeOpacity = 0.5;
  const unconnectedNodeOpacity = 0.0;
  const lineOpacityFull = 1.0;
  const lineOpacityDim = 0;

  // Room position constants
  const POSITIONS: { [key: string]: [x: number, y: number, z: number] } = {
    RECEPTION: [0, 100, 0],
    RECEPTION_LANDING: [33, 100, 0],
    EXEC_LOUNGE_AND_EVNTS: [0, 85, 0],
    MAINTAINANCE: [0, 0, 0],
    AI_CORE: [50, -60, 0], // Secondary pillar

    // RING -- Equally spaced points around the ring
    PSEUDOFELSH_FARMS: [100, 0, 0], // 0 degrees (right)
    QA: [30.9, 0, 95.1], // 72 degrees (top right)
    DIS_ASSEMBLY: [-80.9, 0, 58.8], // 144 degrees (top left)
    BRAIN_CONSTRUCTION: [-80.9, 0, -58.8], // 216 degrees (bottom left)
    SKELETON_WORKS: [30.9, 0, -95.1], // 288 degrees (bottom right)
    // RING --

    STORAGE: [-30, -70, 0],
    PILLAR_CONNECTION: [29, -70, 0],
    HUMAN_EMULATION_LAB: [0, -112, 0],
    ENGENIERING_AND_SUPPORT: [0, -128, 0],
  };

  // Define POI connectivity (undirected edges)
  const CONNECTIONS: [DeepPOI, DeepPOI][] = [
    [POI_ID.DEEP_RECEPTION_LANDING, POI_ID.DEEP_EXEC_LOUNGE],
    [POI_ID.DEEP_EXEC_LOUNGE, POI_ID.DEEP_MAINTAINANCE],
    [POI_ID.DEEP_MAINTAINANCE, POI_ID.DEEP_PSEUDOFLESH_FARMS],
    [POI_ID.DEEP_PSEUDOFLESH_FARMS, POI_ID.DEEP_AI_CORE],
    [POI_ID.DEEP_MAINTAINANCE, POI_ID.DEEP_SKELETON_WORKS],
    [POI_ID.DEEP_MAINTAINANCE, POI_ID.DEEP_BRAIN_CONSTRUCTION],
    [POI_ID.DEEP_MAINTAINANCE, POI_ID.DEEP_DIS_ASSEMBLY],
    [POI_ID.DEEP_DIS_ASSEMBLY, POI_ID.DEEP_STORAGE],
    [POI_ID.DEEP_STORAGE, POI_ID.DEEP_ENGINEERING_AND_SUPPORT],
    [POI_ID.DEEP_MAINTAINANCE, POI_ID.DEEP_QA],
    [POI_ID.DEEP_ENGINEERING_AND_SUPPORT, POI_ID.DEEP_HUMAN_EMULATION_LAB],
    // Additional explicit connection added by user
    [POI_ID.DEEP_RECEPTION_LANDING, POI_ID.DEEP_HUMAN_EMULATION_LAB],
  ];

  const adjacency = new Map<DeepPOI, Set<DeepPOI>>();
  for (const id of DEEP_POI_IDS) adjacency.set(id, new Set());
  CONNECTIONS.forEach(([a, b]) => {
    adjacency.get(a)?.add(b);
    adjacency.get(b)?.add(a);
  });

  const isConnectedToSelected = (id: DeepPOI): boolean => {
    if (!activeSelectedPOI) return false;
    return (
      adjacency.get(activeSelectedPOI as DeepPOI)?.has(id) === true ||
      adjacency.get(id)?.has(activeSelectedPOI as DeepPOI) === true
    );
  };

  const getNodeOpacity = (id: DeepPOI): number => {
    if (!activeSelectedPOI) return selectedNodeOpacity;
    if (id === activeSelectedPOI) return selectedNodeOpacity;
    return isConnectedToSelected(id)
      ? connectedNodeOpacity
      : unconnectedNodeOpacity;
  };

  const getLineOpacity = (a: DeepPOI, b: DeepPOI): number => {
    if (!activeSelectedPOI) return lineOpacityFull;
    if (a === activeSelectedPOI || b === activeSelectedPOI)
      return lineOpacityFull;
    return lineOpacityDim;
  };

  // Function to calculate midpoint and rotation for connection boxes
  const getConnectionProps = (ringPoint: [number, number, number]) => {
    const [x, y, z] = ringPoint;
    // Calculate midpoint between ring point and center
    const midX = x / 2;
    const midZ = z / 2;

    // Calculate length of the connection (distance from center to ring point)
    const length = Math.sqrt(x * x + z * z);

    // Calculate rotation angle (in radians) to point from center to ring point
    const angle = Math.atan2(z, x);

    return {
      position: [midX, y, midZ] as [number, number, number],
      rotation: [0, -angle, 0] as [number, number, number],
      length: length,
    };
  };

  // Use useFrame hook to rotate slowly
  useFrame(() => {
    if (stationRef.current) {
      // Very slight rotation to give life to the station
      stationRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <group ref={stationRef} position={[0, 0, 0]} name="deepStationGroup">
      {/* Base structure - remodeled with central ring and pillars */}
      <group>
        {/* Central Ring - horizontal (Floor 3: The Factory - central hub) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[100, 20, 16, 32]} />
          <meshBasicMaterial color={theDeepColor} wireframe={true} />
        </mesh>

        {/* Main Pillar - taller, extends through both sides of central ring */}
        <mesh position={POSITIONS.MAINTAINANCE}>
          <cylinderGeometry args={[15, 15, 280, 16]} />
          <meshBasicMaterial color={theDeepColor} wireframe={true} />
        </mesh>

        <mesh position={POSITIONS.AI_CORE}>
          <cylinderGeometry args={[8, 8, 110, 16]} />
          <meshBasicMaterial color={theDeepColor} wireframe={true} />
        </mesh>

        <mesh position={POSITIONS.RECEPTION}>
          <cylinderGeometry args={[60, 60, 15, 32]} />
          <meshBasicMaterial color={theDeepColor} wireframe={true} />
        </mesh>

        <mesh position={POSITIONS.EXEC_LOUNGE_AND_EVNTS}>
          <cylinderGeometry args={[70, 70, 15, 32]} />
          <meshBasicMaterial color={theDeepColor} wireframe={true} />
        </mesh>

        {/* Connection boxes from ring points to central pillar */}
        {[
          POSITIONS.PSEUDOFELSH_FARMS,
          POSITIONS.QA,
          POSITIONS.DIS_ASSEMBLY,
          POSITIONS.BRAIN_CONSTRUCTION,
          POSITIONS.SKELETON_WORKS,
        ].map((point, index) => {
          const { position, rotation, length } = getConnectionProps(point);
          return (
            <mesh key={index} position={position} rotation={rotation}>
              <boxGeometry args={[length, 10, 10]} />
              <meshBasicMaterial color={theDeepColor} wireframe={true} />
            </mesh>
          );
        })}

        <mesh position={POSITIONS.STORAGE}>
          <boxGeometry args={[30, 50, 30]} />
          <meshBasicMaterial color={theDeepColor} wireframe={true} />
        </mesh>

        <mesh position={POSITIONS.PILLAR_CONNECTION}>
          <boxGeometry args={[27, 10, 10]} />
          <meshBasicMaterial color={theDeepColor} wireframe={true} />
        </mesh>

        <mesh position={POSITIONS.HUMAN_EMULATION_LAB}>
          <cylinderGeometry args={[25, 25, 8, 16]} />
          <meshBasicMaterial color={theDeepColor} wireframe={true} />
        </mesh>

        <mesh position={POSITIONS.ENGENIERING_AND_SUPPORT}>
          <cylinderGeometry args={[35, 25, 25, 16]} />
          <meshBasicMaterial color={theDeepColor} wireframe={true} />
        </mesh>

        {/* Connection nodes - red dots at key intersections */}
        {showSectors &&
          (
            [
              {
                pos: POSITIONS.RECEPTION_LANDING,
                id: POI_ID.DEEP_RECEPTION_LANDING,
              },
              {
                pos: POSITIONS.EXEC_LOUNGE_AND_EVNTS,
                id: POI_ID.DEEP_EXEC_LOUNGE,
              },
              {
                pos: POSITIONS.PSEUDOFELSH_FARMS,
                id: POI_ID.DEEP_PSEUDOFLESH_FARMS,
              },
              { pos: POSITIONS.AI_CORE, id: POI_ID.DEEP_AI_CORE },
              { pos: POSITIONS.SKELETON_WORKS, id: POI_ID.DEEP_SKELETON_WORKS },
              { pos: POSITIONS.STORAGE, id: POI_ID.DEEP_STORAGE },
              { pos: POSITIONS.DIS_ASSEMBLY, id: POI_ID.DEEP_DIS_ASSEMBLY },
              { pos: POSITIONS.QA, id: POI_ID.DEEP_QA },
              { pos: POSITIONS.MAINTAINANCE, id: POI_ID.DEEP_MAINTAINANCE },
              {
                pos: POSITIONS.BRAIN_CONSTRUCTION,
                id: POI_ID.DEEP_BRAIN_CONSTRUCTION,
              },
              {
                pos: POSITIONS.HUMAN_EMULATION_LAB,
                id: POI_ID.DEEP_HUMAN_EMULATION_LAB,
              },
              {
                pos: POSITIONS.ENGENIERING_AND_SUPPORT,
                id: POI_ID.DEEP_ENGINEERING_AND_SUPPORT,
              },
            ] as { pos: [number, number, number]; id: POI_ID }[]
          ).map(({ pos, id }, i) => {
            const opacity = getNodeOpacity(id as DeepPOI);
            return (
              <mesh key={i} position={pos}>
                <sphereGeometry args={[5, 16, 16]} />
                <meshBasicMaterial
                  color={roomHighlight}
                  wireframe={false}
                  transparent={true}
                  opacity={opacity}
                />
              </mesh>
            );
          })}

        {/* Connection tubes between nodes - updated to match image network */}
        {showSectors && (
          <group>
            <Line
              points={[
                POSITIONS.RECEPTION_LANDING,
                POSITIONS.EXEC_LOUNGE_AND_EVNTS,
              ]}
              color={roomConnection}
              lineWidth={1}
              opacity={getLineOpacity(
                POI_ID.DEEP_RECEPTION_LANDING,
                POI_ID.DEEP_EXEC_LOUNGE
              )}
            />

            <Line
              points={[
                POSITIONS.RECEPTION_LANDING,
                POSITIONS.HUMAN_EMULATION_LAB,
              ]}
              color={roomConnection}
              lineWidth={1}
              opacity={activeSelectedPOI ? 0.2 : 1}
            />

            <Line
              points={[POSITIONS.EXEC_LOUNGE_AND_EVNTS, POSITIONS.MAINTAINANCE]}
              color={roomConnection}
              lineWidth={1}
              opacity={getLineOpacity(
                POI_ID.DEEP_EXEC_LOUNGE,
                POI_ID.DEEP_MAINTAINANCE
              )}
            />

            <Line
              points={[POSITIONS.MAINTAINANCE, POSITIONS.PSEUDOFELSH_FARMS]}
              color={roomConnection}
              lineWidth={1}
              opacity={getLineOpacity(
                POI_ID.DEEP_MAINTAINANCE,
                POI_ID.DEEP_PSEUDOFLESH_FARMS
              )}
            />

            <Line
              points={[POSITIONS.PSEUDOFELSH_FARMS, POSITIONS.AI_CORE]}
              color={roomConnection}
              lineWidth={1}
              opacity={getLineOpacity(
                POI_ID.DEEP_PSEUDOFLESH_FARMS,
                POI_ID.DEEP_AI_CORE
              )}
            />

            <Line
              points={[POSITIONS.MAINTAINANCE, POSITIONS.SKELETON_WORKS]}
              color={roomConnection}
              lineWidth={1}
              opacity={getLineOpacity(
                POI_ID.DEEP_MAINTAINANCE,
                POI_ID.DEEP_SKELETON_WORKS
              )}
            />

            <Line
              points={[POSITIONS.MAINTAINANCE, POSITIONS.BRAIN_CONSTRUCTION]}
              color={roomConnection}
              lineWidth={1}
              opacity={getLineOpacity(
                POI_ID.DEEP_MAINTAINANCE,
                POI_ID.DEEP_BRAIN_CONSTRUCTION
              )}
            />

            <Line
              points={[POSITIONS.MAINTAINANCE, POSITIONS.DIS_ASSEMBLY]}
              color={roomConnection}
              lineWidth={1}
              opacity={getLineOpacity(
                POI_ID.DEEP_MAINTAINANCE,
                POI_ID.DEEP_DIS_ASSEMBLY
              )}
            />

            <Line
              points={[POSITIONS.DIS_ASSEMBLY, POSITIONS.STORAGE]}
              color={roomConnection}
              lineWidth={1}
              opacity={getLineOpacity(
                POI_ID.DEEP_DIS_ASSEMBLY,
                POI_ID.DEEP_STORAGE
              )}
            />

            <Line
              points={[POSITIONS.STORAGE, POSITIONS.ENGENIERING_AND_SUPPORT]}
              color={roomConnection}
              lineWidth={1}
              opacity={getLineOpacity(
                POI_ID.DEEP_STORAGE,
                POI_ID.DEEP_ENGINEERING_AND_SUPPORT
              )}
            />

            <Line
              points={[POSITIONS.MAINTAINANCE, POSITIONS.QA]}
              color={roomConnection}
              lineWidth={1}
              opacity={getLineOpacity(POI_ID.DEEP_MAINTAINANCE, POI_ID.DEEP_QA)}
            />

            <Line
              points={[
                POSITIONS.ENGENIERING_AND_SUPPORT,
                POSITIONS.HUMAN_EMULATION_LAB,
              ]}
              color={roomConnection}
              lineWidth={1}
              opacity={getLineOpacity(
                POI_ID.DEEP_ENGINEERING_AND_SUPPORT,
                POI_ID.DEEP_HUMAN_EMULATION_LAB
              )}
            />

            <Line
              points={[
                POSITIONS.RECEPTION_LANDING,
                POSITIONS.HUMAN_EMULATION_LAB,
              ]}
              color={roomConnection}
              lineWidth={1}
              opacity={getLineOpacity(
                POI_ID.DEEP_RECEPTION_LANDING,
                POI_ID.DEEP_HUMAN_EMULATION_LAB
              )}
            />
          </group>
        )}
      </group>
    </group>
  );
}

/**
 * Simple line component to connect nodes.
 */
export function Line({
  points,
  color,
  lineWidth,
  opacity = 1,
}: {
  points: number[][];
  color: string;
  lineWidth: number;
  opacity?: number;
}) {
  const linePoints = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  return (
    <DreiLine
      points={linePoints}
      color={color}
      lineWidth={lineWidth}
      transparent={opacity < 1}
      opacity={opacity}
    />
  );
}

/**
 * Renders the Bell station - smaller station that orbits The Deep.
 */
export function BellStation({ orbit = false }: { orbit?: boolean }) {
  const bellRef = useRef<THREE.Group>(null);
  const [selfRotation, setSelfRotation] = useState(0);
  const [orbitRotation, setOrbitRotation] = useState(0);

  // Animate the Bell orbiting around The Deep
  useFrame(() => {
    setSelfRotation((prev) => prev + 0.002); // Increment rotation angle
    setOrbitRotation((prev) => prev + 0.0001);

    if (bellRef.current) {
      // Calculate the angle to point toward the center (0,0,0)
      // This ensures the wide end of the cylinder always faces the center
      bellRef.current.lookAt(0, 0, 0);

      // Apply an additional rotation to align the cylinder's axis
      // so the wide end points toward the center
      bellRef.current.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
      bellRef.current.rotateOnAxis(new THREE.Vector3(0, 1, 0), selfRotation);

      if (orbit) {
        // Orbit the Bell around The Deep
        const x = Math.cos(orbitRotation) * orbitRadius;
        const z = Math.sin(orbitRotation) * orbitRadius;
        bellRef.current.position.set(x, 0, z);
      }
    }
  });

  return (
    <group ref={bellRef} position={[orbitRadius, 0, 0]}>
      {/* Rotating station group */}
      <mesh>
        <cylinderGeometry args={[20, 10, 20, 16]} />
        <meshBasicMaterial color={bellColor} wireframe={true} />
      </mesh>
    </group>
  );
}

/**
 * Creates an orbital path for The Bell.
 */
export function OrbitalPath() {
  // Define the orbital parameters
  const segments = 100; // Enough segments to make it look smooth

  // Create points for a horizontal circle in XZ plane
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = Math.cos(theta) * orbitRadius;
    const z = Math.sin(theta) * orbitRadius;
    points.push(new THREE.Vector3(x, 0, z));
  }

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          count={points.length}
          itemSize={3}
          args={[new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color={orbitColor} opacity={0.5} transparent={true} />
    </line>
  );
}

/**
 * Controls the camera movement for the fixed cam mode.
 */
function FixedCameraController() {
  const { camera, scene } = useThree();
  const orbitRef = useRef(0);

  const CAMERA_DISTANCE = 550;
  const CAMERA_HEIGHT = 130;
  const ROTATION_SPEED = 0.0001;

  useFrame(() => {
    orbitRef.current += ROTATION_SPEED;
    const cameraX = Math.cos(-orbitRef.current) * CAMERA_DISTANCE;
    const cameraZ = Math.sin(-orbitRef.current) * CAMERA_DISTANCE;
    camera.position.set(cameraX, CAMERA_HEIGHT, cameraZ);
    camera.lookAt(0, -15, 0);

    const stationGroup = scene.getObjectByName("deepStationGroup");
    if (stationGroup) {
      stationGroup.rotation.y = FIXED_VIEW_BASE_YAW + orbitRef.current;
    }
  });

  useEffect(() => {
    orbitRef.current = 0;
    camera.position.set(CAMERA_DISTANCE, CAMERA_HEIGHT, 0);
    camera.lookAt(0, -15, 0);

    const stationGroup = scene.getObjectByName("deepStationGroup");
    if (stationGroup) {
      stationGroup.rotation.y = FIXED_VIEW_BASE_YAW;
    }
  }, [camera, scene]);

  return null;
}

/**
 * Controls the camera movement for the orbit cam mode.
 */
function OrbitCameraController() {
  const { camera } = useThree();
  const [cameraAngle, setCameraAngle] = useState(0);
  const [panPhase, setPanPhase] = useState(0);

  const modifiedEase = (t: number) => {
    const normalized = (Math.sin(t) + 1) / 2;
    return Math.pow(normalized, 4);
  };

  useFrame(() => {
    setCameraAngle((prev) => prev + 0.0005);
    setPanPhase((prev) => prev + 0.0001);

    const minRadius = 500;
    const maxRadius = 820;
    const range = maxRadius - minRadius;

    const easedPhase = modifiedEase(panPhase);
    const radius = minRadius + easedPhase * range;

    const minHeight = 50;
    const maxHeight = 200;
    const height = minHeight + easedPhase * (maxHeight - minHeight);

    const x = Math.cos(cameraAngle) * radius;
    const y = height;
    const z = Math.sin(cameraAngle) * radius;

    camera.position.set(x, y, z);
    camera.lookAt(0, -15, 0);
  });

  return null;
}
