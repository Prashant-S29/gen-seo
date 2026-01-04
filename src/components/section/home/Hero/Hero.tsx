import Link from "next/link";
import React from "react";
import { BackdropGrid, Container } from "~/components/common";
import { HeroSearchTab } from "~/components/feature";
import { Button } from "~/components/ui/button";

export const Hero: React.FC = () => {
  return (
    <Container>
      <div className="flex h-screen w-full flex-col gap-8 py-15">
        <section className="mt-15 px-8">
          <h1 className="font-clashDisplay text-5xl leading-tight font-medium">
            AI Visibility Tracker
          </h1>
          <p className="mt-1 text-lg">
            The way people browse internet has changed so does your generic SEO
            analytics.
          </p>

          <section className="mt-7 flex gap-3">
            <Button size="lg">Try now</Button>
            <Button size="lg" variant="link">
              How it works?
            </Button>
          </section>
        </section>
        <div className="relative flex h-100 w-full flex-col items-center justify-center gap-3 overflow-hidden border-y">
          <section className="z-10 flex flex-col items-center justify-center gap-5">
            <HeroSearchTab />
            <p>
              Unable to find relevant results? Try{" "}
              <Link
                href="dashboard/search"
                className="text-primary underline underline-offset-2"
              >
                Searching Manually
              </Link>
            </p>
          </section>
          <BackdropGrid columns={14} rows={6} length={98} />
        </div>
      </div>
    </Container>
  );
};
