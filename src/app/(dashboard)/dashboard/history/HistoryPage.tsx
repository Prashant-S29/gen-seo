"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Clock,
  TrendingUp,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export const HistoryPage: React.FC = () => {
  const router = useRouter();
  const utils = api.useUtils();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.analysis.listSessions.useInfiniteQuery(
      { limit: 20 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const deleteSession = api.analysis.deleteSession.useMutation({
    onSuccess: () => {
      // Invalidate and refetch sessions list
      void utils.analysis.listSessions.invalidate();
    },
  });

  const handleDelete = (sessionId: string) => {
    if (confirm("Are you sure you want to delete this analysis?")) {
      deleteSession.mutate({ sessionId });
    }
  };

  const handleView = (sessionId: string) => {
    router.push(`/dashboard/results/${sessionId}`);
  };

  const sessions = data?.pages.flatMap((page) => page.sessions) ?? [];

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
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
          <h1 className="text-3xl font-bold">Analysis History</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your past analyses
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/search")}>
          New Analysis
        </Button>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No analyses yet</p>
            <Button
              className="mt-4"
              onClick={() => router.push("/dashboard/search")}
            >
              Create Your First Analysis
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:bg-muted/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">
                        {session.productName}
                      </CardTitle>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          session.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : session.status === "processing"
                              ? "bg-blue-100 text-blue-700"
                              : session.status === "failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {session.category} • {session.brands.length} brands
                      tracked
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {session.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(session.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Results
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(session.id)}
                      disabled={deleteSession.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="text-muted-foreground text-xs">Created</p>
                      <p className="text-sm font-medium">
                        {format(new Date(session.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="text-muted-foreground text-xs">Prompts</p>
                      <p className="text-sm font-medium">
                        {session.completedPrompts} / {session.totalPrompts}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {session.status === "completed" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : session.status === "failed" ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    )}
                    <div>
                      <p className="text-muted-foreground text-xs">Status</p>
                      <p className="text-sm font-medium capitalize">
                        {session.status}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Primary Brand
                      </p>
                      <p className="text-sm font-medium">
                        {session.primaryBrand}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Competitors Pills */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-muted-foreground text-xs">
                    Competitors:
                  </span>
                  {session.brands
                    .filter((brand) => brand !== session.primaryBrand)
                    .map((brand) => (
                      <span
                        key={brand}
                        className="bg-muted rounded-full px-2 py-0.5 text-xs"
                      >
                        {brand}
                      </span>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Load More Button */}
          {hasNextPage && (
            <div className="flex justify-center py-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
