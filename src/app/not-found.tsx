"use client";

import { Button } from "@/src/components/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-primary">
      <div className="border border-primary p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">ERROR 404</h1>
        <p className="mb-6">MAP NOT FOUND IN DATABASE</p>
        <Button
          onClick={() => router.push("/0")}
          className="border-primary bg-transparent text-primary hover:bg-primary/20"
        >
          RETURN TO MAIN TERMINAL
        </Button>
      </div>
    </div>
  );
}
