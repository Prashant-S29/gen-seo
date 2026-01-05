import React from "react";
import Link from "next/link";
import { BackdropGrid, Container } from "~/components/common";
import { Button } from "~/components/ui/button";

const WelcomePage: React.FC = () => {
  return (
    <Container>
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
        <BackdropGrid rows={15} columns={14} length={350} />

        <section className="relative z-10 flex flex-col items-center">
          <h1 className="font-clashDisplay mt-5 text-4xl leading-tight font-medium">
            Welcome to GenSEO
          </h1>
          <p className="text-muted-foreground mt-1 max-w-xl text-center text-lg leading-snug">
            A dual-engine analysis system that combines API intelligence with
            real-world web crawling for unparalleled accuracy.
          </p>

          <Button size="lg" asChild className="mt-8">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </section>
      </div>
    </Container>
  );
};

export default WelcomePage;
