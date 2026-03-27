"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { BackdropGrid, Container } from "~/components/common";

interface ProcessingPageProps {
  sessionId: string;
}

export const ProcessingPage: React.FC<ProcessingPageProps> = ({
  sessionId,
}) => {
  const router = useRouter();

  // Poll every 1 s while processing so the progress bar updates in real time.
  // Stops automatically once the session reaches a terminal state.
  const { data: session, isLoading } = api.analysis.getSession.useQuery(
    { sessionId },
    {
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        if (status === "completed" || status === "failed") return false;
        return 1000; // 1-second heartbeat while processing
      },
    },
  );

  if (isLoading) {
    return (
      <Container>
        <div className="flex min-h-screen items-center justify-center">
          <Card>
            <CardContent className="py-8">
              <div className="flex items-center justify-center">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container>
        <div className="flex min-h-screen items-center justify-center">
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground mb-4">
                The analysis session could not be found.
              </p>
              <Button onClick={() => router.push("/dashboard/search")}>
                Start New Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  const isCompleted = session.status === "completed";
  const isFailed = session.status === "failed";

  // Determine current step based on status
  const getCurrentStep = () => {
    if (isCompleted) return 7;
    if (isFailed) return 5;
    return 5; // Currently processing step 5
  };

  const currentStep = getCurrentStep();

  const getStepStatus = (step: number) => {
    if (step < 5) return "completed";
    if (step === 5 && currentStep >= 5 && !isCompleted) return "loading";
    if (step === 5 && isCompleted) return "completed";
    return "not-started";
  };

  const getStatusBadge = (step: number) => {
    const status = getStepStatus(step);

    if ((step === 6 || step === 7) && isCompleted) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </Badge>
      );
    }

    if (status === "loading") {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing...
        </Badge>
      );
    }
    if (status === "completed") {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </Badge>
      );
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const isStepExpanded = (step: number) => {
    return getStepStatus(step) === "completed";
  };

  return (
    <Container>
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden py-8">
        <BackdropGrid rows={15} columns={14} length={350} />

        <div className="bg-card relative z-10 flex max-h-150 w-full max-w-xl flex-col gap-8 overflow-y-auto rounded-lg border p-8 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold">Analysis in Progress</h1>
            </div>
            <Button
              disabled={!isCompleted}
              onClick={() => router.push(`/dashboard/results/${sessionId}`)}
            >
              See Report
            </Button>
          </div>

          {/* Step 1 - User Input */}
          <div className="flex flex-col gap-2">
            <section className="flex items-center justify-between">
              <Badge variant="outline">Step 1</Badge>
              {getStatusBadge(1)}
            </section>
            <section
              className={`${getStepStatus(1) === "completed" ? "border-border" : "border-primary/50"} w-full border-2 border-dashed p-2 transition-all`}
            >
              <section className="bg-card border">
                <section className="flex items-center justify-between px-3 py-3">
                  <p className="font-semibold">User Input</p>
                </section>
                <section
                  className={`overflow-hidden transition-all duration-500 ${
                    isStepExpanded(1) ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <section className="space-y-2 border-t px-3 pt-2 pb-3">
                    <section className="flex items-center justify-between">
                      <p className="text-muted-foreground">Product</p>
                      <p className="font-medium">{session.productName}</p>
                    </section>
                    <section className="flex items-center justify-between">
                      <p className="text-muted-foreground">Primary Brand</p>
                      <p className="font-medium">{session.primaryBrand}</p>
                    </section>
                    <section className="flex items-center justify-between">
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium">{session.category}</p>
                    </section>
                  </section>
                </section>
              </section>
            </section>
          </div>

          {/* Step 2 - AI Enrichment */}
          <div className="flex flex-col gap-2">
            <section className="flex items-center justify-between">
              <Badge variant="outline">Step 2</Badge>
              {getStatusBadge(2)}
            </section>
            <section
              className={`${getStepStatus(2) === "completed" ? "border-border" : "border-primary/50"} w-full border-2 border-dashed p-2 transition-all`}
            >
              <section className="bg-card border">
                <section className="flex items-center justify-between px-3 py-3">
                  <p className="font-semibold">AI Enrichment</p>
                </section>
                <section
                  className={`overflow-hidden transition-all duration-500 ${
                    isStepExpanded(2) ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <section className="space-y-2 border-t px-3 pt-2 pb-3">
                    <section className="flex flex-col gap-2">
                      <p className="text-muted-foreground">Brands Analyzed</p>
                      <section className="flex flex-wrap gap-2">
                        {session.brands.map((brand) => (
                          <Badge key={brand} variant="secondary">
                            {brand}
                          </Badge>
                        ))}
                      </section>
                    </section>
                  </section>
                  <section className="space-y-2 border-t px-3 pt-2 pb-3">
                    <p className="text-muted-foreground">Description</p>
                    <p className="text-sm leading-snug">
                      Enhanced product information with AI-generated insights
                      and competitive context.
                    </p>
                  </section>
                </section>
              </section>
            </section>
          </div>

          {/* Step 3 - Finding Competitors */}
          <div className="flex flex-col gap-2">
            <section className="flex items-center justify-between">
              <Badge variant="outline">Step 3</Badge>
              {getStatusBadge(3)}
            </section>
            <section
              className={`${getStepStatus(3) === "completed" ? "border-border" : "border-primary/50"} w-full border-2 border-dashed p-2 transition-all`}
            >
              <section className="bg-card border">
                <section className="flex items-center justify-between px-3 py-3">
                  <p className="font-semibold">Finding Competitors</p>
                </section>
                <section
                  className={`overflow-hidden transition-all duration-500 ${
                    isStepExpanded(3) ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <section className="space-y-2 border-t px-3 pt-2 pb-3">
                    <section className="flex items-center justify-between">
                      <p className="text-muted-foreground">Competitors Found</p>
                      <p className="font-medium">{session.brands.length}</p>
                    </section>
                  </section>
                  <section className="space-y-2 border-t px-3 pt-2 pb-3">
                    <p className="text-muted-foreground">Description</p>
                    <p className="text-sm leading-snug">
                      Identified key competitors in the {session.category}{" "}
                      category for comprehensive analysis.
                    </p>
                  </section>
                </section>
              </section>
            </section>
          </div>

          {/* Step 4 - Generate Prompts */}
          <div className="flex flex-col gap-2">
            <section className="flex items-center justify-between">
              <Badge variant="outline">Step 4</Badge>
              {getStatusBadge(4)}
            </section>
            <section
              className={`${getStepStatus(4) === "completed" ? "border-border" : "border-primary/50"} w-full border-2 border-dashed p-2 transition-all`}
            >
              <section className="bg-card border">
                <section className="flex items-center justify-between px-3 py-3">
                  <p className="font-semibold">Generate Prompts</p>
                </section>
                <section
                  className={`overflow-hidden transition-all duration-500 ${
                    isStepExpanded(4) ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <section className="space-y-2 border-t px-3 pt-2 pb-3">
                    <section className="flex items-center justify-between">
                      <p className="text-muted-foreground">Total Prompts</p>
                      <p className="font-medium">{session.promptCount}</p>
                    </section>
                    <section className="flex items-center justify-between gap-2">
                      <p className="text-muted-foreground">Analysis Method</p>
                      <Badge variant="secondary">
                        {session.analysisMethod === "both"
                          ? "API + Crawling"
                          : session.analysisMethod === "api_only"
                            ? "API Only"
                            : "Crawling Only"}
                      </Badge>
                    </section>
                  </section>
                  <section className="space-y-2 border-t px-3 pt-2 pb-3">
                    <p className="text-muted-foreground">Description</p>
                    <p className="text-sm leading-snug">
                      Generated {session.promptCount} targeted search prompts
                      for analysis across selected AI platforms.
                    </p>
                  </section>
                </section>
              </section>
            </section>
          </div>

          {/* Step 5 - Dual Analysis */}
          <div className="flex flex-col gap-2">
            <section className="flex items-center justify-between">
              <Badge variant="outline">Step 5</Badge>
              {getStatusBadge(5)}
            </section>
            <section
              className={`${getStepStatus(5) === "loading" ? "border-primary dark:border-primary/70" : getStepStatus(5) === "completed" ? "border-border" : "border-primary/50"} w-full border-2 border-dashed p-2 transition-all`}
            >
              <section className="bg-card border">
                {/* Header row — shows live pulse dot while running */}
                <section className="flex items-center justify-between px-3 py-3">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">Dual Analysis</p>
                    {getStepStatus(5) === "loading" && (
                      <span className="relative flex h-2 w-2">
                        <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                        <span className="bg-primary relative inline-flex h-2 w-2 rounded-full" />
                      </span>
                    )}
                  </div>
                  {/* Live counter badge while running */}
                  {getStepStatus(5) === "loading" &&
                    session.totalPrompts > 0 && (
                      <span className="text-primary text-xs font-semibold tabular-nums">
                        {session.completedPrompts}&nbsp;/&nbsp;
                        {session.totalPrompts} prompts
                      </span>
                    )}
                </section>

                <section
                  className={`overflow-hidden transition-all duration-500 ${
                    isStepExpanded(5) || getStepStatus(5) === "loading"
                      ? "max-h-[32rem]"
                      : "max-h-0"
                  }`}
                >
                  <section className="space-y-3 border-t px-3 pt-3 pb-3">
                    {/* Progress bar */}
                    {session.totalPrompts > 0 && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <p className="text-muted-foreground">
                            {isCompleted
                              ? "All prompts completed"
                              : session.completedPrompts === 0
                                ? "Starting analysis…"
                                : `Analyzing prompt ${session.completedPrompts + 1} of ${session.totalPrompts}…`}
                          </p>
                          <p className="font-medium tabular-nums">
                            {Math.round(
                              (session.completedPrompts /
                                session.totalPrompts) *
                                100,
                            )}
                            %
                          </p>
                        </div>

                        {/*<div className="bg-secondary h-2.5 w-full overflow-hidden rounded-full">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${(session.completedPrompts / session.totalPrompts) * 100}%`,
                            }}
                          />
                        </div>*/}

                        {/* Prompt tick marks */}
                        <div className="flex gap-1">
                          {Array.from({ length: session.totalPrompts }).map(
                            (_, i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                                  i < session.completedPrompts
                                    ? "bg-primary"
                                    : i === session.completedPrompts &&
                                        !isCompleted
                                      ? "bg-primary/40 animate-pulse"
                                      : "bg-secondary"
                                }`}
                              />
                            ),
                          )}
                        </div>
                      </>
                    )}

                    {/* Providers */}
                    <section className="flex flex-wrap gap-2 pt-1">
                      {session.selectedProviders.map((provider) => (
                        <Badge key={provider} variant="secondary">
                          {provider}
                        </Badge>
                      ))}
                    </section>
                  </section>

                  <section className="space-y-1 border-t px-3 pt-2 pb-3">
                    <p className="text-muted-foreground text-xs">
                      Running across {session.selectedProviders.length} AI
                      platform
                      {session.selectedProviders.length !== 1
                        ? "s"
                        : ""} using{" "}
                      {session.analysisMethod === "both"
                        ? "API + web crawling"
                        : session.analysisMethod === "crawling_only"
                          ? "web crawling"
                          : "API"}{" "}
                      · each prompt queries all providers in parallel.
                    </p>
                  </section>
                </section>
              </section>
            </section>
          </div>

          {/* Step 6 - Extract Data */}
          <div className="flex flex-col gap-2">
            <section className="flex items-center justify-between">
              <Badge variant="outline">Step 6</Badge>
              {getStatusBadge(6)}
            </section>
            <section
              className={`border-border w-full border-2 border-dashed p-2 transition-all`}
            >
              <section className="bg-card border">
                <section className="flex items-center justify-between px-3 py-3">
                  <p className="font-semibold">Extract Data</p>
                </section>
              </section>
            </section>
          </div>

          {/* Step 7 - Final Results */}
          <div className="flex flex-col gap-2">
            <section className="flex items-center justify-between">
              <Badge variant="outline">Step 7</Badge>
              {getStatusBadge(7)}
            </section>
            <section
              className={`border-border w-full border-2 border-dashed p-2 transition-all`}
            >
              <section className="bg-card flex items-center justify-between border px-3 py-3">
                <section className="flex items-center justify-between">
                  <p className="font-semibold">Final Results</p>
                </section>
                <Button
                  size="sm"
                  onClick={() => router.push(`/dashboard/results/${sessionId}`)}
                  disabled={!isCompleted}
                >
                  See Report
                </Button>
              </section>
            </section>
          </div>

          {/* Show error message */}
          {/*{isFailed && (
            <div className="border-destructive bg-destructive/10 rounded-lg border p-4 text-center">
              <h3 className="mb-2 text-lg font-semibold">Analysis Failed</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                There was an error processing your analysis. Please try again.
              </p>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/search")}
              >
                Start New Analysis
              </Button>
            </div>
          )}*/}
        </div>
      </div>
    </Container>
  );
};
