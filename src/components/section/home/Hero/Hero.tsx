import Link from "next/link";
import React from "react";
import { BackdropGrid, Container } from "~/components/common";
import { HeroSearchTab } from "~/components/feature";
import { Button } from "~/components/ui/button";

export const Hero: React.FC = () => {
  return (
    <Container>
      <div className="flex h-screen w-full flex-col gap-8 py-15">
        <section className="px-8 pt-8">
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
            <Button size="lg" variant="link">
              How it works?
            </Button>
          </section>
        </section>
        <div className="relative flex min-h-100 w-full flex-col items-center justify-center gap-3 overflow-hidden border-y">
          <section className="z-10 flex flex-col items-center justify-center gap-5">
            <HeroSearchTab />
            <p>
              <span className="text-muted-foreground">
                Unable to find relevant results?{" "}
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
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-8">
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
