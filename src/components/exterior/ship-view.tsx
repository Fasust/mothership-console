"use client";

import { useScenario } from "@/src/context/scenario-context";
import { useMobile } from "@/src/use-mobile";
import { OrbitControls, PerspectiveCamera, Stars } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const orbitRadius = 400;

// Create a spaceship using simple geometry
function Ship() {
  const groupRef = useRef<THREE.Group>(null);

  // Use useFrame hook to rotate only around Y axis
  useFrame(() => {
    if (groupRef.current) {
      // Only rotate around Y axis
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef} position={[orbitRadius, 0, 0]}>
      {/* Main hull - elongated cylinder */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1, 1.5, 8, 8]} />
        <meshBasicMaterial
          color="#00ff00"
          wireframe={true}
          wireframeLinewidth={1}
        />
      </mesh>

      {/* Cockpit/Bridge - front section */}
      <mesh position={[-4, 0, 0]} rotation={[0, -Math.PI, -Math.PI / 2]}>
        <sphereGeometry args={[1, 8, 2, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#00ff00" wireframe={true} />
      </mesh>

      {/* Wings - left and right */}
      <mesh position={[0, 0, 3.2]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[4, 0.2, 1.5]} />
        <meshBasicMaterial color="#00ff00" wireframe={true} />
      </mesh>
      <mesh position={[0, 0, -3.2]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[4, 0.2, 1.5]} />
        <meshBasicMaterial color="#00ff00" wireframe={true} />
      </mesh>

      {/* Communication array/antenna */}
      <mesh position={[1, 2, 0]}>
        <boxGeometry args={[0.1, 1.5, 0.1]} />
        <meshBasicMaterial color="#00ff00" wireframe={true} />
      </mesh>
    </group>
  );
}

// Create a large orbital path with a central planet
function OrbitalSystem() {
  // Define the orbital parameters
  const segments = 100; // Enough segments to make it look smooth
  const planetSize = 60; // Size of the central planet
  const planetRef = useRef<THREE.Mesh>(null);

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
    if (planetRef.current) {
      // Rotate around Y axis
      planetRef.current.rotation.y -= 0.0002;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Orbital path - using simple line instead of LineSegmentsGeometry */}
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
        <lineBasicMaterial color="#8f6901" opacity={0.5} transparent={true} />
      </line>

      {/* Central planet */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[planetSize, 12, 12]} />
        <meshBasicMaterial color="#C64523" wireframe={true} />
      </mesh>
    </group>
  );
}

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
    const minRadius = 20; // Minimum distance from asteroid
    const maxRadius = 200; // Maximum distance from asteroid
    const range = maxRadius - minRadius;

    // Apply modified easing function
    const easedPhase = modifiedEase(panPhase);
    const radius = minRadius + easedPhase * range;

    // Calculate height based on distance from asteroid
    const minHeight = 5;
    const maxHeight = 50;
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

export function ShipView() {
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
          {currentMap.name} - EXTERIOR VIEW
        </h2>
        <p className="text-xs md:text-sm">ORBITAL POSITION: 248.32° / 45.18°</p>
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

          <Ship />
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
            position={[orbitRadius + 50, 30, 0]}
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
            // Prevent OrbitControls from capturing all touch events
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
          <h3 className="font-bold text-sm md:text-lg">SHIP STATUS</h3>
          <div className="px-1 md:px-2 py-0.5 md:py-1 rounded bg-red-500 text-black uppercase font-bold text-[10px] md:text-xs">
            STRANDED
          </div>
        </div>
        <p className="text-xs md:text-base mt-1 md:mt-2">
          Current ship status: Stranded. Warp drive offline.
        </p>
      </div>
    </div>
  );
}
