"use client";

import Link from "next/link";
import React from "react";
import { BackdropGrid, Container } from "~/components/common";
import { Button } from "~/components/ui/button";
import { useCheckAuthClient } from "~/lib/auth";

const Dashboard: React.FC = () => {
  const { session, isAuthenticated, isLoading } = useCheckAuthClient({
    redirectTo: "/login",
  });

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
    <Container>
      <div className="flex h-screen w-full flex-col py-15">
        <section className="flex justify-between border-b p-8">
          <section>
            <h1 className="font-clashDisplay mt-5 text-5xl leading-tight font-medium">
              {(session?.user?.name ?? "").split(" ")[0]}&apos;s Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Welcome to your dashboard!
            </p>
          </section>
          <section className="flex items-center gap-3">
            <Button size="lg" asChild className="h-9">
              <Link href="/dashboard/search">+ New Analysis</Link>
            </Button>
            <Button size="lg" asChild variant="secondary">
              <Link href="/dashboard/history">History</Link>
            </Button>
          </section>
        </section>

        <section className="relative flex min-h-100 items-center justify-center overflow-hidden border-b">
          <BackdropGrid rows={8} columns={20} length={200} />
          <section className="relative z-10 flex flex-col items-center">
            <p className="text-lg font-medium">Analytics Dashboard</p>
            <p className="text-muted-foreground">Coming Soon</p>
          </section>
        </section>

        <div className="flex h-50 w-full flex-col items-center justify-center gap-2 border-b px-8">
          <p className="text-muted-foreground text-center">
            This is a Beta version. We are actively working on improving the
            product.
          </p>
          <Link
            href="mailto:prashant.s2922@gmail.com"
            className="underline underline-offset-2"
          >
            Submit Feedback
          </Link>
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;
