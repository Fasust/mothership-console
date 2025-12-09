"use client";

import { useScenario } from "@/src/context/scenario-context";
import { allThemes, useTheme } from "@/src/context/theme-context";
import { useView } from "@/src/context/view-context";
import { allScenarios, Scenario } from "@/src/models/scenario";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * A menu that allows the user to select a scenario and a theme.
 */
export function WardenMenu({
  showWardenMenu,
  setShowWardenMenu,
}: {
  showWardenMenu: boolean;
  setShowWardenMenu: (show: boolean) => void;
}) {
  const { scenario } = useScenario();
  const { theme, setTheme } = useTheme();
  const { currentView } = useView();
  const router = useRouter();

  const selectScenario = (scenario: Scenario, index: number) => {
    // Determine which views are supported for the *target* scenario
    const hasExteriorView =
      Array.isArray(scenario.exteriorStats) &&
      scenario.exteriorStats.length > 0;
    const hasInteriorView = !!scenario.map;
    const hasAsciiInteriorView = !!scenario.asciiMap;

    // Pick the best target view:
    // 1. Keep the current view if it's supported by the new scenario
    // 2. Otherwise, fall back to exterior if available
    // 3. Otherwise, pick any other supported view
    let targetView = currentView;

    const currentIsSupported =
      (currentView === "exterior" && hasExteriorView) ||
      (currentView === "interior" && hasInteriorView) ||
      (currentView === "interior-ascii" && hasAsciiInteriorView);

    if (!currentIsSupported) {
      if (hasExteriorView) {
        targetView = "exterior";
      } else if (hasInteriorView) {
        targetView = "interior";
      } else if (hasAsciiInteriorView) {
        targetView = "interior-ascii";
      } else {
        // Fallback: keep whatever we had, even if it renders as "unavailable"
        targetView = "exterior";
      }
    }

    setShowWardenMenu(false);
    router.push(`/${index}/${targetView}`);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowWardenMenu(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (!showWardenMenu) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-primary p-4 md:p-6 rounded-lg max-w-4xl w-full mx-4">
        <h2 className="text-lg md:text-xl font-bold mb-4">SELECT SCENARIO</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {allScenarios.map((map, index) => (
            <button
              key={map.id}
              onClick={() => selectScenario(map, index)}
              className={`p-2 md:p-3 text-left border border-primary hover:bg-primary/20 rounded ${
                scenario.id === map.id
                  ? "bg-primary text-black"
                  : "text-primary"
              }`}
            >
              {map.id}
            </button>
          ))}
        </div>

        <h2 className="text-lg md:text-xl font-bold mb-4 mt-6">SELECT THEME</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {allThemes.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`${t} p-2 md:p-3 text-left border rounded border-primary ${
                t === theme ? `bg-primary text-black` : ` text-primary`
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowWardenMenu(false)}
            className="px-3 py-1 md:px-4 md:py-2 border border-primary hover:bg-primary/20 rounded"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
