import type { Metadata } from "next";
import "./css/globals.css";
import "./css/navbar.css";
import "./css/bg.css";
import Nav from 'nav';
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "VISIONARA",
  description: "Visionara, turn your visions into a reality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
      <html lang="en">
        <body className="overflow-x-hidden">
          {children}
          <Nav/>
          <Analytics/>
        </body>
      </html>
  );
}
