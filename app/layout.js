import "./globals.css";
import { Poppins, Caveat } from "next/font/google";

const poppins = Poppins({
      subsets: ["latin"],
      weight: ["400", "500", "600", "700", "800"],
      variable: "--font-poppins",
});

const caveat = Caveat({
      subsets: ["latin"],
      weight: ["600", "700"],
      variable: "--font-signature",
});

export const metadata = {
      title: "Game Night",
      description: "Live party games for game night",
};

export default function RootLayout({ children }) {
      return (
              <html lang="en" className={`${poppins.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
