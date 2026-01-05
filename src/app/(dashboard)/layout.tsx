import { DashboardLayoutLheader } from "~/components/layout";
import "~/styles/globals.css";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <DashboardLayoutLheader />
      {children}
    </>
  );
}
