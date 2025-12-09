"use client";

import { usePoi } from "@/src/context/poi-context";
import { useScenario } from "@/src/context/scenario-context";
import { POI_ID } from "@/src/models/scenario";
import {
  BarChart,
  Database,
  Droplets,
  Layers,
  MapPin,
  Orbit,
  Thermometer,
  Wind,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../button";

/**
 * Statics displayed in the exterior view.
 *
 * Uses values from the scenario.exteriorStats array.
 */
export function ExteriorStats() {
  const { scenario } = useScenario();
  const { selectedPOI, setSelectedPOI } = usePoi();
  const exteriorStats = scenario.exteriorStats || [];

  const [chartData, setChartData] = useState<Record<string, any>>({});

  useEffect(() => {
    // Initialize chart data from default values in exteriorStats
    const initialData: Record<string, any> = {};

    exteriorStats.forEach((stat) => {
      if (stat.defaultValue !== undefined) {
        initialData[stat.type] = stat.defaultValue;
      }
    });

    setChartData(initialData);
  }, [exteriorStats]);

  // Determine chart color based on emergency mode
  const chartColor = "hsl(var(--primary))";

  // Simulate changing data
  useEffect(() => {
    if (exteriorStats.length === 0) return;

    const interval = setInterval(() => {
      setChartData((prev) => {
        const newData = { ...prev };

        exteriorStats.forEach((stat) => {
          if (stat.isArray && Array.isArray(prev[stat.type])) {
            // Handle array-based stats (for charts)
            const currentValues = prev[stat.type] || [];
            const min = stat.min || 0;
            const max = stat.max || 100;
            const range = max - min;
            const randomFactor = range * 0.05; // 5% of range for random variation

            const lastValue = currentValues[currentValues.length - 1];
            let newValue =
              lastValue + (Math.random() * randomFactor * 2 - randomFactor);

            // Keep within bounds
            newValue = Math.max(min, Math.min(max, newValue));

            newData[stat.type] = [...currentValues.slice(1), newValue];
          } else if (
            stat.type === "resourcesExtracted" ||
            stat.type === "remainingDeposits"
          ) {
            // Handle resource extraction specifically
            const mined = Math.random() * 0.2;
            newData.resourcesExtracted = (prev.resourcesExtracted || 0) + mined;
            newData.remainingDeposits = Math.max(
              0,
              (prev.remainingDeposits || 0) - mined
            );
          } else if (stat.type === "researchProgress") {
            // Occasionally increase research progress
            if (Math.random() > 0.8) {
              newData.researchProgress = Math.min(
                100,
                (prev.researchProgress || 0) + 0.1
              );
            }
          } else if (stat.type === "anomalyReadings") {
            // Occasionally change anomaly readings
            if (Math.random() > 0.95) {
              newData.anomalyReadings = Math.max(
                0,
                (prev.anomalyReadings || 0) + (Math.random() > 0.5 ? 1 : -1)
              );
            }
          } else if (typeof prev[stat.type] === "number") {
            // General case for numeric non-array stats
            const currentValue = prev[stat.type] || 0;
            if (Math.random() > 0.7) {
              const min =
                stat.min !== undefined ? stat.min : currentValue - 100;
              const max =
                stat.max !== undefined ? stat.max : currentValue + 100;
              newData[stat.type] = Math.max(
                min,
                Math.min(max, currentValue + (Math.random() * 2 - 1))
              );
            }
          }
        });

        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [exteriorStats]);

  // Render composition analysis section
  const renderComposition = () => {
    const composition =
      compositionData[scenario.type] || compositionData.asteroid;

    let title = "COMPOSITION ANALYSIS";
    if (scenario.type === "planet") {
      title = "ATMOSPHERIC ANALYSIS";
    } else if (scenario.type === "bell") {
      title = "STATION INTEGRITY";
    } else if (scenario.type === "ship") {
      title = "SHIP INTEGRITY";
    }

    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="font-bold">{title}</h3>
        </div>
        <div className="space-y-2">
          {composition.map((item) => (
            <div key={item.name}>
              <div className="flex justify-between mb-1">
                <span>{item.name}</span>
                <span>{item.value}%</span>
              </div>
              <div className="h-2 bg-primary/20 relative">
                <div
                  className="absolute top-0 left-0 h-full bg-primary"
                  style={{ width: `${item.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render a chart stat (like temperature, rotation speed, etc.)
  const renderChartStat = (stat: (typeof exteriorStats)[0]) => {
    if (!stat || !chartData[stat.type] || !Array.isArray(chartData[stat.type]))
      return null;

    const values = chartData[stat.type];
    const currentValue = values[values.length - 1];
    const min = stat.min || 0;
    const max = stat.max || 100;
    const Icon = statIcons[stat.type] || Database;

    // Calculate value positions for grid lines (5 equal divisions)
    const valuePositions = Array.from(
      { length: 5 },
      (_, i) => max - i * ((max - min) / 4)
    );

    return (
      <div>
        <div className="flex justify-between mb-1">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            <span>{stat.label}</span>
          </div>
          <span>
            {typeof currentValue === "number"
              ? currentValue.toFixed(1)
              : currentValue}{" "}
            {stat.unit || ""}
          </span>
        </div>
        <div className="h-32 border border-primary/50 relative bg-black">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            <line
              x1="0"
              y1="20"
              x2="100"
              y2="20"
              stroke={chartColor}
              strokeWidth="0.3"
              strokeDasharray="1,1"
            />
            <line
              x1="0"
              y1="40"
              x2="100"
              y2="40"
              stroke={chartColor}
              strokeWidth="0.3"
              strokeDasharray="1,1"
            />
            <line
              x1="0"
              y1="60"
              x2="100"
              y2="60"
              stroke={chartColor}
              strokeWidth="0.3"
              strokeDasharray="1,1"
            />
            <line
              x1="0"
              y1="80"
              x2="100"
              y2="80"
              stroke={chartColor}
              strokeWidth="0.3"
              strokeDasharray="1,1"
            />

            {/* Data line */}
            <polyline
              points={values
                .map(
                  (value: number, index: number) =>
                    `${(index / (values.length - 1)) * 100}, ${
                      100 - ((value - min) / (max - min)) * 100
                    }`
                )
                .join(" ")}
              fill="none"
              stroke={chartColor}
              strokeWidth=".6"
            />
          </svg>
          <div className="absolute top-0 right-0 bottom-0 left-0 flex flex-col justify-between pointer-events-none px-1 py-1 text-[10px] text-primary/70">
            {valuePositions.map((value, index) => (
              <span key={index}>
                {value.toFixed(1)}
                {stat.unit}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render a simple stat (non-chart)
  const renderSimpleStat = (stat: (typeof exteriorStats)[0]) => {
    if (!stat || chartData[stat.type] === undefined) return null;

    const value = chartData[stat.type];
    const Icon = statIcons[stat.type] || Database;
    const isAlert =
      stat.isAlert &&
      stat.alertThreshold !== undefined &&
      value > stat.alertThreshold;

    return (
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <span>{stat.label}</span>
        </div>
        <span className={isAlert ? "text-red-500" : "text-primary"}>
          {typeof value === "number"
            ? stat.type === "resourcesExtracted" ||
              stat.type === "remainingDeposits"
              ? Math.floor(value).toLocaleString()
              : Math.floor(value)
            : value}{" "}
          {stat.unit || ""}
        </span>
      </div>
    );
  };

  // Handle POI selection
  const handlePoiSelect = (poiId: POI_ID) => {
    setSelectedPOI(selectedPOI === poiId ? null : poiId);
  };

  // Render POI selection section
  const renderPoiSelection = () => {
    if (!scenario.pointsOfInterest || scenario.pointsOfInterest.length === 0)
      return null;

    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="font-bold">SECTORS</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {scenario.pointsOfInterest.map((poi) => (
            <ToggleButton
              key={poi.id}
              label={poi.name.toUpperCase()}
              isActive={selectedPOI === poi.id}
              onClick={() => handlePoiSelect(poi.id)}
            >
              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center text-l justify-center">
                {poi.user_facing_id}
              </div>
            </ToggleButton>
          ))}
        </div>
      </div>
    );
  };

  // No exteriorStats configured
  if (!exteriorStats || exteriorStats.length === 0) {
    return <div className="text-primary">No exterior data available.</div>;
  }

  return (
    <div className="space-y-8 text-xs">
      {/* Composition Analysis */}
      {exteriorStats.some(
        (stat) =>
          stat.type === "composition" || stat.type === "atmosphericAnalysis"
      ) && renderComposition()}

      {/* Chart Stats */}
      {exteriorStats
        .filter((stat) => stat.isArray)
        .map((stat, index) => (
          <div key={index}>{renderChartStat(stat)}</div>
        ))}

      {/* Additional Simple Stats */}
      <div className="space-y-4">
        {exteriorStats
          .filter(
            (stat) =>
              !stat.isArray &&
              stat.type !== "composition" &&
              stat.type !== "atmosphericAnalysis"
          )
          .map((stat, index) => (
            <div key={index}>{renderSimpleStat(stat)}</div>
          ))}
      </div>

      {/* POI Selection */}
      {scenario.pointsOfInterest &&
        scenario.pointsOfInterest.length > 0 &&
        renderPoiSelection()}
    </div>
  );
}

// Map of stat types to their corresponding icons
const statIcons = {
  composition: Layers,
  atmosphericAnalysis: Layers,
  rotationSpeed: Orbit,
  surfaceTemp: Thermometer,
  radiationLevel: Zap,
  resourcesExtracted: Database,
  remainingDeposits: Database,
  windSpeed: Wind,
  humidity: Droplets,
  researchProgress: BarChart,
  anomalyReadings: Zap,
};

// Composition data for different scenario types
const compositionData = {
  asteroid: [
    { name: "IRON", value: 62 },
    { name: "NICKEL", value: 14 },
    { name: "COBALT", value: 8 },
    { name: "OTHER MINERALS", value: 16 },
  ],
  planet: [
    { name: "NITROGEN", value: 68 },
    { name: "OXYGEN", value: 24 },
    { name: "ARGON", value: 5 },
    { name: "OTHER GASES", value: 3 },
  ],
  bell: [
    { name: "HULL INTEGRITY", value: 96 },
    { name: "THERMAL SHIELDING", value: 92 },
    { name: "RADIATION BARRIER", value: 98 },
    { name: "DOCK SEALS", value: 85 },
  ],
  deep: [
    { name: "HULL INTEGRITY", value: 96 },
    { name: "THERMAL SHIELDING", value: 92 },
    { name: "CORE INTEGRITY", value: 98 },
    { name: "CORE TEMPERATURE", value: 98 },
  ],
  prosperos: [
    { name: "HULL INTEGRITY", value: 96 },
    { name: "THERMAL SHIELDING", value: 92 },
    { name: "CORE INTEGRITY", value: 98 },
    { name: "CORE TEMPERATURE", value: 98 },
  ],
  ship: [
    { name: "HULL INTEGRITY", value: 96 },
    { name: "THERMAL SHIELDING", value: 92 },
    { name: "CORE INTEGRITY", value: 98 },
    { name: "WARP CORE", value: 5 },
  ],
};

/**
 * Toggle button component based on header.tsx button design.
 */
function ToggleButton({
  children,
  label,
  isActive,
  onClick,
}: {
  children?: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={`text-m w-full px-2 py-1 h-10 border-primary hover:bg-primary hover:text-black relative ${
        isActive ? "bg-primary text-black" : ""
      }`}
    >
      {children}
      {label}
    </Button>
  );
}
