import React from "react";
import Link from "next/link";
import { BackdropGrid, Container } from "~/components/common";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

const Ideology: React.FC = () => {
  return (
    <Container>
      <div className="flex min-h-screen w-full flex-col pt-15">
        <section className="p-8">
          <h1 className="font-clashDisplay mt-5 text-5xl leading-tight font-medium">
            The Search Paradigm Has Shifted
          </h1>
          <p className="mt-1 text-lg">
            People aren&apos;t clicking blue links anymore. They&apos;re asking
            AI agents and those agents are deciding which brands exist.
          </p>

          <section className="mt-7 flex gap-3">
            <Button size="lg" asChild>
              <Link href="/dashboard">Try GenSEO now</Link>
            </Button>
            <Button size="lg" variant="link">
              See how it works?
            </Button>
          </section>
        </section>

        <Separator />

        <section className="border-b p-8">
          <h1 className="text-xl leading-tight font-semibold">
            How We Got Here
          </h1>
          <section className="text-muted-foreground mt-2 text-lg">
            <p>
              <Link
                href="https://writesonic.com"
                target="_blank"
                className="underline underline-offset-3"
              >
                WriteSonic
              </Link>{" "}
              announced their{" "}
              <Link
                href="https://writesonic.notion.site/The-AI-Visibility-Tracker-Engineering-Challenge-2d70db7b839280db9839ee30efaf306e"
                target="_blank"
                className="underline underline-offset-3"
              >
                AI Visibility Tracker challenge
              </Link>{" "}
              in January 2025, and I really liked the idea. So here we are
              today.
            </p>
          </section>
        </section>

        <section className="border-b p-8">
          <h1 className="text-xl leading-tight font-semibold">
            The New Reality of Discovery
          </h1>

          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div className="bg-card rounded-lg p-5">
              <h3 className="text-lg font-semibold">Traditional Search</h3>
              <ul className="text-muted-foreground mt-2 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">→</span>
                  User types 2-3 keywords
                </li>
                <li className="flex items-start">
                  <span className="mr-2">→</span>
                  Clicks through 10 blue links
                </li>
                <li className="flex items-start">
                  <span className="mr-2">→</span>
                  Visits multiple websites
                </li>
                <li className="flex items-start">
                  <span className="mr-2">→</span>
                  Brands get traffic & attribution
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-lg p-5">
              <h3 className="text-lg font-semibold">AI Search (2026)</h3>
              <ul className="text-muted-foreground mt-2 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">→</span>
                  User asks natural question
                </li>
                <li className="flex items-start">
                  <span className="mr-2">→</span>
                  AI synthesizes answer instantly
                </li>
                <li className="flex items-start">
                  <span className="mr-2">→</span>
                  Mentions 2-3 brands directly
                </li>
                <li className="flex items-start">
                  <span className="mr-2">→</span>
                  No clicks, no attribution
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="border-b p-8">
          <h1 className="text-xl leading-tight font-semibold">
            Understanding AI Visibility
          </h1>

          <div className="mt-5 space-y-6">
            <div className="bg-card rounded-lg p-5">
              <h3 className="text-lg font-semibold">AI Visibility Score</h3>
              <p className="text-muted-foreground mt-2">
                The percentage of relevant prompts where your brand gets
                mentioned.
              </p>
              <div className="bg-muted mt-4 rounded p-4 font-mono text-sm">
                (Mentions / Total Prompts) × 100
              </div>
              <p className="text-muted-foreground mt-3 text-sm">
                If 23 out of 100 queries mention you:{" "}
                <span className="text-foreground font-semibold">
                  23% visibility
                </span>
              </p>
            </div>

            <div className="bg-card rounded-lg p-5">
              <h3 className="text-lg font-semibold">Citation Share</h3>
              <p className="text-muted-foreground mt-2">
                Your percentage of total citations in your category.
              </p>
              <div className="bg-muted mt-4 rounded p-4 font-mono text-sm">
                (Your Citations / Total Category Citations) × 100
              </div>
              <p className="text-muted-foreground mt-3 text-sm">
                68 citations out of 450 total:{" "}
                <span className="text-foreground font-semibold">
                  15.1% citation share
                </span>
              </p>
            </div>

            <div className="bg-card rounded-lg p-5">
              <h3 className="text-lg font-semibold">
                Position & Context Matters
              </h3>
              <p className="text-muted-foreground mt-2">
                Not all mentions are equal. Being mentioned first, being the
                only brand mentioned, or appearing in positive context
                dramatically affects perception.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm">
                  <span className="mr-3 rounded bg-green-100 px-2 py-1 font-semibold text-green-800 dark:bg-green-900 dark:text-green-100">
                    Best
                  </span>
                  <span className="text-muted-foreground">
                    Mentioned first in response
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="mr-3 rounded bg-blue-100 px-2 py-1 font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    Good
                  </span>
                  <span className="text-muted-foreground">
                    Only brand mentioned
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="mr-3 rounded bg-yellow-100 px-2 py-1 font-semibold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                    Fair
                  </span>
                  <span className="text-muted-foreground">
                    Mentioned with competitors
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b p-8">
          <h1 className="text-xl leading-tight font-semibold">
            Why This Matters in 2026
          </h1>
          <div className="mt-5 grid gap-6 md:grid-cols-3">
            <div className="bg-card p-5">
              <h3 className="text-lg font-semibold">AI-First Discovery</h3>
              <p className="text-muted-foreground mt-2">
                70%+ of product research now starts with AI agents, not search
                engines
              </p>
            </div>

            <div className="bg-card p-5">
              <h3 className="text-lg font-semibold">Zero-Click Future</h3>
              <p className="text-muted-foreground mt-2">
                Users get answers directly no website visits, no traditional
                attribution
              </p>
            </div>

            <div className="bg-card p-5">
              <h3 className="text-lg font-semibold">Invisible Competition</h3>
              <p className="text-muted-foreground mt-2">
                Competitors steal mindshare without you knowing until you
                measure it
              </p>
            </div>
          </div>
        </section>

        <section className="border-b p-8">
          <h1 className="text-xl leading-tight font-semibold">
            Who Needs This
          </h1>
          <div className="mt-5 space-y-4">
            <div className="bg-card rounded-lg border p-5">
              <h3 className="font-semibold">SaaS Companies</h3>
              <p className="text-muted-foreground mt-2">
                Are you visible when prospects ask AI &#x22;What&apos;s the best
                [your category]?&#x22;If not, you&apos;re losing deals before
                they reach your website.
              </p>
            </div>

            <div className="bg-card rounded-lg border p-5">
              <h3 className="font-semibold">Marketing Teams</h3>
              <p className="text-muted-foreground mt-2">
                Traditional SEO metrics (rankings, backlinks) no longer predict
                brand discovery. You need new KPIs for the AI era.
              </p>
            </div>

            <div className="bg-card rounded-lg border p-5">
              <h3 className="font-semibold">Product Managers</h3>
              <p className="text-muted-foreground mt-2">
                Understand how AI agents perceive your product positioning. Are
                you mentioned for the right use cases? Against the right
                competitors?
              </p>
            </div>

            <div className="bg-card rounded-lg border p-5">
              <h3 className="font-semibold">Founders</h3>
              <p className="text-muted-foreground mt-2">
                Monitor AI perception as a leading indicator. Dropping
                visibility = weakening brand authority before it shows in
                revenue.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b p-8">
          <h1 className="text-xl leading-tight font-semibold">
            What GenSEO Does
          </h1>
          <div className="bg-primary/5 border-primary/20 mt-5 rounded-lg border-2 p-6">
            <p className="text-muted-foreground mb-6 text-lg">
              GenSEO tracks your brand&apos;s visibility across AI agents
              (ChatGPT, Claude, Gemini, Perplexity) and shows you exactly where
              you stand against competitors.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start">
                <svg
                  className="text-primary mt-1 mr-3 h-6 w-6 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div>
                  <h4 className="font-semibold">
                    Real AI Queries and Crawling
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Track mentions across actual AI responses
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <svg
                  className="text-primary mt-1 mr-3 h-6 w-6 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div>
                  <h4 className="font-semibold">Competitive Analysis</h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    See exactly how you compare to rivals
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <svg
                  className="text-primary mt-1 mr-3 h-6 w-6 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div>
                  <h4 className="font-semibold">Citation Intelligence</h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Discover which pages drive mentions
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <svg
                  className="text-primary mt-1 mr-3 h-6 w-6 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div>
                  <h4 className="font-semibold">Context Analysis</h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Understand sentiment and positioning
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b p-8">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950">
            <div className="flex items-start">
              <svg
                className="mt-1 mr-3 h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-amber-900 dark:text-amber-100">
                  Built During WriteSonic&apos;s AI Visibility Challenge
                </h3>
                <p className="text-amber-800 dark:text-amber-200">
                  This project was developed as part of WriteSonic&apos;s
                  engineering challenge in January 2025. The challenge asked:
                  &#x22;When someone asks ChatGPT for product recommendations,
                  which brands get mentioned?&#x22; We built GenSEO to answer
                  that question not just for ourselves, but for every brand
                  navigating the AI-first world.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex h-100 flex-col items-center justify-center gap-8 overflow-hidden">
          <BackdropGrid rows={7} columns={15} length={200} />
          <section className="z-10 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold">
              The Question Isn&apos;t &#x22;Are You Ranking?&#x22;
            </h2>
            <p className="text-muted-foreground text-lg">
              It&apos;s &#x22;Are you being mentioned?&#x22; And if not,
              you&apos;re invisible.
            </p>
          </section>
          <Button size="lg" asChild className="z-10">
            <Link href="/dashboard">Start Tracking Your Visibility</Link>
          </Button>
        </section>
      </div>
    </Container>
  );
};

export default Ideology;
