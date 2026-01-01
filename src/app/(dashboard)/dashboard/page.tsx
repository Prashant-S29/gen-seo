"use client";

import React from "react";
import { ThemeToggler } from "~/components/common";
import { Button } from "~/components/ui/button";
import { useCheckAuthClient } from "~/lib/auth";
import { authClient } from "~/server/better-auth/client";

const Dashboard: React.FC = () => {
  const { session, isAuthenticated, isLoading } = useCheckAuthClient({
    redirectTo: "/login",
  });

  const handleLogout = async () => {
    await authClient.signOut();
  };

  if (isLoading) {
    return (
      <main className="flex h-screen w-full flex-col items-center justify-center gap-2">
        <p>Loading....</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex h-screen w-full flex-col items-center justify-center gap-2">
        <p>Not authenticated</p>
      </main>
    );
  }

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-2">
      <p>Dashboard</p>
      <pre>{JSON.stringify(session, null, 2)}</pre>

      <Button onClick={handleLogout} variant="outline" size="sm">
        Logout
      </Button>

      <ThemeToggler />
    </main>
  );
};

export default Dashboard;
