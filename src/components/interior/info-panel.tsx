"use client";

import { useAdmin } from "@/src/context/admin-context";
import { useScenario } from "@/src/context/scenario-context";
import { Activity, Terminal, Wrench } from "lucide-react";
import { AdminLoginModal } from "../admin-login-modal";
import { InteriorCharts } from "./interior-charts";
import { StationControls } from "./station-controls";

export function InfoPanel() {
  const { scenario } = useScenario();
  const { isLoginVisible } = useAdmin();

  return (
    <div className="border border-primary h-full flex flex-col">
      <div className="p-4 flex-grow">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="font-bold">STATION METRICS</h3>
        </div>
        <InteriorCharts chartTypes={scenario.charts} />
      </div>

      {scenario.controlButtons && (
        <div className="p-4 border-t border-primary">
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="h-4 w-4 text-primary" />
            <h3 className="font-bold">CONTROLS</h3>
          </div>
          <StationControls />
        </div>
      )}

      {isLoginVisible && <AdminLoginModal />}

      {scenario.systemLogs && (
        <div className="p-4 border-t border-primary">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="h-4 w-4 text-primary" />
            <h3 className="font-bold">SYSTEM LOGS</h3>
          </div>
          <div className="space-y-1 text-xs text-primary/70">
            {scenario?.systemLogs?.map((log, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-primary">[{log.time}]</span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
