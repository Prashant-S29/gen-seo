import React from "react";
import { headers } from "next/headers";
// libs
import { checkAuthServer } from "~/lib/auth";
// components
import { HistoryPage } from "./HistoryPage";

const Page: React.FC = async () => {
  await checkAuthServer({
    headers: await headers(),
    redirectTo: "/login",
  });

  return <HistoryPage />;
};

export default Page;
