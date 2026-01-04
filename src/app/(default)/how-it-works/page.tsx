import React from "react";
import Link from "next/link";
import { BackdropGrid, Container } from "~/components/common";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { DemoAnalysisCanvas } from "~/components/DemoAnalysisCanvas";

const HowItWorks: React.FC = () => {
  return (
    <Container>
      <div className="flex min-h-screen w-full flex-col pt-15">
        {/* Hero Section */}
        <section className="p-8">
          <h1 className="font-clashDisplay mt-5 text-5xl leading-tight font-medium">
            How GenSEO Works
          </h1>
          <p className="mt-1 text-lg">
            A dual-engine analysis system that combines API intelligence with
            real-world web crawling for unparalleled accuracy.
          </p>

          <section className="mt-7 flex gap-3">
            <Button size="lg" asChild>
              <Link href="/dashboard">Start Your Analysis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/ideology">Why This Matters</Link>
            </Button>
          </section>
        </section>

        <Separator />

        {/* Quick Overview */}
        <section className="border-b p-8">
          <h1 className="text-xl leading-tight font-semibold">
            The Complete Process
          </h1>
          <div className="text-muted-foreground mt-2 text-lg">
            <p>
              From website URL to comprehensive AI visibility insights in
              minutes. Our dual-engine approach ensures you get the most
              accurate picture of how AI agents perceive your brand.
            </p>
          </div>
        </section>

        {/* Interactive Flow Canvas */}
        <section className="border-b p-8">
          <h1 className="text-xl leading-tight font-semibold">Analysis Flow</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Click &rdquo;Analyze&rdquo; on each step to see the data flow
            through our system.
          </p>

          <DemoAnalysisCanvas />

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              This interactive demo shows <strong>DUMMY</strong> data using an
              example of &rdquo;Salesforce&rdquo;. These are not the real
              matrices and MUST NOT be used for any real world work.
            </p>
          </div>
        </section>

        {/* Technical Stack */}
        <section className="border-b p-8">
          <h1 className="text-xl leading-tight font-semibold">
            Powered By Modern Tech
          </h1>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="bg-card rounded-lg border p-5">
              <h3 className="mb-2 flex items-center gap-2 font-semibold">
                Vercel AI SDK
              </h3>
              <p className="text-muted-foreground text-sm">
                Unified interface to query OpenAI, Claude, Gemini, and
                Perplexity with streaming support
              </p>
            </div>
            <div className="bg-card rounded-lg border p-5">
              <h3 className="mb-2 flex items-center gap-2 font-semibold">
                Playwright
              </h3>
              <p className="text-muted-foreground text-sm">
                Headless browser automation for authentic web UI crawling with
                stealth mode
              </p>
            </div>
            <div className="bg-card rounded-lg border p-5">
              <h3 className="mb-2 flex items-center gap-2 font-semibold">
                PostgreSQL + Redis
              </h3>
              <p className="text-muted-foreground text-sm">
                Reliable data storage with Upstash Redis for rate limiting and
                caching
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative flex h-100 flex-col items-center justify-center gap-8 overflow-hidden">
          <BackdropGrid rows={7} columns={15} length={200} />
          <section className="z-10 flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold">
              Ready to See How AI Sees Your Brand?
            </h2>
            <p className="text-muted-foreground mt-2 text-lg">
              Get comprehensive visibility analytics in minutes
            </p>
          </section>
          <div className="z-10 flex gap-3">
            <Button size="lg" asChild>
              <Link href="/dashboard">Start Free Analysis</Link>
            </Button>
          </div>
        </section>
      </div>
    </Container>
  );
};

export default HowItWorks;
