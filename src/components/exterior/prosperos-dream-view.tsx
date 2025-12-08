"use client";

import { usePoi } from "@/src/context/poi-context";
import { useScenario } from "@/src/context/scenario-context";
import { POI_ID } from "@/src/models/poi";
import { useMobile } from "@/src/use-mobile";
import { OrbitControls, PerspectiveCamera, Stars } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ViewAngle } from "./exterior-view";

// Constants for the scene
const ORBIT_RADIUS = 400; // Distance from sun to station
const SUN_SIZE = 80; // Size of the central sun
const STATION_SCALE = 1.5; // Scale factor for the station

// Station structure constants
const RING_RADIUS = 25;
const RING_TUBE_RADIUS = 2;

// Restrict POIs to Prospero's Dream only
type ProsperoPOI =
  | POI_ID.DRY_DOCK
  | POI_ID.STELLAR_BURN
  | POI_ID.CHOP_SHOP
  | POI_ID.ICE_BOX
  | POI_ID.FARM
  | POI_ID.CANYON_HEAVY_MARKET
  | POI_ID.COURT
  | POI_ID.TEMPEST_HQ
  | POI_ID.DOPTOWN
  | POI_ID.CHOKE;

const PROSPERO_POI_IDS: ProsperoPOI[] = [
  POI_ID.DRY_DOCK,
  POI_ID.STELLAR_BURN,
  POI_ID.CHOP_SHOP,
  POI_ID.ICE_BOX,
  POI_ID.FARM,
  POI_ID.CANYON_HEAVY_MARKET,
  POI_ID.COURT,
  POI_ID.TEMPEST_HQ,
  POI_ID.DOPTOWN,
  POI_ID.CHOKE,
];

const isProsperoPoi = (id: POI_ID): id is ProsperoPOI =>
  PROSPERO_POI_IDS.includes(id as ProsperoPOI);

// Map of POI positions in 3D space - This is view-specific data
const POI_POSITIONS: Record<ProsperoPOI, [number, number, number]> = {
  [POI_ID.DRY_DOCK]: [-25, 0, 0], // On the ring, left side
  [POI_ID.STELLAR_BURN]: [-17, 0, 25],
  [POI_ID.CHOP_SHOP]: [0, 0, -25], // On the ring, top
  [POI_ID.ICE_BOX]: [24.5, 0, -15.5], // On the ring, top-right
  [POI_ID.FARM]: [0, 0, 0], // Top of the central spire, level with the ring
  [POI_ID.CANYON_HEAVY_MARKET]: [25, 0, 0], // On the ring, right side
  [POI_ID.COURT]: [21.5, 0, 17.5], // On the ring, bottom-right
  [POI_ID.TEMPEST_HQ]: [3.5, 0, 30], // On the ring, bottom
  [POI_ID.DOPTOWN]: [0, -10, 0], // Lower part of the central spire
  [POI_ID.CHOKE]: [0, -10, 0], // Lower part of the central spire
};

