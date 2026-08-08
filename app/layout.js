import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    variable: "--font-poppins",
});

export const metadata = {
    title: "Game Night",
    description: "Live party games for game night",
};

export default function RootLayout({ children }) {
    return (
          <html lang="en" className={poppins.variable}>
      <body>{children}</body>
      </html>
    );
}
