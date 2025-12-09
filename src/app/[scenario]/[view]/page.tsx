"use client";

import { EmergencyOverlay } from "@/src/components/emergency/emergency-overlay";
import { ExteriorStats } from "@/src/components/exterior/exterior-stats";
import { ExteriorView } from "@/src/components/exterior/exterior-view";
import { Footer } from "@/src/components/footer";
import { Header } from "@/src/components/header";
import { DiagnosticsView } from "@/src/components/interior/diagnostics-view";
import { InfoPanel } from "@/src/components/interior/info-panel";
import { AsciiInteriorView } from "@/src/components/interior/station-ascii-map";
import { StationGraphMap as StationMapComponent } from "@/src/components/interior/station-graph-map";
import { WardenMenu } from "@/src/components/warden-menu";
import { useDiagnostics } from "@/src/context/diagnostics-context";
import { useEmergency } from "@/src/context/emergency-context";
import { useScenario } from "@/src/context/scenario-context";
import { useView } from "@/src/context/view-context";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Page that allows selecting a view for the current scenario.
 */
export default function ViewSelector() {
  const [showWardenMenu, setShowWardenMenu] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const { emergency } = useEmergency();

  // Apply emergency class to enable red styling
  // Emergency mode overrides the selected theme with higher specificity
  const emergencyClass =
    emergency.active && emergency.alarm ? "emergency-mode" : "";

  const toggleWardenMenu = () => {
    setShowWardenMenu((prev) => !prev);
  };

  // Add keyboard shortcut to toggle map selector
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setShowWardenMenu((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main className="min-h-screen p-2 md:p-4">
      <div className={`${emergencyClass} text-primary`}>
        <WardenMenu
          showWardenMenu={showWardenMenu}
          setShowWardenMenu={setShowWardenMenu}
        />
        <MainContent
          toggleWardenMenu={toggleWardenMenu}
          showDiagnostics={showDiagnostics}
          setShowDiagnostics={setShowDiagnostics}
        />
        <EmergencyOverlay />
      </div>
    </main>
  );
}

function MainContent({
  toggleWardenMenu,
}: {
  toggleWardenMenu: () => void;
  showDiagnostics: boolean;
  setShowDiagnostics: (show: boolean) => void;
}) {
  const { currentView, setCurrentView } = useView();
  const { diagnosticsVisible } = useDiagnostics();
  const { scenario } = useScenario();
  const router = useRouter();
  const params = useParams();
  const scenarioId = params.scenario as string;
  const viewParam = (params.view as string) || "exterior";

  // Keep the current view and URL in sync and ensure unsupported/illegal
  // views always fall back to the exterior view.
  useEffect(() => {
    const hasExteriorView =
      Array.isArray(scenario.exteriorStats) &&
      scenario.exteriorStats.length > 0;
    const hasInteriorView = !!scenario.map;
    const hasAsciiInteriorView = !!scenario.asciiMap;

    const isSupportedView =
      (viewParam === "exterior" && hasExteriorView) ||
      (viewParam === "interior" && hasInteriorView) ||
      (viewParam === "interior-ascii" && hasAsciiInteriorView);

    // If the requested view is not supported for this scenario (or is just
    // an invalid string), redirect to exterior.
    if (!isSupportedView) {
      if (hasExteriorView) {
        if (currentView !== "exterior") {
          setCurrentView("exterior");
        }
        if (viewParam !== "exterior") {
          router.replace(`/${scenarioId}/exterior`);
        }
      }
      return;
    }

    // If the URL view is valid and supported but doesn't match the context,
    // update the context to match the URL.
    if (viewParam !== currentView) {
      setCurrentView(viewParam as any);
    }
  }, [
    currentView,
    scenario.asciiMap,
    scenario.exteriorStats,
    scenario.map,
    router,
    scenarioId,
    setCurrentView,
    viewParam,
  ]);

  const dataLabel = () => {
    switch (scenario.type) {
      case "asteroid":
        return "ASTEROID DATA";
      case "planet":
        return "PLANETARY DATA";
      case "bell":
      case "prosperos":
      case "deep":
        return "STATION DATA";
      case "ship":
        return "SHIP DATA";
      default:
        return "UNKNOWN DATA";
    }
  };

  const renderMainContent = () => {
    return (
      <>
        <div className="lg:col-span-3">
          {(() => {
            switch (currentView) {
              case "interior":
                return diagnosticsVisible ? (
                  <DiagnosticsView />
                ) : (
                  <StationMapComponent />
                );
              case "interior-ascii":
                return <AsciiInteriorView />;
              case "exterior":
                return <ExteriorView />;
              default:
                return (
                  <div>
                    <h1>Invalid view</h1>
                  </div>
                );
            }
          })()}
        </div>
        <div>
          {currentView === "interior" || currentView === "interior-ascii" ? (
            <InfoPanel />
          ) : (
            <div className="border border-primary h-full flex flex-col">
              <div className="p-2 md:p-4 border-b border-primary">
                <div className="flex justify-between">
                  <h2 className="text-lg md:text-xl font-bold">
                    {scenario.name}
                  </h2>
                  <span className="text-sm md:text-base">{dataLabel()}</span>
                </div>
                <div className="text-xs md:text-sm mt-1 md:mt-2">
                  {Object.entries(scenario.stats || {}).map(([key, value]) => (
                    <p key={key}>
                      {key.toUpperCase()}: {value}
                    </p>
                  ))}
                </div>
              </div>
              <div className="p-2 md:p-4 flex-grow overflow-auto">
                <ExteriorStats />
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div>
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 md:gap-4 mt-2 md:mt-4">
        {renderMainContent()}
      </div>
      <Footer onTerminalClick={toggleWardenMenu} />
    </div>
  );
}
