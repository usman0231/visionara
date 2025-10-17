import type { Metadata } from "next";
import "./css/globals.css";
import "./css/navbar.css";
import "./css/bg.css";
import Nav from "nav";
import { Analytics } from "@vercel/analytics/next";
import Loader from "../components/loader";
import { generateSEOMetadata, generateStructuredData } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await generateSEOMetadata("global");

  return {
    metadataBase: new URL("https://www.visionara.ca"),
    ...metadata,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = await generateStructuredData("global");

  return (
    <html lang="en">
      <head>
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: structuredData }}
          />
        )}
      </head>
      <body className="overflow-x-hidden">
        <Loader />
        {children}
        <Nav />
        <Analytics />
      </body>
    </html>
  );
}
