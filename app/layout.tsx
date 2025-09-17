import type { Metadata } from "next";
import "./css/globals.css";
import "./css/navbar.css";
import "./css/bg.css";
import Nav from 'nav';
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "VISIONARA",
  description: "Visionara, turn your visions into a reality.",
  icons: {
    icon: "/images/fav.png", // Your favicon
  },
  openGraph: {
    title: "VISIONARA",
    description: "Turn your visions into reality with our innovative solutions.",
    url: "https://www.visionara.ca", // Your site URL
    siteName: "VISIONARA",
    images: [
      {
        url: "/images/just_logo.png", // Public folder image
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
    title: "VISIONARA",
    description: "Turn your visions into reality with our innovative solutions.",
    images: ["/images/just_logo.png"], // Same image for Twitter preview
  },
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
