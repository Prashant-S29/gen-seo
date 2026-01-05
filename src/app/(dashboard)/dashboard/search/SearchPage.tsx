import Link from "next/link";
import React from "react";

// components
import { SearchForm } from "~/components/analysis";
import { Container } from "~/components/common";
import { Button } from "~/components/ui/button";

export const SearchPage: React.FC = () => {
  return (
    <Container>
      <div className="flex min-h-screen w-full flex-col py-15">
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
        <div className="p-8">
          <SearchForm />
        </div>
      </div>
    </Container>
  );
};
