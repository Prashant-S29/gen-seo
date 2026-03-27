"use client";

import { ThemeProvider } from "next-themes";
import { useMount, useIsMobile } from "~/hooks";
import { Toaster } from "sonner";
import { TRPCReactProvider } from "~/trpc/react";

export const Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isMounted = useMount();
  const isMobile = useIsMobile();

  if (!isMounted) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-5">
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="font-flagfies mt-2 text-2xl md:text-4xl">
            Welcome to GenSEO
          </p>
        </div>
        <p className="text-muted-foreground bg-card mt-5 rounded-full border px-4 py-2 text-center text-sm">
          Use a desktop device for better experience.
        </p>
      </div>
    );
  }

  return (
    <TRPCReactProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
      >
        <Toaster />
        {children}
      </ThemeProvider>
    </TRPCReactProvider>
  );
};
