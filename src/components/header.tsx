"use client";

import { useAdmin } from "@/src/context/admin-context";
import { useEmergency } from "@/src/context/emergency-context";
import { useScenario } from "@/src/context/scenario-context";
import { useView, ViewType } from "@/src/context/view-context";
import {
  AlertTriangle,
  Anchor,
  Brain,
  Cpu,
  Database,
  DollarSign,
  Map as MapIcon,
  PersonStanding,
  Radio,
  Shield,
  Slice,
  Terminal,
  Tractor,
  Wine,
} from "lucide-react";
import { DateTime } from "luxon";
import { useParams, useRouter } from "next/navigation";
import { Button } from "./button";

const tableIcons = {
  Wine,
  DollarSign,
  Cpu,
  Slice,
  Brain,
  PersonStanding,
  Database,
  Tractor,
  Terminal,
  Anchor,
};

export type TableIcon = keyof typeof tableIcons;

export function Header() {
  const { scenario, map } = useScenario();
  const { emergency } = useEmergency();
  const { isAdmin } = useAdmin();
  const { currentView, setCurrentView } = useView();
  const router = useRouter();
  const params = useParams();
  const currentTime = DateTime.now().plus({ year: 100 });
  const mapId = params.mapId as string;

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    router.push(`/${mapId}/${view}`);
  };

  // Determine available views
  const availableViews: ViewType[] = [
    "exterior",
    map ? "interior" : null,
    scenario.asciiMap ? "interior-ascii" : null,
  ].filter(Boolean) as ViewType[];

  return (
    <header className="border border-primary p-2">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Terminal className="h-6 w-6" />
          <h1 className="text-xl md:text-2xl font-bold tracking-wider">
            {scenario.name}
          </h1>
          {emergency.active && emergency.alarm && (
            <div className="flex items-center gap-1 text-red-500 animate-pulse">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm md:text-2xl">
                {emergency.reason === "self-destruct"
                  ? "SELF-DESTRUCT ACTIVE"
                  : "EMERGENCY PROTOCOL"}
              </span>
            </div>
          )}
          {isAdmin && (
            <div className="flex items-center gap-1 text-green-500">
              <Shield className="h-4 w-4" />
              <span className="text-sm md:text-xl">ADMIN MODE</span>
            </div>
          )}
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-12">
          <div className="text-sm md:text-base font-mono">
            <p className="flex justify-between">
              <span>CREW:&nbsp;</span>
              {scenario.crew.current}/{scenario.crew.capacity}
            </p>
            <p className="flex justify-between">
              <span>DATE:&nbsp;</span>
              <span>{currentTime.toFormat("dd-MM-yyyy")}</span>
            </p>
          </div>
          {availableViews.length > 1 && (
            <div className="flex flex-wrap gap-2 md:gap-4">
              {availableViews.includes("interior") && (
                <Button
                  variant="outline"
                  onClick={() => handleViewChange("interior")}
                  className={`text-xs md:text-sm px-2 py-1 h-auto border-primary hover:bg-primary hover:text-black whitespace-nowrap ${
                    currentView === "interior" ? "bg-primary text-black" : ""
                  }`}
                >
                  <MapIcon className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                  STATION MAP
                </Button>
              )}
              {availableViews.includes("interior-ascii") && (
                <Button
                  variant="outline"
                  onClick={() => handleViewChange("interior-ascii")}
                  className={`text-xs md:text-sm px-2 py-1 h-auto border-primary hover:bg-primary hover:text-black whitespace-nowrap ${
                    currentView === "interior-ascii"
                      ? "bg-primary text-black"
                      : ""
                  }`}
                >
                  <Terminal className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                  INTERIOR VIEW
                </Button>
              )}
              {availableViews.includes("exterior") && (
                <Button
                  variant="outline"
                  onClick={() => handleViewChange("exterior")}
                  className={`text-xs md:text-sm px-2 py-1 h-auto border-primary hover:bg-primary hover:text-black whitespace-nowrap ${
                    currentView === "exterior" ? "bg-primary text-black" : ""
                  }`}
                >
                  <Radio className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                  EXTERIOR VIEW
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
