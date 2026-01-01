import React from "react";
import { SignupForm } from "~/components/auth";

const Signup: React.FC = () => {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-2">
      <SignupForm />
    </main>
  );
};

export default Signup;
