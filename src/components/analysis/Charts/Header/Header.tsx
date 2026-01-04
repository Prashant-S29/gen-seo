"use client";

import React from "react";
import Link from "next/link";

// import { navLinks } from "./data";
import { Button } from "~/components/ui/button";
// import { authClient } from "~/lib/auth-client";
import { Skeleton } from "~/components/ui/skeleton";

import { authClient } from "~/server/better-auth/client";
import { ThemeToggler } from "~/components/common";
import { Badge } from "~/components/ui/badge";

const navLinks = [
  {
    label: "Home",
    href: "",
  },
  {
    label: "Ideology",
    href: "",
  },
  {
    label: "How it works?",
    href: "",
  },
];

export const Header: React.FC = () => {
  const { data, isRefetching, isPending } = authClient.useSession();

  return (
    <div className="fixed top-0 z-10 flex w-full justify-center">
      <div className="relative flex w-full max-w-5xl items-center justify-between px-8 py-6">
        <h1>
          <Link href="/">GenSEO</Link>
          <Badge variant="outline">Beta Version</Badge>
        </h1>

        <nav className="absolute left-1/2 flex -translate-x-1/2 gap-5">
          {navLinks.map((navLink, index) => (
            <Button key={index} asChild size="sm" variant="ghost">
              <Link href={navLink.href}>{navLink.label}</Link>
            </Button>
          ))}
        </nav>
        <section className="flex gap-2">
          {isRefetching || isPending ? (
            <Skeleton className="h-8 w-8" />
          ) : (
            <>
              {data?.session.id ? (
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <Button asChild size="sm" variant="outline">
                  <Link href="/login">Login</Link>
                </Button>
              )}
            </>
          )}
          <ThemeToggler />
        </section>
      </div>
    </div>
  );
};
