"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Link2, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import {
  VisibilityChart,
  MentionsPieChart,
  CitationRateChart,
} from "~/components/analysis/Charts";
import { exportToCSV } from "~/lib/utils";
import { BackdropGrid, Container } from "~/components/common";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "~/components/ui/badge";

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

  const handleExport = () => {
    if (!results) return;
    exportToCSV(results);
  };

  if (isLoading) {
    return (
      <Container>
        <div className="flex h-screen w-full flex-col py-15">
          <section className="flex justify-between border-b p-8">
            <section>
              <h1 className="font-clashDisplay mt-5 text-5xl leading-tight font-medium">
                Analysis Results
              </h1>
              <p className="text-muted-foreground mt-1 text-lg">
                View and manage your analysis results.
              </p>
            </section>
          </section>
          <section className="relative flex h-full w-full items-center justify-center overflow-hidden">
            <BackdropGrid rows={10} columns={15} length={250} />
            <section className="relative z-10">
              <p>Loading...</p>
            </section>
          </section>
        </div>
      </Container>
    );
  }

  if (error || !results) {
    return (
      <Container>
        <div className="flex h-screen w-full flex-col py-15">
          <section className="flex justify-between border-b p-8">
            <section>
              <h1 className="font-clashDisplay mt-5 text-5xl leading-tight font-medium">
                Analysis Results
              </h1>
              <p className="text-muted-foreground mt-1 text-lg">
                View and manage your analysis results.
              </p>
            </section>
          </section>
          <section className="relative flex h-full w-full items-center justify-center overflow-hidden">
            <BackdropGrid rows={10} columns={15} length={250} />
            <section className="relative z-10 flex flex-col items-center gap-3">
              <p className="text-muted-foreground">
                Failed to load analysis results
              </p>
              <Button onClick={() => router.push("/dashboard/search")}>
                Start New Analysis
              </Button>
            </section>
          </section>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex min-h-screen w-full flex-col py-15">
        <section className="flex justify-between border-b p-8">
          <section>
            <h1 className="font-clashDisplay mt-5 text-5xl leading-tight font-medium">
              Analysis Results
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              View and manage your analysis results.
            </p>
          </section>
          <section className="flex items-center gap-3">
            <Button size="lg" asChild className="h-9">
              <Link href="/dashboard/search">+ New Analysis</Link>
            </Button>
            <Button size="lg" asChild variant="secondary">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </section>
        </section>

        <section className="flex justify-between border-b p-8">
          <section>
            <h1 className="text-3xl font-bold">
              {results.session.productName}
            </h1>
            <p className="text-muted-foreground mt-1">
              {results.session.category} •&nbsp;
              {format(new Date(results.session.createdAt), "MMM d, yyyy")}
            </p>
            <Badge variant="secondary" className="mt-2">
              {results.session.analysisMethod === "both"
                ? "API + Web Crawling"
                : results.session.analysisMethod === "crawling_only"
                  ? "Web Crawling Only"
                  : "API Only"}
            </Badge>
          </section>
          <section className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Download CSV Report
            </Button>
          </section>
        </section>

        <div className="flex flex-col gap-8 p-8">
          <div className="grid gap-8 md:grid-cols-5">
            <Card>
              <CardHeader className="">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Visibility Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
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
              <CardHeader className="">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Citation Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">
                    {results.metrics.citationRate}%
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  {results.metrics.primaryBrandCitations} citations found
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="">
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
              <CardHeader className="">
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
              <CardHeader className="">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Providers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Object.keys(results.metrics.responsesByPlatform).length}
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  AI platforms tested
                </p>
              </CardContent>
            </Card>
          </div>
          {/* Charts Section */}
          <div className="grid gap-8">
            <VisibilityChart
              data={results.leaderboard}
              primaryBrand={results.session.primaryBrand}
            />
            <MentionsPieChart data={results.leaderboard} />
          </div>
          {/* Citation Rate Chart - Full Width */}
          <CitationRateChart data={results.leaderboard} />

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
                    <div>
                      <div>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            # {index + 1} Position
                          </Badge>
                          {entry.brand === results.session.primaryBrand && (
                            <Badge variant="secondary">Your Brand</Badge>
                          )}
                        </div>
                        <p className="mt-2 text-lg font-semibold">
                          {entry.brand}
                        </p>
                      </div>
                      <div className="text-muted-foreground flex gap-3 text-sm">
                        <span>
                          {entry.mentions} mention
                          {entry.mentions !== 1 ? "s" : ""}
                        </span>
                        <span>•</span>
                        <span>
                          {entry.citations} citation
                          {entry.citations !== 1 ? "s" : ""}
                        </span>
                        <span>•</span>
                        <span>{entry.citationRate}% citation rate</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {entry.visibilityScore}%
                      </div>
                      <p className="text-muted-foreground text-xs">
                        visibility
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Cited Domains */}
          {results.topCitedDomains.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Cited Domains</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.topCitedDomains.map((domain) => (
                    <div
                      key={domain.domain}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Link2 className="text-muted-foreground h-4 w-4" />
                          <span className="font-medium">{domain.domain}</span>
                        </div>
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {domain.count} citation{domain.count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              Prompt Type - {prompt.type}
                            </Badge>

                            {prompt.primaryBrandMentioned ? (
                              <Badge variant="success">
                                Your brand mentioned
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                Your brand was not mentioned
                              </Badge>
                            )}
                          </div>

                          <p className="text-lg font-semibold">{prompt.text}</p>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {/*{prompt.competitorsMentioned.length > 0 && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                              {prompt.competitorsMentioned.length} competitor
                              {prompt.competitorsMentioned.length !== 1
                                ? "s"
                                : ""}{" "}
                              mentioned
                            </span>
                          )}*/}
                          {/*{prompt.citationCount > 0 && (
                            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                              {prompt.citationCount} citation
                              {prompt.citationCount !== 1 ? "s" : ""}
                            </span>
                          )}*/}
                        </div>
                        {/*{prompt.competitorsMentioned.length > 0 && (
                          <p className="text-muted-foreground mt-2 text-sm">
                            Competitors:{" "}
                            {prompt.competitorsMentioned.join(", ")}
                          </p>
                        )}*/}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
};
