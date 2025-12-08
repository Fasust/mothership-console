"use client";

import { POI_ID } from "@/src/models/scenario";
import { createContext, ReactNode, useContext, useState } from "react";

interface PoiContextType {
  selectedPOI: POI_ID | null;
  setSelectedPOI: (id: POI_ID | null) => void;
}

const PoiContext = createContext<PoiContextType | undefined>(undefined);

export function PoiProvider({ children }: { children: ReactNode }) {
  const [selectedPOI, setSelectedPOI] = useState<POI_ID | null>(null);

  return (
    <PoiContext.Provider
      value={{
        selectedPOI,
        setSelectedPOI,
      }}
    >
      {children}
    </PoiContext.Provider>
  );
}

export function usePoi() {
  const context = useContext(PoiContext);
  if (context === undefined) {
    throw new Error("usePoi must be used within a PoiProvider");
  }
  return context;
}
