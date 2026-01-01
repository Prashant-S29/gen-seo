import React from "react";
import { redirect } from "next/navigation";
import { NewPasswordForm } from "~/components/auth";

interface NewPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

const NewPasswordPage: React.FC<NewPasswordPageProps> = async ({
  searchParams,
}) => {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    redirect("/reset-password");
  }

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-2">
      <NewPasswordForm token={token} />
    </main>
  );
};

export default NewPasswordPage;
