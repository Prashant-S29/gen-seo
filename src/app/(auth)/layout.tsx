import "~/styles/globals.css";

export default function DefaultLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
