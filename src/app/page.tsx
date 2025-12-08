"use client";

import Loading from "@/src/components/loading";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/0/exterior`);
  }, [router]);

  return <Loading />;
}
