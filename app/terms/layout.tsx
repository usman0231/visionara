import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata("terms");
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
