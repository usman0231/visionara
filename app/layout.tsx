import type { Metadata } from "next";
import "./css/globals.css";
import "./css/navbar.css";
import "./css/bg.css";
import Nav from "nav";
import { Analytics } from "@vercel/analytics/next";
import Loader from "../components/loader";
import { generateSEOMetadata } from "@/lib/seo";

// Dynamic metadata from database SEO settings
export async function generateMetadata(): Promise<Metadata> {
  const seoMetadata = await generateSEOMetadata("global");
  return {
    metadataBase: new URL("https://www.visionara.ca"),
    ...seoMetadata,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden">
        <Loader />
        {children}
        <Nav />
        <Analytics />
      </body>
    </html>
  );
}
