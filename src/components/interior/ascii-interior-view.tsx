"use client";

import { useScenario } from "@/src/context/scenario-context";

export function AsciiInteriorView() {
  const { scenario } = useScenario();

  if (!scenario.asciiMap) {
    return <div>No ASCII map available</div>;
  }

  return (
    <div className="flex h-full">
      {/* Main ASCII Map Area */}
      <div className="flex-1 border border-primary p-4 md:p-8 relative overflow-hidden">
        <div className="absolute top-2 left-2 z-10">
          <h2 className="text-lg md:text-xl font-bold">
            {scenario.name} - INTERIOR VIEW
          </h2>
          <p className="text-xs md:text-sm">AUTHORIZED ACCESS ONLY</p>
        </div>

        <div className="h-full flex items-center justify-center">
          <pre
            className="font-mono text-primary whitespace-pre overflow-auto max-w-full max-h-full"
            style={{
              fontFamily: "monospace",
              fontSize: "1.04rem",
              lineHeight: "1.2",
            }}
          >
            {scenario.asciiMap}
          </pre>
        </div>
      </div>
    </div>
  );
}
