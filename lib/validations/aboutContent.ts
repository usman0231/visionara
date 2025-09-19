import { z } from "zod";

export const AboutSectionEnum = z.enum([
  "hero",
  "story",
  "values",
  "services",
  "tech",
  "testimonials",
  "stats",
  "cta",
]);

// Base schema for all about content
export const aboutContentBaseSchema = z.object({
  section: AboutSectionEnum,
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  subtitle: z
    .string()
    .max(255, "Subtitle must be less than 255 characters")
    .optional()
    .nullable(),
  sortOrder: z
    .number()
    .int()
    .min(0, "Sort order must be non-negative")
    .optional(),
  active: z.boolean().default(true),
});

// Content schemas for different sections
export const heroContentSchema = z.object({
  description: z.string().min(1, "Description is required"),
  buttons: z
    .array(
      z.object({
        text: z.string().min(1, "Button text is required"),
        href: z.string().min(1, "Button href is required"),
        primary: z.boolean().default(false),
      })
    )
    .optional()
    .default([]),
  image: z
    .object({
      src: z.string().min(1, "Image source is required"),
      alt: z.string().min(1, "Image alt text is required"),
    })
    .optional(),
});

export const storyContentSchema = z.object({
  text: z.string().min(1, "Story text is required"),
});

export const valuesContentSchema = z.object({
  items: z
    .array(
      z.object({
        title: z.string().min(1, "Value title is required"),
        description: z.string().min(1, "Value description is required"),
      })
    )
    .min(1, "At least one value is required"),
});

export const servicesContentSchema = z.object({
  layout: z.enum(["grid", "list", "feature"]).optional(),
  columns: z
    .number()
    .int()
    .min(1, "Columns must be at least 1")
    .max(4, "Columns cannot exceed 4")
    .optional(),
  accentColor: z.string().optional(),
  background: z.string().optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1, "Service title is required"),
        tagline: z.string().optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
        accentColor: z.string().optional(),
        items: z
          .array(z.string().min(1, "Service detail is required"))
          .min(1, "At least one service detail is required"),
        cta: z
          .object({
            text: z.string().min(1, "CTA text is required"),
            href: z.string().min(1, "CTA href is required"),
          })
          .optional(),
      })
    )
    .min(1, "At least one service is required"),
});

export const techContentSchema = z.object({
  technologies: z
    .array(z.string().min(1, "Technology name is required"))
    .min(1, "At least one technology is required"),
});

export const testimonialsContentSchema = z.object({
  testimonials: z
    .array(
      z.object({
        quote: z.string().min(1, "Quote is required"),
        attribution: z.string().min(1, "Attribution is required"),
      })
    )
    .min(1, "At least one testimonial is required"),
});

export const statsContentSchema = z.object({
  stats: z
    .array(
      z.object({
        id: z.number().int().min(1, "Stat ID is required"),
        value: z.number().int().min(0, "Stat value must be non-negative"),
        prefix: z.string().optional(),
        suffix: z.string().optional(),
        label: z.string().min(1, "Stat label is required"),
      })
    )
    .min(1, "At least one stat is required"),
});

export const ctaContentSchema = z.object({
  description: z.string().min(1, "Description is required"),
  button: z.object({
    text: z.string().min(1, "Button text is required"),
    href: z.string().min(1, "Button href is required"),
  }),
});

// Main content validation based on section type
export const aboutContentContentSchema = z.discriminatedUnion("section", [
  z.object({ section: z.literal("hero"), content: heroContentSchema }),
  z.object({ section: z.literal("story"), content: storyContentSchema }),
  z.object({ section: z.literal("values"), content: valuesContentSchema }),
  z.object({ section: z.literal("services"), content: servicesContentSchema }),
  z.object({ section: z.literal("tech"), content: techContentSchema }),
  z.object({
    section: z.literal("testimonials"),
    content: testimonialsContentSchema,
  }),
  z.object({ section: z.literal("stats"), content: statsContentSchema }),
  z.object({ section: z.literal("cta"), content: ctaContentSchema }),
]);

// Create schema (combines base with content validation)
export const createAboutContentSchema = aboutContentBaseSchema.extend({
  content: z.record(z.any()), // We'll validate this separately based on section
});

// Update schema (all fields optional except content validation)
export const updateAboutContentSchema = z.object({
  section: AboutSectionEnum.optional(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters")
    .optional(),
  subtitle: z
    .string()
    .max(255, "Subtitle must be less than 255 characters")
    .optional()
    .nullable(),
  sortOrder: z
    .number()
    .int()
    .min(0, "Sort order must be non-negative")
    .optional(),
  active: z.boolean().optional(),
  content: z.record(z.any()).optional(),
});

// Helper function to validate content based on section
export function validateContentBySection(section: string, content: unknown) {
  switch (section) {
    case "hero":
      return heroContentSchema.parse(content);
    case "story":
      return storyContentSchema.parse(content);
    case "values":
      return valuesContentSchema.parse(content);
    case "services":
      return servicesContentSchema.parse(content);
    case "tech":
      return techContentSchema.parse(content);
    case "testimonials":
      return testimonialsContentSchema.parse(content);
    case "stats":
      return statsContentSchema.parse(content);
    case "cta":
      return ctaContentSchema.parse(content);
    default:
      throw new Error(`Unknown section: ${section}`);
  }
}



