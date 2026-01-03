import React from "react";
import Link from "next/link";

const Home: React.FC = () => {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-2">
      <p>gen-seo</p>

      <Link href="/dashboard" className="underline underline-offset-2">
        Go to Dashboard
      </Link>
    </main>
  );
};

export default Home;
