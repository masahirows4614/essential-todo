"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import Sidebar from "./Sidebar";
import { TaskProvider } from "@/contexts/TaskContext";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (user === null) {
      router.replace("/signin");
    } else {
      setReady(true);
    }
  }, [user, router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-app">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <TaskProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:block h-full">
          <Sidebar />
        </div>
        {/* Main area */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </TaskProvider>
  );
}
