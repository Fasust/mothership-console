"use client";

import type { ChartType } from "@/src/models/exterior-stats";
import { Droplets, Thermometer, Wind, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { LiveChart } from "./live-chart";

/**
 * Renders a panel of charts about the station.
 *
 * Uses the scenario.charts property to display the charts.
 */
export function InteriorCharts({
  chartTypes = ["oxygen", "temperature"],
}: {
  chartTypes?: ChartType[];
}) {
  const [chartData, setChartData] = useState<Record<ChartType, number[]>>({
    oxygen: Array(30).fill(92),
    temperature: Array(30).fill(22),
    radiation: Array(30).fill(150),
    power: Array(30).fill(85),
    humidity: Array(30).fill(45),
    pressure: Array(30).fill(101),
  });

  // Initialize with random data and update every second
  useEffect(() => {
    // Initial random data
    setChartData({
      oxygen: Array(30)
        .fill(0)
        .map(() => 90 + Math.random() * 5),
      temperature: Array(30)
        .fill(0)
        .map(() => 21 + Math.random() * 2),
      radiation: Array(30)
        .fill(0)
        .map(() => 140 + Math.random() * 20),
      power: Array(30)
        .fill(0)
        .map(() => 80 + Math.random() * 10),
      humidity: Array(30)
        .fill(0)
        .map(() => 40 + Math.random() * 10),
      pressure: Array(30)
        .fill(0)
        .map(() => 100 + Math.random() * 2),
    });

    const interval = setInterval(() => {
      setChartData((prev) => {
        const newData = { ...prev };

        // Update oxygen data - fluctuate around 92%
        if (chartTypes.includes("oxygen")) {
          const newValue = 92 + (Math.random() * 4 - 2); // 90-94% range
          newData.oxygen = [...prev.oxygen.slice(1), newValue];
        }

        // Update temperature data - fluctuate around 22°C
        if (chartTypes.includes("temperature")) {
          const newValue = 22 + (Math.random() * 1.5 - 0.75); // 21.25-22.75°C range
          newData.temperature = [...prev.temperature.slice(1), newValue];
        }

        // Update radiation data - fluctuate around 150 mSv
        if (chartTypes.includes("radiation")) {
          const newValue = 150 + (Math.random() * 10 - 5); // 145-155 mSv range
          newData.radiation = [...prev.radiation.slice(1), newValue];
        }

        // Update power data - fluctuate around 85%
        if (chartTypes.includes("power")) {
          const newValue = 85 + (Math.random() * 6 - 3); // 82-88% range
          newData.power = [...prev.power.slice(1), newValue];
        }

        // Update humidity data - fluctuate around 45%
        if (chartTypes.includes("humidity")) {
          const newValue = 45 + (Math.random() * 8 - 4); // 41-49% range
          newData.humidity = [...prev.humidity.slice(1), newValue];
        }

        // Update pressure data - fluctuate around 101 kPa
        if (chartTypes.includes("pressure")) {
          const newValue = 101 + (Math.random() * 0.6 - 0.3); // 100.7-101.3 kPa range
          newData.pressure = [...prev.pressure.slice(1), newValue];
        }

        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [chartTypes]);

  // Chart configuration
  const chartConfig: Record<
    ChartType,
    {
      title: string;
      unit: string;
      min: number;
      max: number;
      labels: string[];
      optimal?: string;
      warning?: string;
      icon?: any;
    }
  > = {
    oxygen: {
      title: "OXYGEN LEVELS",
      unit: "%",
      min: 80,
      max: 100,
      labels: ["100%", "95%", "90%", "85%", "80%"],
      optimal: "95%",
      icon: Wind,
    },
    temperature: {
      title: "TEMPERATURE",
      unit: "°C",
      min: 18,
      max: 26,
      labels: ["26°C", "24°C", "22°C", "20°C", "18°C"],
      icon: Thermometer,
    },
    radiation: {
      title: "RADIATION LEVEL",
      unit: "mSv",
      min: 130,
      max: 170,
      labels: ["170 mSv", "160 mSv", "150 mSv", "140 mSv", "130 mSv"],
      warning: "MAX: 200 mSv",
      icon: Zap,
    },
    power: {
      title: "POWER SYSTEMS",
      unit: "%",
      min: 70,
      max: 100,
      labels: ["100%", "92.5%", "85%", "77.5%", "70%"],
      optimal: "OPTIMAL: 90%",
      icon: Zap,
    },
    humidity: {
      title: "HUMIDITY",
      unit: "%",
      min: 30,
      max: 60,
      labels: ["60%", "52.5%", "45%", "37.5%", "30%"],
      optimal: "OPTIMAL: 45%",
      icon: Droplets,
    },
    pressure: {
      title: "ATMOSPHERIC PRESSURE",
      unit: "kPa",
      min: 99,
      max: 103,
      labels: ["103 kPa", "102 kPa", "101 kPa", "100 kPa", "99 kPa"],
      optimal: "OPTIMAL: 101.3 kPa",
      icon: Wind,
    },
  };

  return (
    <div className="space-y-4 text-xs">
      {chartTypes.map((type) => {
        const config = chartConfig[type];
        return (
          <LiveChart
            key={type}
            title={config.title}
            unit={config.unit}
            min={config.min}
            max={config.max}
            data={chartData[type]}
            labels={config.labels}
            optimal={config.optimal}
            warning={config.warning}
            icon={config.icon}
          />
        );
      })}
    </div>
  );
}
