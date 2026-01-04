import "~/styles/globals.css";

import { Provider } from "~/components/wrapper";
import { clashDisplay, satoshi } from "~/fonts";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${satoshi.className} ${clashDisplay.variable}`}>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
