import React from "react";
import { LoginForm } from "~/components/auth";

const Login: React.FC = () => {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-2">
      <LoginForm />
    </main>
  );
};

export default Login;
