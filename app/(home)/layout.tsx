import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata("home");
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