// Create the Prospero's Dream station model
function ProsperosDreamStation({ rotate = false }: { rotate?: boolean }) {
  const { selectedPOI } = usePoi();
  const { scenario } = useScenario();
  const pointsOfInterest = scenario.pointsOfInterest || [];
  const activeSelectedPOI = isProsperoPoi((selectedPOI as POI_ID) || (0 as any))
    ? selectedPOI
    : null;
  const stationRef = useRef<THREE.Group>(null);
  const ringMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const supportRodMaterialRef = useRef<THREE.MeshBasicMaterial[]>([]);
  const poiMaterialsRef = useRef<THREE.MeshBasicMaterial[][]>(
    Array(10)
      .fill(null)
      .map(() => [])
  );

  // Define ring connection points at equal angles around the ring
  const RING_POINTS = [
    [
      RING_RADIUS * Math.cos(Math.PI / 6),
      0,
      RING_RADIUS * Math.sin(Math.PI / 6),
    ], // 30 degrees
    [
      RING_RADIUS * Math.cos(Math.PI / 6 + (2 * Math.PI) / 3),
      0,
      RING_RADIUS * Math.sin(Math.PI / 6 + (2 * Math.PI) / 3),
    ], // 150 degrees
    [
      RING_RADIUS * Math.cos(Math.PI / 6 + (4 * Math.PI) / 3),
      0,
      RING_RADIUS * Math.sin(Math.PI / 6 + (4 * Math.PI) / 3),
    ], // 270 degrees
  ];

  // Function to calculate midpoint and rotation for connection rods
  const getConnectionProps = (ringPoint: number[]) => {
    const [x, y, z] = ringPoint;

    // Calculate total distance from center to ring point
    const totalDistance = Math.sqrt(x * x + z * z);

    // Calculate the actual length of the rod with padding on both ends
    // 5 units padding from center, 4 units from ring
    const length = totalDistance - 8 - 2;

    // Calculate the normalized direction vector
    const dirX = x / totalDistance;
    const dirZ = z / totalDistance;

    // Position is now shifted 20 units from center along the direction vector
    // and placed at the midpoint of the remaining distance
    const startX = dirX * 8; // Start 20 units from center
    const startZ = dirZ * 8;
    const midX = startX + (dirX * length) / 2; // Midpoint of the rod
    const midZ = startZ + (dirZ * length) / 2;

    // Calculate rotation angle to point from center to ring point
    const angle = Math.atan2(z, x);

    return {
      position: [midX, y, midZ] as [number, number, number],
      rotation: [0, -angle, 0] as [number, number, number],
      length: length,
    };
  };

  // Use useFrame hook to rotate the station slowly
  useFrame(() => {
    if (stationRef.current) {
      // Rotate the entire station around Y axis very slowly
      if (rotate) {
        stationRef.current.rotation.y -= 0.0001;
      }
    }
  });

  const deselectedOpacity = 0.18;
  const selectedOpacity = 1.0;
  const selectedStructureOpacity = 0.5;
  const deselectedStructureOpacity = 0.1;

  // Update opacity based on selected POI
  useEffect(() => {
    // Update POI materials
    poiMaterialsRef.current.forEach((materials, index) => {
      if (!materials || materials.length === 0) return;

      const poiId = index + 1;

      const opacity =
        activeSelectedPOI === null || activeSelectedPOI === poiId
          ? selectedOpacity
          : deselectedOpacity;

      materials.forEach((material) => {
        if (material) material.opacity = opacity;
      });
    });

    // Update ring opacity
    if (ringMaterialRef.current) {
      ringMaterialRef.current.opacity = activeSelectedPOI
        ? deselectedStructureOpacity
        : selectedStructureOpacity;
    }

    // Update support rod opacity
    if (supportRodMaterialRef.current) {
      supportRodMaterialRef.current.forEach((material) => {
        if (material)
          material.opacity = activeSelectedPOI
            ? deselectedStructureOpacity
            : selectedStructureOpacity;
      });
    }
  }, [activeSelectedPOI]);

  // Helper function to create material and store in ref
  const createMaterial = (poiId: number, index: number) => {
    const material = new THREE.MeshBasicMaterial({
      color: "#ff1493",
      wireframe: true,
      transparent: true,
      opacity:
        activeSelectedPOI === null || activeSelectedPOI === poiId
          ? selectedOpacity
          : deselectedOpacity,
    });

    // Store material reference
    poiMaterialsRef.current[index].push(material);

    return material;
  };

  // Create complex POI meshes
  const createComplexPOIMesh = (poiId: number, index: number) => {
    switch (poiId) {
      case 1: // Dry Dock
        return (
          <group>
            {/* Main docking structure */}
            <mesh>
              <boxGeometry args={[10, 8, 20]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>
            {/* Control tower */}
            <mesh position={[1, 5.5, 5]}>
              <cylinderGeometry args={[2, 3, 3, 8]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>
            <mesh position={[1, 5.5, -5]}>
              <cylinderGeometry args={[2, 3, 3, 8]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>

            {/* Multiple bay*/}

            <mesh position={[0, -9, -6.5]}>
              <boxGeometry args={[3, 10, 3]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>
            <mesh position={[0, -10.3, 0]}>
              <boxGeometry args={[3, 12.5, 3]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>
            <mesh position={[0, -11.5, 6.5]}>
              <boxGeometry args={[3, 15, 3]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>
          </group>
        );

      case 2: // Stellar Burn
        return (
          <group>
            {/* Main lounge area - cylindrical */}
            <mesh>
              <cylinderGeometry args={[6, 4.5, 6, 8]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>

            {/* Dome top */}
            <mesh position={[0, 3, 0]}>
              <sphereGeometry
                args={[6, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2]}
              />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>
          </group>
        );

      case 3: // Chop Shop
        return (
          <group>
            {/* Main workshop area */}
            <mesh>
              <boxGeometry args={[12, 6, 10]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>

            {/* Multiple small towers/workshops */}
            <mesh position={[0, 0, -6.5]}>
              <boxGeometry args={[3, 10, 3]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>

            <mesh position={[-4, 0, -6.5]}>
              <boxGeometry args={[3, 10, 3]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>

            <mesh position={[4, 0, -6.5]}>
              <boxGeometry args={[3, 10, 3]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>

            {/* Side extension */}
            <mesh position={[9, 0, 0]}>
              <boxGeometry args={[6, 4, 8]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>
          </group>
        );

      case 4: // The Ice Box
        return (
          <group>
            {/* Main tall structure */}
            <mesh>
              <boxGeometry args={[8, 14, 8]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>

            {/* Cooling towers */}
            <mesh position={[0, 10, 0]}>
              <cylinderGeometry args={[3, 4, 6, 5]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>
          </group>
        );

      case 5: // The Farm
        return (
          <group>
            {/* Central dome */}
            <mesh>
              <sphereGeometry
                args={[8, 16, 4, 0, Math.PI * 2, 0, Math.PI / 2]}
              />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>
          </group>
        );

      case 6: // CANYONHEAVY.market
        return (
          <group>
            {/* Main structure - angular and complex */}
            <mesh>
              <boxGeometry args={[12, 8, 5]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>

            {/* Server towers */}
            <mesh position={[-4, 9, 0]}>
              <boxGeometry args={[2, 10, 2]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>

            <mesh position={[0, 7, 0]}>
              <boxGeometry args={[2, 6, 2]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>

            <mesh position={[4, 10, 0]}>
              <boxGeometry args={[2, 12, 2]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>
          </group>
        );

      case 7: // The Court
        return (
          <group>
            {/* Base platform - wide and flat */}
            <mesh position={[0, 2, 0]}>
              <boxGeometry args={[15, 2, 15]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>

            {/* Central arena - octagonal shape approximated with cylinder */}
            <mesh position={[0, 5, 0]}>
              <cylinderGeometry args={[6, 6, 4, 7]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>
          </group>
        );

      case 8: // Tempest HQ
        return (
          <group>
            {/* Base structure - fortress-like */}
            <mesh>
              <boxGeometry args={[14, 8, 14]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>

            {/* Central command tower */}
            <mesh position={[0, 10, 0]}>
              <cylinderGeometry args={[3, 5, 12, 5]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>

            {/* Corner towers */}
            <mesh position={[6, 8, 6]}>
              <boxGeometry args={[2, 8, 2]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>

            <mesh position={[-6, 8, 6]}>
              <boxGeometry args={[2, 8, 2]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>

            <mesh position={[6, 8, -6]}>
              <boxGeometry args={[2, 8, 2]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>

            <mesh position={[-6, 8, -6]}>
              <boxGeometry args={[2, 8, 2]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>
          </group>
        );

      case 9: // Doptown
        return (
          <group>
            {/* Main cylindrical structure */}
            <mesh>
              <cylinderGeometry args={[8, 5, 20, 8]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>
          </group>
        );

      case 10: // The Choke
        return (
          <group>
            {/* Central Spire */}
            <mesh position={[0, -14, 0]}>
              <cylinderGeometry args={[5, 5, 8, 8]} />
              <primitive object={createMaterial(poiId, index)} />
            </mesh>
          </group>
        );

      default:
        return (
          <mesh>
            <boxGeometry args={[6, 6, 6]} />
            <primitive object={createMaterial(poiId, index)} />
          </mesh>
        );
    }
  };

  return (
    <group
      ref={stationRef}
      position={[ORBIT_RADIUS, 0, 0]}
      scale={[STATION_SCALE, STATION_SCALE, STATION_SCALE]}
      name="stationGroup"
    >
      {/* Main Ring */}
      <mesh rotation={[Math.PI / 2, 0, 5.15]}>
        <torusGeometry args={[RING_RADIUS, RING_TUBE_RADIUS, 6, 30, 3.9]} />
        <meshBasicMaterial
          color="#ff1493"
          wireframe={true}
          transparent={true}
          opacity={0.5}
          ref={ringMaterialRef}
        />
      </mesh>

      {/* Support rods connecting central point to ring at 3 equidistant points */}
      {RING_POINTS.map((point, index) => {
        const { position, rotation, length } = getConnectionProps(point);
        return (
          <mesh
            key={`support-rod-${index}`}
            position={position}
            rotation={rotation}
          >
            <boxGeometry args={[length, 1, 1]} />
            <meshBasicMaterial
              color="#ff1493"
              wireframe={true}
              transparent={true}
              opacity={0.5}
              ref={(material) => {
                if (material) {
                  supportRodMaterialRef.current[index] = material;
                }
              }}
            />
          </mesh>
        );
      })}

      {/* Points of Interest with complex geometries */}
      {pointsOfInterest
        .filter((poi) => isProsperoPoi(poi.id))
        .map((poi, index) => {
          const pos = POI_POSITIONS[poi.id as ProsperoPOI];
          return (
            <group
              key={`poi-${poi.id}`}
              position={new THREE.Vector3(pos[0], pos[1], pos[2])}
            >
              {/* Complex POI Structure */}
              {createComplexPOIMesh(poi.id, index)}
            </group>
          );
        })}
    </group>
  );
}

// Create a large orbital system with a central sun
function OrbitalSystem() {
  // Define the orbital parameters
  const segments = 100; // Enough segments to make it look smooth
  const sunRef = useRef<THREE.Mesh>(null);

  // Create points for a horizontal circle in XZ plane
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    // Ensure we're creating valid numbers for the coordinates
    const x = Math.cos(theta) * ORBIT_RADIUS;
    const z = Math.sin(theta) * ORBIT_RADIUS;
    points.push(new THREE.Vector3(x, 0, z));
  }

  // Add rotation animation for the sun itself
  useFrame(() => {
    if (sunRef.current) {
      // Rotate around Y axis
      sunRef.current.rotation.y += 0.0003;
    }
  });

  return (
    <group position={[0, 0, 0]} name="orbitalSystem">
      {/* Orbital path - using simple line */}
      <line>
        <bufferGeometry>
          <float32BufferAttribute
            attach="attributes-position"
            array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
            count={points.length}
            itemSize={3}
            args={[points.flatMap((p) => [p.x, p.y, p.z]), points.length]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ff1493" opacity={0.5} transparent={true} />
      </line>

      {/* Central sun */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[SUN_SIZE, 12, 12]} />
        <meshBasicMaterial
          color="#00817d"
          wireframe={true}
          wireframeLinewidth={1}
        />
      </mesh>
    </group>
  );
}

export function ProsperosDreamView({
  viewAngle = "default",
}: {
  viewAngle?: ViewAngle;
}) {
  // Change from boolean to numeric state for multiple camera modes
  // 0: Fixed View, 1: Orbit View, 2: Free Cam
  const [cameraMode, setCameraMode] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobile();
  const { scenario: currentMap } = useScenario();
  const { selectedPOI } = usePoi();
  const pointsOfInterest = currentMap.pointsOfInterest || [];

  // Function to cycle through camera modes
  const toggleCameraMode = () => {
    setCameraMode((prev) => (prev + 1) % 3);
  };

  // Calculate if free cam is enabled (only in mode 2)
  const isFreeCam = cameraMode === 2;

  // Handle touch events to prevent scrolling issues on mobile
  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    const preventScroll = (e: TouchEvent) => {
      if (isFreeCam) {
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
  }, [isFreeCam]);

  // Get the camera mode display text
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

  const rotateStation =
    cameraMode !== 0 || (cameraMode === 0 && viewAngle === "top");

  return (
    <div className="border border-primary p-2 md:p-4 w-full h-full relative overflow-hidden">
      <div className="absolute top-2 left-2 z-10">
        <h2 className="text-lg md:text-xl font-bold">
          {currentMap.name} - EXTERIOR VIEW
        </h2>
        <p className="text-xs md:text-sm crt-effect">
          INTERGALACTIC CLASSIFICATION: LAWLESS
        </p>
      </div>

      <div
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: isFreeCam ? "none" : "auto" }}
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
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />

          <ProsperosDreamStation rotate={rotateStation} />
          <OrbitalSystem />
          <group position={[ORBIT_RADIUS, 0, 0]}>
            <Stars
              radius={500}
              depth={50}
              count={25000}
              factor={25}
              saturation={0}
              fade
              speed={1}
            />
          </group>

          <PerspectiveCamera
            makeDefault
            position={[ORBIT_RADIUS + 150, 80, 0]}
            fov={isMobile ? 40 : 30}
          />
          {cameraMode === 0 && <FixedCameraController viewAngle={viewAngle} />}
          {cameraMode === 1 && <OrbitCameraController />}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            zoomSpeed={0.6}
            panSpeed={0.5}
            rotateSpeed={0.2}
            target={[ORBIT_RADIUS, 0, 0]}
            enabled={isFreeCam}
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
      {selectedPOI && (
        <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 border border-primary bg-black/90 p-2 md:p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm md:text-lg">
              {
                pointsOfInterest.find((poi) => poi.id === selectedPOI)
                  ?.user_facing_id
              }{" "}
              {pointsOfInterest.find((poi) => poi.id === selectedPOI)?.name ||
                ""}{" "}
            </h3>
          </div>
          <p className="text-xs md:text-base mt-1 md:mt-2">
            {pointsOfInterest.find((poi) => poi.id === selectedPOI)
              ?.description || ""}{" "}
          </p>
        </div>
      )}
    </div>
  );
}

// Split camera controllers into separate components for each mode

// Fixed camera mode - Camera rotates around the station
function FixedCameraController({ viewAngle }: { viewAngle: ViewAngle }) {
  const { camera, scene } = useThree();
  const orbitRef = useRef(0);

  let CAMERA_DISTANCE;
  let CAMERA_HEIGHT;
  let ROTATION_SPEED;

  if (viewAngle === "top") {
    CAMERA_DISTANCE = 0;
    CAMERA_HEIGHT = 500;
    ROTATION_SPEED = 0.0001;
  } else {
    CAMERA_DISTANCE = 140; // Constant distance from station
    CAMERA_HEIGHT = 80; // Constant camera height
    ROTATION_SPEED = 0.0001; // Define a single rotation speed constant
  }

  // Create an orbital movement while keeping the camera fixed relative to the station
  useFrame(() => {
    // Slowly increase the orbit angle using the shared rotation speed
    orbitRef.current += ROTATION_SPEED;

    // Get the station group
    const stationGroup = scene.getObjectByName("stationGroup");
    if (stationGroup) {
      // Keep the station's own rotation using the exact same angle
      stationGroup.rotation.y = -2.3 + orbitRef.current;

      // Calculate camera position to maintain fixed distance from station
      const stationX = stationGroup.position.x;
      const stationZ = stationGroup.position.z;

      // Position camera in orbit around station in the SAME direction (counter-clockwise)
      // Use negative angle for sin and positive for cos to match counter-clockwise rotation
      const cameraX = stationX + CAMERA_DISTANCE * Math.cos(-orbitRef.current);
      const cameraZ = stationZ + CAMERA_DISTANCE * Math.sin(-orbitRef.current);

      // Update camera position and orientation
      camera.position.set(cameraX, CAMERA_HEIGHT, cameraZ);
      camera.lookAt(stationX, 0, stationZ);
    }

    // Move any stars objects to create parallax effect
    if (viewAngle === "default") {
      scene.traverse((object) => {
        if (object.type === "Points" && object.name === "") {
          object.rotation.y -= ROTATION_SPEED;
        }
      });
    }
  });

  // Initial setup
  useEffect(() => {
    // Reset orbit reference on component mount
    orbitRef.current = 0;

    // Initial camera positioning
    camera.position.set(ORBIT_RADIUS + CAMERA_DISTANCE, CAMERA_HEIGHT, 0);
    camera.lookAt(ORBIT_RADIUS, 0, 0);

    // Initial station rotation
    const stationGroup = scene.getObjectByName("stationGroup");
    if (stationGroup) {
      stationGroup.rotation.y = -2.3;
    }
  }, [camera, scene]);

  return null;
}

// Orbit camera mode - Camera stays fixed while station orbits
function OrbitCameraController() {
  const { camera } = useThree();
  const [cameraAngle, setCameraAngle] = useState(0);
  const [panPhase, setPanPhase] = useState(0);

  // Modified easing function that spends most time near minimum
  const modifiedEase = (t: number) => {
    // Convert input to 0-1 range
    const normalized = (Math.sin(t) + 1) / 2;
    // Create a steep curve that spends most time near 0
    return Math.pow(normalized, 4);
  };

  useFrame(() => {
    // Slowly increase the angle
    setCameraAngle((prev) => prev + 0.0005);
    // Update pan phase
    setPanPhase((prev) => prev + 0.0001);

    // Calculate camera position in a circle around the asteroid
    const minRadius = 150; // Minimum distance from asteroid
    const maxRadius = 350; // Maximum distance from asteroid
    const range = maxRadius - minRadius;

    // Apply modified easing function
    const easedPhase = modifiedEase(panPhase);
    const radius = minRadius + easedPhase * range;

    // Calculate height based on distance from asteroid
    const minHeight = 40;
    const maxHeight = 250;
    const height = minHeight + easedPhase * (maxHeight - minHeight);

    const x = ORBIT_RADIUS + Math.cos(cameraAngle) * radius;
    const y = height;
    const z = Math.sin(cameraAngle) * radius;

    camera.position.set(x, y, z);
    camera.lookAt(ORBIT_RADIUS, 0, 0);
  });

  return null;
}
