import React from "react";
import Link from "next/link";

const WelcomePage: React.FC = () => {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-2">
      <p>Welcome gen-seo</p>

      <Link href="/dashboard" className="underline underline-offset-2">
        Go to Dashboard
      </Link>
    </main>
  );
};

export default WelcomePage;
