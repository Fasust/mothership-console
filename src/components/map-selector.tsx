"use client";

import { useScenario } from "@/src/context/scenario-context";
import { allThemes, useTheme } from "@/src/context/theme-context";
import { allScenarios, Scenario } from "@/src/models/scenario";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

//FIXME: rename
//FIXME: add K shortcut

export function MapSelectorContent({
  showMapSelector,
  setShowMapSelector,
}: {
  showMapSelector: boolean;
  setShowMapSelector: (show: boolean) => void;
}) {
  const { scenario, setScenario } = useScenario();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const params = useParams();
  const currentViewType = params.viewType as string;

  const selectScenario = (scenario: Scenario, index: number) => {
    setScenario(scenario);
    setShowMapSelector(false);
    router.push(`/${index}/${currentViewType}`);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowMapSelector(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (!showMapSelector) return null;

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
            onClick={() => setShowMapSelector(false)}
            className="px-3 py-1 md:px-4 md:py-2 border border-primary hover:bg-primary/20 rounded"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
