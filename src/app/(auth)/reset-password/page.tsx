import React from "react";
import { PasswordResetForm } from "~/components/auth";

const ResetPassword: React.FC = () => {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-2">
      <PasswordResetForm />
    </main>
  );
};

export default ResetPassword;
