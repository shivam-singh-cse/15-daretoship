import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Builder Journey",
  description: "A 15-day beginner roadmap for building and launching AI micro-products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
