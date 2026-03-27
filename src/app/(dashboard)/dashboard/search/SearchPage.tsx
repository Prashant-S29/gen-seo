"use client";

import Link from "next/link";
import React, { useState } from "react";

// components
import { SearchForm } from "~/components/analysis";
import { Container } from "~/components/common";
import { Button } from "~/components/ui/button";
import { HeroSearchTab } from "~/components/feature";
import { cn } from "~/lib/utils";
import { Globe, PenLine } from "lucide-react";

type Tab = "auto" | "manual";

export const SearchPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("auto");

  return (
    <Container>
      <div className="flex min-h-screen w-full flex-col py-15">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <section className="flex justify-between border-b p-8">
          <section>
            <h1 className="font-clashDisplay mt-5 text-5xl leading-tight font-medium">
              Analyze your brand
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Start your brand analysis and get insights.
            </p>
          </section>
          <section className="flex items-center gap-3">
            <Button size="lg" asChild variant="secondary">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </section>
        </section>

        {/* ── Tab switcher ────────────────────────────────────────────────── */}
        <section className="border-b px-8">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab("auto")}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === "auto"
                  ? "border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              <Globe className="h-4 w-4" />
              Auto Detect via URL
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === "manual"
                  ? "border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              <PenLine className="h-4 w-4" />
              Manual Entry
            </button>
          </div>
        </section>

        {/* ── Tab content ─────────────────────────────────────────────────── */}
        <div className="flex-1 p-8">
          {activeTab === "auto" && (
            <div className="flex flex-col items-start gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Paste your website URL</p>
                <p className="text-muted-foreground text-sm">
                  We&apos;ll automatically detect your product, brand, category
                  and competitors — then run the full analysis.
                </p>
              </div>
              <HeroSearchTab />
            </div>
          )}

          {activeTab === "manual" && (
            <div className="flex flex-col gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Manual configuration</p>
                <p className="text-muted-foreground text-sm">
                  Fill in your product details, competitors and choose an
                  analysis method manually.
                </p>
              </div>
              <SearchForm />
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};
