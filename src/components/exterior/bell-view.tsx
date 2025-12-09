"use client";

import { useScenario } from "@/src/context/scenario-context";
import { useMobile } from "@/src/use-mobile";
import { OrbitControls, PerspectiveCamera, Stars } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  BellStation,
  DeepStation,
  OrbitalPath,
  orbitRadius,
} from "./deep-view";

/**
 * Renders a 3D view of the Bell station orbiting The Deep.
 *
 * The view allows switching between free cam mode and orbital cam mode.
 */
export function BellView() {
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
        <p className="text-xs md:text-sm">STATUS: AUTHORIZATION REQUIRED</p>
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
          camera={{
            near: 0.1,
            far: 10000,
          }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />

          <DeepStation showSectors={false} />
          <BellStation />
          <OrbitalPath />
          <group position={[orbitRadius, 0, 0]}>
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
          <h3 className="font-bold text-sm md:text-lg">STATION STATUS</h3>
          <div className="px-1 md:px-2 py-0.5 md:py-1 rounded bg-green-500 text-black uppercase font-bold text-[10px] md:text-xs">
            SAVE
          </div>
        </div>
        <p className="text-xs md:text-base mt-1 md:mt-2">
          All Divers welcome. May the Deep have mercy on your soul.
        </p>
      </div>
    </div>
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
    const minRadius = 150; // Minimum distance from asteroid
    const maxRadius = 520; // Maximum distance from asteroid
    const range = maxRadius - minRadius;

    // Apply modified easing function
    const easedPhase = modifiedEase(panPhase);
    const radius = minRadius + easedPhase * range;

    // Calculate height based on distance from asteroid
    const minHeight = 20;
    const maxHeight = 130;
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
