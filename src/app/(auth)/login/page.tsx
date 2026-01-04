import React from "react";
import { LoginForm } from "~/components/auth";
import { BackdropGrid, Container } from "~/components/common";

const Login: React.FC = () => {
  return (
    <Container>
      <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden px-8 py-15">
        <LoginForm />
        <BackdropGrid columns={12} rows={14} length={180} />
      </div>
    </Container>
  );
};

export default Login;
