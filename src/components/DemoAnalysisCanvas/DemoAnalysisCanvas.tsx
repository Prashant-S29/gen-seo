"use client";

import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { mockAnalysisData } from "./mock-data";
import { Loader } from "lucide-react";

type StepStatus = "not-started" | "loading" | "completed";

interface DemoAnalysisCanvasProps {
  className?: string;
}

export const DemoAnalysisCanvas: React.FC<DemoAnalysisCanvasProps> = ({
  className,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    Array(7).fill("not-started"),
  );

  const handleStepComplete = (stepIndex: number) => {
    // Set current step to loading
    setStepStatuses((prev) => {
      const newStatuses = [...prev];
      newStatuses[stepIndex] = "loading";
      return newStatuses;
    });

    // After 3 seconds, mark as completed and move to next step
    setTimeout(() => {
      setStepStatuses((prev) => {
        const newStatuses = [...prev];
        newStatuses[stepIndex] = "completed";
        return newStatuses;
      });

      if (stepIndex < 6) {
        setCurrentStep(stepIndex + 2);
      }
    }, 1000);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setStepStatuses(Array(7).fill("not-started"));
  };

  const getStatusBadge = (stepIndex: number) => {
    const status = stepStatuses[stepIndex];
    if (status === "loading") {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Loader className="h-3 w-3 animate-spin" />
          Loading...
        </Badge>
      );
    }
    if (status === "completed") {
      return <Badge variant="default">Completed</Badge>;
    }
    return <Badge variant="outline">Not Started</Badge>;
  };

  const isStepExpanded = (stepIndex: number) => {
    return (
      stepStatuses[stepIndex] === "completed" || currentStep > stepIndex + 1
    );
  };

  return (
    <div className={className}>
      {/* Step 1 - User Input */}
      <div className="flex flex-col gap-2">
        <section className="flex items-center justify-between">
          <Badge variant="outline">Step 1</Badge>
          {getStatusBadge(0)}
        </section>
        <section
          className={`${currentStep === 1 ? "border-primary dark:border-primary/70" : "border-border"} w-100 border-2 border-dashed p-2`}
        >
          <section className="bg-card border">
            <section className="flex items-center justify-between px-3 py-3">
              <p className="font-semibold">User Input</p>
              <Button
                size="sm"
                variant="default"
                onClick={() => handleStepComplete(0)}
                disabled={stepStatuses[0] !== "not-started"}
              >
                Analyze
              </Button>
            </section>
            <section className="space-y-2 border-t px-3 pt-2 pb-3">
              <section className="flex items-center justify-between">
                <p className="text-muted-foreground">Website</p>
                <p>{mockAnalysisData.step1.input.url}</p>
              </section>
              <section className="flex items-center justify-between">
                <p className="text-muted-foreground">Product</p>
                <p>{mockAnalysisData.step1.input.productName}</p>
              </section>
            </section>
            <section className="space-y-2 border-t px-3 pt-2 pb-3">
              <section className="flex flex-col">
                <p className="text-muted-foreground">Description</p>
                <p className="leading-snug">
                  {mockAnalysisData.step1.description}
                </p>
              </section>
            </section>
          </section>
        </section>
      </div>

      {/* Step 2 - AI Enrichment */}
      <div className="flex flex-col gap-2">
        <section className="flex items-center justify-between">
          <Badge variant="outline">Step 2</Badge>
          {getStatusBadge(1)}
        </section>{" "}
        <section
          className={`${currentStep === 2 ? "border-primary dark:border-primary/70" : "border-border"} w-100 border-2 border-dashed p-2`}
        >
          <section className="bg-card border">
            <section className="flex items-center justify-between px-3 py-3">
              <p className="font-semibold">AI Enrichment</p>
              <Button
                size="sm"
                onClick={() => handleStepComplete(1)}
                disabled={
                  stepStatuses[0] !== "completed" ||
                  stepStatuses[1] !== "not-started"
                }
              >
                Analyze
              </Button>
            </section>
            <section
              className={`overflow-hidden transition-all duration-500 ${
                isStepExpanded(1) ? "max-h-96" : "max-h-0"
              }`}
            >
              <section className="space-y-2 border-t px-3 pt-2 pb-3">
                <section className="flex items-center justify-between">
                  <p className="text-muted-foreground">Category</p>
                  <p>{mockAnalysisData.step2.productInfo.category}</p>
                </section>
                <section className="flex flex-col justify-between gap-2">
                  <p className="text-muted-foreground">Tags</p>
                  <section className="flex flex-wrap items-center gap-2">
                    {mockAnalysisData.step2.productInfo.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </section>
                </section>
              </section>
              <section className="space-y-2 border-t px-3 pt-2 pb-3">
                <section className="flex flex-col">
                  <p className="text-muted-foreground">Description</p>
                  <p className="leading-snug">
                    {mockAnalysisData.step2.description}
                  </p>
                </section>
              </section>
            </section>
          </section>
        </section>
      </div>

      {/* Step 3 - Finding Competitors */}
      <div className="flex flex-col gap-2">
        <section className="flex items-center justify-between">
          <Badge variant="outline">Step 3</Badge>
          {getStatusBadge(2)}
        </section>{" "}
        <section
          className={`${currentStep === 3 ? "border-primary dark:border-primary/70" : "border-border"} w-100 border-2 border-dashed p-2`}
        >
          <section className="bg-card border">
            <section className="flex items-center justify-between px-3 py-3">
              <p className="font-semibold">Finding Competitors</p>
              <Button
                size="sm"
                onClick={() => handleStepComplete(2)}
                disabled={
                  stepStatuses[1] !== "completed" ||
                  stepStatuses[2] !== "not-started"
                }
              >
                Analyze
              </Button>
            </section>
            <section
              className={`overflow-hidden transition-all duration-500 ${
                isStepExpanded(2) ? "max-h-96" : "max-h-0"
              }`}
            >
              <section className="space-y-2 border-t px-3 pt-2 pb-3">
                <section className="flex items-center justify-between">
                  <p className="text-muted-foreground">Total Competitors</p>
                  <p>{mockAnalysisData.step3.competitors.length}</p>
                </section>
                <section className="flex flex-wrap items-center gap-2">
                  {mockAnalysisData.step3.competitors.map((competitor) => (
                    <Badge key={competitor} variant="secondary">
                      {competitor}
                    </Badge>
                  ))}
                </section>
              </section>
              <section className="space-y-2 border-t px-3 pt-2 pb-3">
                <section className="flex flex-col">
                  <p className="text-muted-foreground">Description</p>
                  <p className="leading-snug">
                    {mockAnalysisData.step3.description}
                  </p>
                </section>
              </section>
            </section>
          </section>
        </section>
      </div>

      {/* Step 4 - Generate Prompts */}
      <div className="flex flex-col gap-2">
        <section className="flex items-center justify-between">
          <Badge variant="outline">Step 4</Badge>
          {getStatusBadge(3)}
        </section>
        <section
          className={`${currentStep === 4 ? "border-primary dark:border-primary/70" : "border-border"} w-100 border-2 border-dashed p-2`}
        >
          <section className="bg-card border">
            <section className="flex items-center justify-between px-3 py-3">
              <p className="font-semibold">Generate Prompts</p>
              <Button
                size="sm"
                onClick={() => handleStepComplete(3)}
                disabled={
                  stepStatuses[2] !== "completed" ||
                  stepStatuses[3] !== "not-started"
                }
              >
                Analyze
              </Button>
            </section>
            <section
              className={`overflow-hidden transition-all duration-500 ${
                isStepExpanded(3) ? "max-h-96" : "max-h-0"
              }`}
            >
              <section className="space-y-2 border-t px-3 pt-2 pb-3">
                <section className="flex items-center justify-between">
                  <p className="text-muted-foreground">Total Prompts</p>
                  <p>{mockAnalysisData.step4.prompts.length}</p>
                </section>
                <section className="flex flex-col gap-2">
                  {mockAnalysisData.step4.prompts
                    .slice(0, 3)
                    .map((prompt, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="w-full justify-start text-left"
                      >
                        {prompt}
                      </Badge>
                    ))}
                  {mockAnalysisData.step4.prompts.length > 3 && (
                    <Badge variant="secondary">
                      + {mockAnalysisData.step4.prompts.length - 3} more
                    </Badge>
                  )}
                </section>
              </section>
              <section className="space-y-2 border-t px-3 pt-2 pb-3">
                <section className="flex flex-col">
                  <p className="text-muted-foreground">Description</p>
                  <p className="leading-snug">
                    {mockAnalysisData.step4.description}
                  </p>
                </section>
              </section>
            </section>
          </section>
        </section>
      </div>

      {/* Step 5 - Dual Analysis */}
      <div className="flex flex-col gap-2">
        <section className="flex items-center justify-between">
          <Badge variant="outline">Step 5</Badge>
          {getStatusBadge(4)}
        </section>
        <section
          className={`${currentStep === 5 ? "border-primary dark:border-primary/70" : "border-border"} w-100 border-2 border-dashed p-2`}
        >
          <section className="bg-card border">
            <section className="flex items-center justify-between px-3 py-3">
              <p className="font-semibold">Dual Analysis</p>
              <Button
                size="sm"
                onClick={() => handleStepComplete(4)}
                disabled={
                  stepStatuses[3] !== "completed" ||
                  stepStatuses[4] !== "not-started"
                }
              >
                Analyze
              </Button>
            </section>
            <section
              className={`overflow-hidden transition-all duration-500 ${
                isStepExpanded(4) ? "max-h-96" : "max-h-0"
              }`}
            >
              <section className="space-y-6 border-t px-3 pt-2 pb-3">
                <section className="space-y-2">
                  <section className="flex items-center justify-between">
                    <p className="text-muted-foreground">API Analysis</p>
                    <p>
                      {mockAnalysisData.step5.apiAnalysis.completed}/
                      {mockAnalysisData.step5.apiAnalysis.totalQueries}
                    </p>
                  </section>
                  <section className="flex flex-wrap items-center gap-2">
                    {mockAnalysisData.step5.apiAnalysis.platforms.map(
                      (platform) => (
                        <Badge key={platform} variant="secondary">
                          {platform}
                        </Badge>
                      ),
                    )}
                  </section>
                </section>
                <section className="space-y-2">
                  <section className="flex items-center justify-between">
                    <p className="text-muted-foreground">Web Crawling</p>
                    <p>
                      {mockAnalysisData.step5.crawlingAnalysis.completed}/
                      {mockAnalysisData.step5.crawlingAnalysis.totalQueries}
                    </p>
                  </section>
                  <section className="flex flex-wrap items-center gap-2">
                    {mockAnalysisData.step5.crawlingAnalysis.platforms.map(
                      (platform) => (
                        <Badge key={platform} variant="secondary">
                          {platform}
                        </Badge>
                      ),
                    )}
                  </section>
                </section>
              </section>
              <section className="space-y-2 border-t px-3 pt-2 pb-3">
                <section className="flex flex-col">
                  <p className="text-muted-foreground">Description</p>
                  <p className="leading-snug">
                    {mockAnalysisData.step5.description}
                  </p>
                </section>
              </section>
            </section>
          </section>
        </section>
      </div>

      {/* Step 6 - Extract Data */}
      <div className="flex flex-col gap-2">
        <section className="flex items-center justify-between">
          <Badge variant="outline">Step 6</Badge>
          {getStatusBadge(5)}
        </section>
        <section
          className={`${currentStep === 6 ? "border-primary dark:border-primary/70" : "border-border"} w-100 border-2 border-dashed p-2`}
        >
          <section className="bg-card border">
            <section className="flex items-center justify-between px-3 py-3">
              <p className="font-semibold">Extract Data</p>
              <Button
                size="sm"
                onClick={() => handleStepComplete(5)}
                disabled={
                  stepStatuses[4] !== "completed" ||
                  stepStatuses[5] !== "not-started"
                }
              >
                Analyze
              </Button>
            </section>
            <section
              className={`overflow-hidden transition-all duration-500 ${
                isStepExpanded(5) ? "max-h-96" : "max-h-0"
              }`}
            >
              <section className="space-y-6 border-t px-3 pt-2 pb-3">
                <section className="space-y-2">
                  <section className="flex items-center justify-between">
                    <p className="text-muted-foreground">Mentions</p>
                    <p>{mockAnalysisData.step6.mentions.byBrand.Doogle}</p>
                  </section>
                  <section className="flex items-center justify-between">
                    <p className="text-muted-foreground">Citations</p>
                    <p>{mockAnalysisData.step6.citations.total}</p>
                  </section>
                  <section className="flex items-center justify-between">
                    <p className="text-muted-foreground">Sentiments</p>
                    <section className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">
                        {mockAnalysisData.step6.sentiment.positive} Positives
                      </Badge>
                      <Badge variant="secondary">
                        {mockAnalysisData.step6.sentiment.neutral} Neutral
                      </Badge>
                    </section>
                  </section>
                </section>
              </section>
              <section className="space-y-2 border-t px-3 pt-2 pb-3">
                <section className="flex flex-col">
                  <p className="text-muted-foreground">Description</p>
                  <p className="leading-snug">
                    {mockAnalysisData.step6.description}
                  </p>
                </section>
              </section>
            </section>
          </section>
        </section>
      </div>

      {/* Step 7 - Final Results */}
      <div className="flex flex-col gap-2">
        <section className="flex items-center justify-between">
          <Badge variant="outline">Step 7</Badge>
          {getStatusBadge(6)}
        </section>
        <section
          className={`${currentStep === 7 ? "border-primary dark:border-primary/70" : "border-border"} w-100 border-2 border-dashed p-2`}
        >
          <section className="bg-card border">
            <section className="flex items-center justify-between px-3 py-3">
              <p className="font-semibold">Final Results</p>
              {stepStatuses[6] !== "completed" ? (
                <Button
                  size="sm"
                  onClick={() => handleStepComplete(6)}
                  disabled={
                    stepStatuses[5] !== "completed" ||
                    stepStatuses[6] !== "not-started"
                  }
                >
                  Analyze
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              )}
            </section>
            <section
              className={`overflow-hidden transition-all duration-500 ${
                isStepExpanded(6) ? "max-h-96" : "max-h-0"
              }`}
            >
              <section className="space-y-6 border-t px-3 pt-2 pb-3">
                <section className="space-y-2">
                  <section className="flex items-center justify-between">
                    <p className="text-muted-foreground">Visibility</p>
                    <p>
                      {mockAnalysisData.step7.finalMetrics.visibilityScore}%
                    </p>
                  </section>
                  <section className="flex items-center justify-between">
                    <p className="text-muted-foreground">Citation Share</p>
                    <p>{mockAnalysisData.step7.finalMetrics.citationShare}%</p>
                  </section>
                  <section className="flex items-center justify-between">
                    <p className="text-muted-foreground">Avg Position</p>
                    <p>
                      #{mockAnalysisData.step7.finalMetrics.averagePosition}
                    </p>
                  </section>
                  <section className="flex items-center justify-between">
                    <p className="text-muted-foreground">Method Comparison</p>
                    <section className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">
                        API -{" "}
                        {
                          mockAnalysisData.step7.finalMetrics.apiVsCrawling.api
                            .visibility
                        }
                        %
                      </Badge>
                      <Badge variant="secondary">
                        Crawling -{" "}
                        {
                          mockAnalysisData.step7.finalMetrics.apiVsCrawling
                            .crawling.visibility
                        }
                        %
                      </Badge>
                    </section>
                  </section>
                </section>
              </section>
              <section className="space-y-2 border-t px-3 pt-2 pb-3">
                <section className="flex flex-col">
                  <p className="text-muted-foreground">Description</p>
                  <p className="leading-snug">
                    {mockAnalysisData.step7.description}
                  </p>
                </section>
              </section>
            </section>
          </section>
        </section>
      </div>
    </div>
  );
};
