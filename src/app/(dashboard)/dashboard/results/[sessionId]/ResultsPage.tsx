"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

interface ResultsPageProps {
  sessionId: string;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ sessionId }) => {
  const router = useRouter();

  const {
    data: results,
    isLoading,
    error,
  } = api.analysis.getResults.useQuery({
    sessionId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <p className="text-muted-foreground">Loading results...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {error?.message || "Failed to load analysis results"}
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/dashboard/search")}
            >
              Start New Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Analysis Results</h1>
          <p className="text-muted-foreground mt-1">
            {results.session.productName} • {results.session.category}
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/search")}>
          New Analysis
        </Button>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Visibility Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="text-primary h-5 w-5" />
              <span className="text-3xl font-bold">
                {results.metrics.visibilityScore}%
              </span>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              Mentioned in {results.metrics.primaryBrandMentions} of{" "}
              {results.metrics.totalPrompts} prompts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Prompts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {results.metrics.totalPrompts}
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              Executed successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Mentions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {results.metrics.totalMentions}
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              Across all brands
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Platform
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Gemini</div>
            <p className="text-muted-foreground mt-2 text-xs">
              gemini-1.5-flash
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Competitive Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Competitive Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.leaderboard.map((entry, index) => (
              <div
                key={entry.brand}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : index === 1
                          ? "bg-gray-100 text-gray-700"
                          : index === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{entry.brand}</span>
                      {entry.brand === results.session.primaryBrand && (
                        <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
                          Your Brand
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {entry.mentions} mention{entry.mentions !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {entry.visibilityScore}%
                  </div>
                  <p className="text-muted-foreground text-xs">visibility</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prompts List */}
      <Card>
        <CardHeader>
          <CardTitle>Prompts Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="hover:bg-muted/50 rounded-lg border p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {prompt.primaryBrandMentioned ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <p className="font-medium">{prompt.text}</p>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
                        {prompt.type}
                      </span>
                      {prompt.primaryBrandMentioned && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                          Your brand mentioned
                        </span>
                      )}
                      {prompt.competitorsMentioned.length > 0 && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                          {prompt.competitorsMentioned.length} competitor
                          {prompt.competitorsMentioned.length !== 1
                            ? "s"
                            : ""}{" "}
                          mentioned
                        </span>
                      )}
                    </div>
                    {prompt.competitorsMentioned.length > 0 && (
                      <p className="text-muted-foreground mt-2 text-sm">
                        Competitors: {prompt.competitorsMentioned.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
