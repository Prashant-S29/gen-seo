import Link from "next/link";
import React from "react";
import { BackdropGrid, Container } from "~/components/common";
import { DemoAnalysisCanvas } from "~/components/DemoAnalysisCanvas";
import { HeroSearchTab } from "~/components/feature";
import { Button } from "~/components/ui/button";

export const Hero: React.FC = () => {
  return (
    <Container>
      <div className="g flex min-h-screen w-full flex-col py-15">
        <section className="border-b p-8">
          <h1 className="font-clashDisplay mt-5 text-5xl leading-tight font-medium">
            AI Visibility Tracker
          </h1>
          <p className="mt-1 text-lg">
            The way people browse internet has changed so does your generic SEO
            analytics.
          </p>

          <section className="mt-7 flex gap-3">
            <Button size="lg" asChild>
              <Link href="/dashboard">Try now</Link>
            </Button>
            <Button size="lg" variant="link" asChild>
              <Link href="/how-it-works">How it works?</Link>
            </Button>
          </section>
        </section>
        <div className="relative flex min-h-100 w-full flex-col items-center justify-center gap-3 overflow-hidden border-b p-8">
          <section className="z-10 flex flex-col items-center justify-center gap-5">
            <HeroSearchTab />
            <p>
              <span className="text-muted-foreground">
                Direct search feature is under development.{" "}
              </span>
              <Link
                href="dashboard/search"
                className="text-primary underline underline-offset-2"
              >
                Try Searching Manually
              </Link>
            </p>
          </section>
          <BackdropGrid columns={14} rows={6} length={98} />
        </div>
        <div className="border-b p-8">
          <h1 className="text-xl leading-tight font-semibold">
            Demo Analysis Flow
          </h1>
          <p className="text-muted-foreground mt-2 text-lg leading-snug">
            Click &rdquo;Analyze&rdquo; on each step to see the data flow
            through our system. This Beta version supports only a limited set of
            features.
          </p>

          <DemoAnalysisCanvas className="mt-8 flex h-150 w-full flex-col items-center gap-12 overflow-y-scroll border p-20" />
        </div>
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
