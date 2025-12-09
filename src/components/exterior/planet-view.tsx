"use client";

import { useScenario } from "@/src/context/scenario-context";
import { useMobile } from "@/src/use-mobile";
import { OrbitControls, PerspectiveCamera, Stars } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const orbitRadius = 120; // Distance from sun to planet
const stationPosition = { x: 1, y: 0.35 }; // Normalized position on planet surface (0-1)
const planetSize = 10;
const sunSize = 30; // Size of the central sun

/**
 * Renders a 3D view of a planet with a station.
 *
 * The view allows switching between free cam mode and orbital cam mode.
 */
export function PlanetView() {
  const [isFreeCam, setIsFreeCam] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobile();
  const { scenario: currentMap } = useScenario();

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

  return (
    <div className="border border-primary p-2 md:p-4 w-full h-full relative overflow-hidden">
      <div className="absolute top-2 left-2 z-10">
        <h2 className="text-lg md:text-xl font-bold">
          {currentMap.name} - ORBITAL VIEW
        </h2>
        <p className="text-xs md:text-sm">
          PLANETARY POSITION: 127.45° / 83.92°
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
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color("#000000"));
          }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />

          <PlanetWithStation />
          <OrbitalSystem />
          <group position={[orbitRadius, 0, 0]}>
            <Stars
              radius={100}
              depth={50}
              count={5000}
              factor={8}
              saturation={0}
              fade
              speed={1}
            />
          </group>

          <PerspectiveCamera
            makeDefault
            position={[orbitRadius + 150, 80, 0]}
            fov={isMobile ? 40 : 30}
          />
          {!isFreeCam && <CameraController />}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            zoomSpeed={0.6}
            panSpeed={0.5}
            rotateSpeed={0.2}
            target={[orbitRadius, 0, 0]}
            enabled={isFreeCam}
            enableDamping={false}
          />
        </Canvas>
      </div>

      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={() => setIsFreeCam(!isFreeCam)}
          className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm font-bold ${
            isFreeCam
              ? "bg-primary text-black"
              : "bg-black text-primary border border-primary"
          }`}
        >
          {isFreeCam ? "ORBITAL CAM" : "FREE CAM"}
        </button>
      </div>

      <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 border border-primary bg-black/90 p-2 md:p-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm md:text-lg">RESEARCH OPERATIONS</h3>
          <div className="px-1 md:px-2 py-0.5 md:py-1 rounded bg-green-500 text-black uppercase font-bold text-[10px] md:text-xs">
            ACTIVE
          </div>
        </div>
        <p className="text-xs md:text-base mt-1 md:mt-2">
          Current research focus: Xenobiology. Atmospheric samples collected:
          47. Anomalous readings detected in sector 7.
        </p>
      </div>
    </div>
  );
}

/**
 * Renders a planet with a station marker.
 */
function PlanetWithStation() {
  const planetRef = useRef<THREE.Group>(null);
  const stationRef = useRef<THREE.Group>(null);

  // Calculate the position of the station on the planet surface
  const getStationPosition = () => {
    // Convert from normalized coordinates to spherical coordinates
    const phi = stationPosition.x * Math.PI * 2; // longitude (0 to 2π)
    const theta = stationPosition.y * Math.PI; // latitude (0 to π)

    // Convert spherical to cartesian coordinates
    const x = planetSize * Math.sin(theta) * Math.cos(phi);
    const y = planetSize * Math.cos(theta);
    const z = planetSize * Math.sin(theta) * Math.sin(phi);

    return [x, y, z];
  };

  // Use useFrame hook to rotate the planet
  useFrame(() => {
    if (planetRef.current) {
      // Rotate around Y axis
      planetRef.current.rotation.y += 0.0005;

      // Update station position to maintain outward direction
      if (stationRef.current) {
        const [x, y, z] = getStationPosition();
        stationRef.current.position.set(x, y, z);

        // Make station point outward from center of planet
        stationRef.current.lookAt(
          planetRef.current.position.x,
          -planetRef.current.position.y,
          planetRef.current.position.z
        );
      }
    }
  });

  const [stationX, stationY, stationZ] = getStationPosition();

  return (
    <group ref={planetRef} position={[orbitRadius, 0, 0]}>
      {/* Planet - simple sphere with amber color */}
      <mesh>
        <sphereGeometry args={[planetSize, planetSize, planetSize]} />
        <meshBasicMaterial
          color="#FFB300"
          wireframe={true}
          wireframeLinewidth={1}
        />
      </mesh>

      {/* Station marker (pointing outward) */}
      <group ref={stationRef} position={[stationX, stationY, stationZ]}>
        {/* Base of the marker */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 0.5]} />
          <meshBasicMaterial color="#00ff00" wireframe={true} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Renders a large orbital system with a central sun.
 */
function OrbitalSystem() {
  // Define the orbital parameters
  const segments = 100; // Enough segments to make it look smooth
  const sunRef = useRef<THREE.Mesh>(null);

  // Create points for a horizontal circle in XZ plane
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    // Ensure we're creating valid numbers for the coordinates
    const x = Math.cos(theta) * orbitRadius;
    const z = Math.sin(theta) * orbitRadius;
    points.push(new THREE.Vector3(x, 0, z));
  }

  // Add rotation animation
  useFrame(() => {
    if (sunRef.current) {
      // Rotate around Y axis
      sunRef.current.rotation.y += 0.0003;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Orbital path - using simple line */}
      <line>
        <bufferGeometry>
          <float32BufferAttribute
            attach="attributes-position"
            array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
            count={points.length}
            itemSize={3}
            args={[new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffaa00" opacity={0.5} transparent={true} />
      </line>

      {/* Central sun */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[sunSize, sunSize, sunSize]} />
        <meshBasicMaterial
          color="#C64523"
          wireframe={true}
          wireframeLinewidth={1}
        />
      </mesh>
    </group>
  );
}

/**
 * Controls the camera movement for the orbital cam mode.
 */
function CameraController() {
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
    const minRadius = 50; // Minimum distance from asteroid
    const maxRadius = 230; // Maximum distance from asteroid
    const range = maxRadius - minRadius;

    // Apply modified easing function
    const easedPhase = modifiedEase(panPhase);
    const radius = minRadius + easedPhase * range;

    // Calculate height based on distance from asteroid
    const minHeight = 5;
    const maxHeight = 85;
    const height = minHeight + easedPhase * (maxHeight - minHeight);

    // Calculate position in a circle around the asteroid
    const x = orbitRadius + Math.cos(cameraAngle) * radius;
    const y = height; // Dynamic height based on distance
    const z = Math.sin(cameraAngle) * radius;

    camera.position.set(x, y, z);
    camera.lookAt(orbitRadius, 0, 0);
  });

  return null;
}
