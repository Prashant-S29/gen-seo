// Local Fonts
import localFont from "next/font/local";

// Google Fonts
import { Montserrat, Taviraj } from "next/font/google";

export const montserrat = Montserrat({ subsets: ["latin"] });
export const taviraj = Taviraj({
  weight: "400",
  subsets: ["latin"],
  style: "italic",
});

export const satoshi = localFont({
  src: [
    {
      path: "./satoshi/regular.otf",
      weight: "400",
    },
  ],
});

export const clashDisplay = localFont({
  src: [
    {
      path: "./clashDisplay/regular.woff2",
      weight: "400",
    },
    {
      path: "./clashDisplay/medium.otf",
      weight: "500",
    },
    {
      path: "./clashDisplay/semibold.woff2",
      weight: "600",
    },
    {
      path: "./clashDisplay/bold.woff2",
      weight: "700",
    },
  ],
  variable: "--clashDisplay",
});
