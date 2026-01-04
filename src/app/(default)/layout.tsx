import "~/styles/globals.css";

// components
import { Header } from "~/components/layout";

export default function DefaultLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
