import React from "react";
import { headers } from "next/headers";

// libs
import { checkAuthServer } from "~/lib/auth";

// components
import { SearchPage } from "./SearchPage";

const Page: React.FC = async () => {
  await checkAuthServer({
    headers: await headers(),
    redirectTo: "/login",
  });

  return <SearchPage />;
};

export default Page;
