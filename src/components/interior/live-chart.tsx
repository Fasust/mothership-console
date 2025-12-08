import { LucideIcon } from "lucide-react";

interface LiveChartProps {
  title: string;
  unit: string;
  min: number;
  max: number;
  data: number[];
  icon?: LucideIcon;
  optimal?: string;
  warning?: string;
  labels?: string[];
}

export function LiveChart({
  title,
  unit,
  min,
  max,
  data,
  icon: Icon,
  optimal,
  warning,
  labels,
}: LiveChartProps) {
  const currentValue = data[data.length - 1].toFixed(1);
  const chartColor = "hsl(var(--primary))";

  // Calculate value positions for grid lines (5 equal divisions)
  const valuePositions = Array.from(
    { length: 5 },
    (_, i) => max - i * ((max - min) / 4)
  );

  return (
    <div>
      <div className="flex justify-between mb-1">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          <span>{title}</span>
        </div>
        <span>
          {currentValue}
          {unit}
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
            points={data
              .map(
                (value, index) =>
                  `${(index / (data.length - 1)) * 100}, ${
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
          {(labels || valuePositions.map((v) => `${v.toFixed(1)}${unit}`)).map(
            (label, index) => (
              <span key={index}>{label}</span>
            )
          )}
        </div>
      </div>
      <div className="flex justify-between text-primary/70 mt-0.5 text-[8px]">
        <span>
          MIN: {min}
          {unit}
        </span>
        {optimal && <span>{optimal}</span>}
        {warning && <span>{warning}</span>}
      </div>
    </div>
  );
}
