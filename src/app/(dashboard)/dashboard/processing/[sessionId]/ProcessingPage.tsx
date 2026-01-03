"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

interface ProcessingPageProps {
  sessionId: string;
}

export const ProcessingPage: React.FC<ProcessingPageProps> = ({
  sessionId,
}) => {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Analysis Created</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="text-primary h-12 w-12 animate-spin" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">
                Analysis Session Created
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Session ID: {sessionId}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Your analysis is ready to be processed
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg border p-4">
            <h4 className="mb-2 font-medium">Next Steps:</h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>✓ Session created successfully</li>
              <li>⏳ Waiting for processing to begin</li>
              <li>⏳ Will execute 5 prompts across AI platforms</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/dashboard")}
            >
              Back to Dashboard
            </Button>
            <Button className="flex-1" onClick={() => router.push("/search")}>
              Start New Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
