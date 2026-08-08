import "./globals.css";

export const metadata = {
  title: "Game Night",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
    <body>{children}</body>
    </html>
  );
}
