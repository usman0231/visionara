import type { Metadata } from "next";
import "./css/globals.css";
import "./css/navbar.css";
import "./css/bg.css";
import Nav from "nav";
import { Analytics } from "@vercel/analytics/next";
import Loader from "../components/loader";

// Static metadata - database SEO can be managed via backoffice
// and will be applied on runtime pages
export const metadata: Metadata = {
  metadataBase: new URL("https://www.visionara.ca"),
  title: "VISIONARA | Turn Your Visions Into Reality",
  description: "Transform your business ideas into reality with VISIONARA. Expert web development, mobile apps, AI solutions, and digital transformation services in Canada.",
  keywords: ["web development", "mobile app development", "AI solutions", "digital transformation", "software development", "custom software"],
  openGraph: {
    title: "VISIONARA | Your Vision, Our Technology",
    description: "Turn your visions into reality with our innovative solutions. Expert web development, mobile apps, and AI-powered business solutions.",
    url: "https://www.visionara.ca",
    siteName: "VISIONARA",
    images: [
      {
        url: "https://www.visionara.ca/images/medium_res_logo.webp",
        width: 1200,
        height: 630,
        alt: "VISIONARA - Your Vision, Our Technology",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VISIONARA | Your Vision, Our Technology",
    description: "Turn your visions into reality with our innovative solutions.",
    images: ["https://www.visionara.ca/images/medium_res_logo.webp"],
  },
};

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
