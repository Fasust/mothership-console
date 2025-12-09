"use client";

import { useScenario } from "@/src/context/scenario-context";
import { AsteroidView } from "./asteroid-view";
import { BellView } from "./bell-view";
import { DeepView } from "./deep-view";
import { PlanetView } from "./planet-view";
import { ProsperosDreamView } from "./prosperos-dream-view";
import { ShipView } from "./ship-view";

export type ViewAngle = "top" | "default";

/**
 * Renders the exterior view for the current scenario.
 *
 * Uses the appropriate view component based on the scenario type.
 */
export function ExteriorView({
  viewAngle = "default",
}: {
  viewAngle?: ViewAngle;
}) {
  const { scenario } = useScenario();

  // Render the appropriate view based on the scenario type
  if (scenario.type === "asteroid") {
    return <AsteroidView />;
  } else if (scenario.type === "planet") {
    return <PlanetView />;
  } else if (scenario.type === "bell") {
    return <BellView />;
  } else if (scenario.type === "deep") {
    return <DeepView />;
  } else if (scenario.type === "prosperos") {
    return <ProsperosDreamView viewAngle={viewAngle} />;
  } else if (scenario.type === "ship") {
    return <ShipView />;
  }

  // Fallback for other types
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-4">EXTERIOR VIEW UNAVAILABLE</h2>
        <p>No exterior view available for this type of facility.</p>
      </div>
    </div>
  );
}
