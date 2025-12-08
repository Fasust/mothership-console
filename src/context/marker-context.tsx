"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface Marker {
  id: string;
  text: string;
  x: number;
  y: number;
}

interface MarkerContextType {
  markers: Marker[];
  addMarker: (marker: Omit<Marker, "id">) => void;
  removeMarker: (id: string) => void;
  updateMarker: (id: string, marker: Partial<Marker>) => void;
}

const MarkerContext = createContext<MarkerContextType | undefined>(undefined);

export function MarkerProvider({ children }: { children: ReactNode }) {
  const [markers, setMarkers] = useState<Marker[]>([]);

  const addMarker = (marker: Omit<Marker, "id">) => {
    setMarkers((prev) => [...prev, { ...marker, id: `marker-${Date.now()}` }]);
  };

  const removeMarker = (id: string) => {
    setMarkers((prev) => prev.filter((marker) => marker.id !== id));
  };

  const updateMarker = (id: string, updates: Partial<Marker>) => {
    setMarkers((prev) =>
      prev.map((marker) =>
        marker.id === id ? { ...marker, ...updates } : marker
      )
    );
  };

  return (
    <MarkerContext.Provider
      value={{ markers, addMarker, removeMarker, updateMarker }}
    >
      {children}
    </MarkerContext.Provider>
  );
}

export function useMarkers() {
  const context = useContext(MarkerContext);
  if (context === undefined) {
    throw new Error("useMarkers must be used within a MarkerProvider");
  }
  return context;
}
