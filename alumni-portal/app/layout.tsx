import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "JEME Alumni Platform",
  description: "Alumni directory and insights platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#E6E6E6]">
      <body className={`${rubik.variable} font-sans antialiased bg-[#E6E6E6]`}>
        {children}
      </body>
    </html>
  );
}