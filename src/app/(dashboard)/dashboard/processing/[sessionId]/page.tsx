import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
// libs
import { checkAuthServer } from "~/lib/auth";
// components
import { ProcessingPage } from "./ProcessingPage";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

const Page: React.FC<PageProps> = async ({ params }) => {
  await checkAuthServer({
    headers: await headers(),
    redirectTo: "/login",
  });

  const { sessionId } = await params;

  if (!sessionId) {
    redirect("/search");
  }

  return <ProcessingPage sessionId={sessionId} />;
};

export default Page;
