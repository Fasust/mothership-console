"use client";

import { EmergencyOverlay } from "@/src/components/emergency/emergency-overlay";
import { ExteriorStats } from "@/src/components/exterior/exterior-stats";
import { ExteriorView } from "@/src/components/exterior/exterior-view";
import { Footer } from "@/src/components/footer";
import { Header } from "@/src/components/header";
import { AsciiInteriorView } from "@/src/components/interior/ascii-interior-view";
import { DiagnosticsView } from "@/src/components/interior/diagnostics-view";
import { InfoPanel } from "@/src/components/interior/info-panel";
import { StationMap as StationMapComponent } from "@/src/components/interior/station-map";
import { MapSelectorContent } from "@/src/components/map-selector";
import { useDiagnostics } from "@/src/context/diagnostics-context";
import { useEmergency } from "@/src/context/emergency-context";
import { useScenario } from "@/src/context/scenario-context";
import { useView } from "@/src/context/view-context";
import { useEffect, useState } from "react";

export default function Home() {
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const { emergency } = useEmergency();

  // Apply emergency class to enable red styling
  // Emergency mode overrides the selected theme with higher specificity
  const emergencyClass =
    emergency.active && emergency.alarm ? "emergency-mode" : "";

  const toggleMapSelector = () => {
    setShowMapSelector((prev) => !prev);
  };

  // Add keyboard shortcut to toggle map selector
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+I (Mac) or Ctrl+I (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === "i") {
        event.preventDefault();
        setShowMapSelector((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main className="min-h-screen p-2 md:p-4">
      <div className={`${emergencyClass} text-primary`}>
        <MapSelectorContent
          showMapSelector={showMapSelector}
          setShowMapSelector={setShowMapSelector}
        />
        <MainContent
          toggleMapSelector={toggleMapSelector}
          showDiagnostics={showDiagnostics}
          setShowDiagnostics={setShowDiagnostics}
        />
        <EmergencyOverlay />
      </div>
    </main>
  );
}

function MainContent({
  toggleMapSelector,
}: {
  toggleMapSelector: () => void;
  showDiagnostics: boolean;
  setShowDiagnostics: (show: boolean) => void;
}) {
  const { currentView } = useView();
  const { diagnosticsVisible } = useDiagnostics();
  const { scenario } = useScenario();

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
      <Footer onTerminalClick={toggleMapSelector} />
    </div>
  );
}
