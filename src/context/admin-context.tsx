"use client";

import { NotificationModal } from "@/src/components/notification-modal";
import { useScenario } from "@/src/context/scenario-context";
import { createContext, useContext, useState } from "react";

interface AdminContextType {
  isAdmin: boolean;
  setAdmin: (isAdmin: boolean) => void;
  handleLogin: (username: string, password: string) => boolean;
  showLogin: () => void;
  hideLogin: () => void;
  isLoginVisible: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { scenario } = useScenario();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const setAdmin = (value: boolean) => {
    setIsAdmin(value);
  };

  const handleLogin = (username: string, password: string) => {
    const { adminCredentials } = scenario;
    if (
      username === adminCredentials.username &&
      password === adminCredentials.password
    ) {
      setIsAdmin(true);
      setIsLoginVisible(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      return true;
    }
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
    return false;
  };

  const showLogin = () => {
    setIsLoginVisible(true);
  };

  const hideLogin = () => {
    setIsLoginVisible(false);
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        setAdmin,
        handleLogin,
        showLogin,
        hideLogin,
        isLoginVisible,
      }}
    >
      {children}

      {showSuccess && (
        <NotificationModal
          type="success"
          message="Administrator privileges enabled."
          onClose={() => setShowSuccess(false)}
        />
      )}

      {showError && (
        <NotificationModal
          type="error"
          message="Invalid credentials. Please try again."
          onClose={() => setShowError(false)}
        />
      )}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
