"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

export type ViewType = "interior" | "exterior" | "interior-ascii";

type ViewContextType = {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
};

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({
  children,
  initialViewType,
}: {
  children: ReactNode;
  initialViewType?: string;
}) {
  // Get the initial view type based on the URL parameter
  const getInitialViewType = (): ViewType => {
    if (
      initialViewType === "interior" ||
      initialViewType === "exterior" ||
      initialViewType === "interior-ascii"
    ) {
      return initialViewType;
    }
    // Accept table-<number> as valid
    if (
      typeof initialViewType === "string" &&
      initialViewType.startsWith("table-") &&
      !isNaN(Number(initialViewType.replace("table-", "")))
    ) {
      return initialViewType as ViewType;
    }
    return "exterior"; // Default view
  };

  const [currentView, setCurrentView] = useState<ViewType>(
    getInitialViewType()
  );

  return (
    <ViewContext.Provider
      value={{
        currentView,
        setCurrentView,
      }}
    >
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error("useView must be used within a ViewProvider");
  }
  return context;
}
