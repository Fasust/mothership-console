"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface DiagnosticsContextType {
  diagnosticsVisible: boolean;
  showDiagnostics: () => void;
  hideDiagnostics: () => void;
}

const DiagnosticsContext = createContext<DiagnosticsContextType | undefined>(
  undefined
);

export function DiagnosticsProvider({ children }: { children: ReactNode }) {
  const [diagnosticsVisible, setIsVisible] = useState(false);

  const showDiagnostics = () => setIsVisible(true);
  const hideDiagnostics = () => setIsVisible(false);

  return (
    <DiagnosticsContext.Provider
      value={{ diagnosticsVisible, showDiagnostics, hideDiagnostics }}
    >
      {children}
    </DiagnosticsContext.Provider>
  );
}

export function useDiagnostics() {
  const context = useContext(DiagnosticsContext);
  if (context === undefined) {
    throw new Error("useDiagnostics must be used within a DiagnosticsProvider");
  }
  return context;
}
