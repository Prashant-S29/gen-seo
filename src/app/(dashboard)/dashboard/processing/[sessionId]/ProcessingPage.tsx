"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

interface ProcessingPageProps {
  sessionId: string;
}

export const ProcessingPage: React.FC<ProcessingPageProps> = ({
  sessionId,
}) => {
  const router = useRouter();

  // Poll session status every 3 seconds
  const { data: session, isLoading } = api.analysis.getSession.useQuery(
    { sessionId },
    {
      refetchInterval: (query) => {
        // Stop polling if completed or failed
        if (
          query.state.data?.status === "completed" ||
          query.state.data?.status === "failed"
        ) {
          return false;
        }
        return 3000; // Poll every 3 seconds
      },
    },
  );

  // Redirect to results when completed
  useEffect(() => {
    if (session?.status === "completed") {
      // Wait 2 seconds before redirecting to show completion state
      setTimeout(() => {
        router.push(`/dashboard/results/${sessionId}`);
      }, 2000);
    }
  }, [session?.status, sessionId, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl py-8">
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto max-w-3xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Session Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The analysis session could not be found.
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

  const progress =
    session.totalPrompts > 0
      ? Math.round((session.completedPrompts / session.totalPrompts) * 100)
      : 0;

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {session.status === "completed" && "Analysis Complete"}
            {session.status === "processing" && "Analysis In Progress"}
            {session.status === "failed" && "Analysis Failed"}
            {session.status === "pending" && "Analysis Starting"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Icon */}
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            {session.status === "processing" && (
              <Loader2 className="text-primary h-16 w-16 animate-spin" />
            )}
            {session.status === "completed" && (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
            {session.status === "failed" && (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
            {session.status === "pending" && (
              <Loader2 className="text-primary h-16 w-16 animate-spin" />
            )}

            <div className="text-center">
              <h3 className="text-lg font-semibold">
                Analyzing {session.productName}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Category: {session.category}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {session.status === "processing" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-muted-foreground text-center text-sm">
                {session.completedPrompts} of {session.totalPrompts} prompts
                completed
              </p>
            </div>
          )}

          {/* Status Details */}
          <div className="bg-muted/50 rounded-lg border p-4">
            <h4 className="mb-2 font-medium">Status:</h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Session created
              </li>
              <li className="flex items-center gap-2">
                {session.status === "pending" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                Generating prompts
              </li>
              <li className="flex items-center gap-2">
                {session.status === "processing" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : session.status === "completed" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4" />
                )}
                Querying AI platforms
              </li>
              <li className="flex items-center gap-2">
                {session.status === "completed" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4" />
                )}
                Analyzing results
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {session.status === "failed" && (
              <Button
                className="flex-1"
                onClick={() => router.push("/dashboard/search")}
              >
                Try Again
              </Button>
            )}
            {session.status === "completed" && (
              <Button
                className="flex-1"
                onClick={() => router.push(`/dashboard/results/${sessionId}`)}
              >
                View Results
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
