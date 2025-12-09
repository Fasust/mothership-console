"use client";

import { useAdmin } from "@/src/context/admin-context";
import { useState } from "react";

/**
 * A modal that allows the user to login as an administrator.
 *
 * Uses the handleLogin function to authenticate the user.
 */
export function AdminLoginModal() {
  const { handleLogin, hideLogin } = useAdmin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    const success = handleLogin(username, password);
    if (!success) {
      setError(true);
      return;
    }
    setUsername("");
    setPassword("");
    setError(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black border border-primary p-4 rounded max-w-sm">
        <h3 className="text-xl font-bold mb-2">ACCESS DENIED</h3>
        <p className="mb-4">
          Administrator credentials required for this action.
        </p>
        <div className="space-y-2 mb-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toUpperCase())}
            placeholder="USERNAME"
            className="w-full bg-black border border-primary p-2 rounded text-primary uppercase"
          />
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value.toUpperCase())}
            placeholder="PASSWORD"
            className="w-full bg-black border border-primary p-2 rounded text-primary uppercase"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
          {error && <p className="text-red-500 text-sm">Invalid credentials</p>}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              hideLogin();
              setUsername("");
              setPassword("");
              setError(false);
            }}
            className="px-4 py-2 border border-primary rounded hover:bg-primary/10"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 border border-primary rounded hover:bg-primary/10"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
