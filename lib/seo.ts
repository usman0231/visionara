import { Metadata } from "next";
import SEO from "@/lib/db/models/seo";

interface SEOData {
  page: string;
  title: string;
  description: string;
  keywords?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  ogImageAlt?: string | null;
  twitterCard?: string;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
  canonicalUrl?: string | null;
  robots?: string;
  structuredData?: any;
  isActive: boolean;
}

/**
 * Fetches SEO data directly from the database
 * Works during build time and runtime
 * Falls back to global SEO if page-specific data is not found
 */
export async function getSEOData(page: string = "global"): Promise<SEOData | null> {
  try {
    // Fetch directly from database (works during build and runtime)
    const seoRecord = await SEO.findOne({
      where: {
        page,
        isActive: true,
      },
    });

    if (!seoRecord) {
      // Fallback to global SEO if page-specific not found
      if (page !== "global") {
        return getSEOData("global");
      }
      return null;
    }

    return seoRecord.toJSON() as SEOData;
  } catch (error) {
    console.error(`Error fetching SEO data for page: ${page}`, error);
    return null;
  }
}

/**
 * Generates Next.js metadata from SEO data
 * Includes all SEO fields: title, description, Open Graph, Twitter Card, etc.
 */
export async function generateSEOMetadata(page: string = "global"): Promise<Metadata> {
  const seoData = await getSEOData(page);

  if (!seoData) {
    // Fallback metadata if no SEO data found
    return {
      title: "VISIONARA",
      description: "Turn your visions into reality with our innovative solutions.",
    };
  }

  const metadata: Metadata = {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords?.split(",").map((k) => k.trim()),
  };

  // Add robots meta tag
  if (seoData.robots) {
    metadata.robots = seoData.robots;
  }

  // Add canonical URL
  if (seoData.canonicalUrl) {
    metadata.alternates = {
      canonical: seoData.canonicalUrl,
    };
  }

  // Open Graph metadata
  if (seoData.ogTitle || seoData.ogDescription || seoData.ogImage) {
    metadata.openGraph = {
      title: seoData.ogTitle || seoData.title,
      description: seoData.ogDescription || seoData.description,
      url: seoData.canonicalUrl || undefined,
      siteName: "VISIONARA",
      locale: "en_US",
      type: "website",
    };

    if (seoData.ogImage) {
      metadata.openGraph.images = [
        {
          url: seoData.ogImage,
          alt: seoData.ogImageAlt || seoData.title,
          width: 1200,
          height: 630,
        },
      ];
    }
  }

  // Twitter Card metadata
  if (seoData.twitterTitle || seoData.twitterDescription || seoData.twitterImage) {
    metadata.twitter = {
      card: (seoData.twitterCard as any) || "summary_large_image",
      title: seoData.twitterTitle || seoData.title,
      description: seoData.twitterDescription || seoData.description,
    };

    if (seoData.twitterImage) {
      metadata.twitter.images = [seoData.twitterImage];
    }
  }

  return metadata;
}

/**
 * Generates a script tag for JSON-LD structured data
 * Use this in your page/layout to add structured data
 */
export async function generateStructuredData(page: string = "global"): Promise<string | null> {
  const seoData = await getSEOData(page);

  if (!seoData || !seoData.structuredData) {
    return null;
  }

  return JSON.stringify(seoData.structuredData);
}

/**
 * Merges global SEO with page-specific SEO
 * Page-specific values override global values
 */
export async function getMergedSEOData(page: string): Promise<SEOData | null> {
  const [globalSEO, pageSEO] = await Promise.all([
    getSEOData("global"),
    page !== "global" ? getSEOData(page) : null,
  ]);

  if (!globalSEO && !pageSEO) {
    return null;
  }

  // Merge global with page-specific (page-specific takes precedence)
  return {
    ...(globalSEO || {}),
    ...(pageSEO || {}),
  } as SEOData;
}
