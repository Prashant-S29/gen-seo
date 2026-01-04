import Link from "next/link";
import React from "react";
import { ThemeToggler } from "~/components/common";
import { Badge } from "~/components/ui/badge";

export const AuthLayoutHeader: React.FC = () => {
  return (
    <div className="fixed top-0 z-20 flex w-full justify-center">
      <div className="flex w-full max-w-5xl items-center justify-between px-8 py-6">
        <h1 className="flex items-center gap-3">
          <Link href="/">GenSEO</Link>
          <Badge variant="outline">Beta Version</Badge>
        </h1>

        <section className="flex gap-2">
          <ThemeToggler />
        </section>
      </div>
    </div>
  );
};
