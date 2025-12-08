"use client";

import { CommandPalette } from "@/src/components/command_palette/command-palette";
import { AdminProvider } from "@/src/context/admin-context";
import { AudioProvider } from "@/src/context/audio-context";
import { DiagnosticsProvider } from "@/src/context/diagnostics-context";
import { EmergencyProvider } from "@/src/context/emergency-context";
import { MarkerProvider } from "@/src/context/marker-context";
import { PoiProvider } from "@/src/context/poi-context";
import { ScenarioProvider } from "@/src/context/scenario-context";
import { TableSortProvider } from "@/src/context/table-sort-context";
import { ThemeProvider } from "@/src/context/theme-context";
import { ViewProvider } from "@/src/context/view-context";
import { useParams } from "next/navigation";

export function ProviderRegistry({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const mapId = params.mapId as string;
  const viewType = params.viewType as string;

  return (
    <AudioProvider>
      <ThemeProvider>
        <EmergencyProvider>
          <ScenarioProvider initialMapId={mapId}>
            <DiagnosticsProvider>
              <ViewProvider initialViewType={viewType}>
                <MarkerProvider>
                  <AdminProvider>
                    <PoiProvider>
                      <TableSortProvider>
                        <div className="min-h-screen">
                          {children}
                          <CommandPalette />
                        </div>
                      </TableSortProvider>
                    </PoiProvider>
                  </AdminProvider>
                </MarkerProvider>
              </ViewProvider>
            </DiagnosticsProvider>
          </ScenarioProvider>
        </EmergencyProvider>
      </ThemeProvider>
    </AudioProvider>
  );
}
