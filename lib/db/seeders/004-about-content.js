"use strict";

const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Extract content from existing about page
    const aboutContentData = [
      {
        id: uuidv4(),
        section: "hero",
        title: "We turn bold ideas into beautiful, scalable products.",
        subtitle: "About Visionara",
        content: JSON.stringify({
          description:
            "Visionara is a studio of builders, designers, and strategists crafting high-impact digital experiences. From concept to launch, we deliver modern web apps, mobile apps, striking graphics, and growth-driven marketing.",
          buttons: [
            {
              text: "Start a project",
              href: "/contact",
              primary: true,
            },
            {
              text: "Our capabilities",
              href: "#services",
              primary: false,
            },
          ],
          image: {
            src: "/images/final_transparent.png",
            alt: "Visionara logo",
          },
        }),
        sortOrder: 1,
        active: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: uuidv4(),
        section: "stats",
        title: "Our Impact",
        subtitle: null,
        content: JSON.stringify({
          stats: [
            {
              id: 1,
              value: 20,
              suffix: "+",
              label: "projects shipped",
            },
            {
              id: 2,
              value: 97,
              suffix: "%",
              label: "client satisfaction",
            },
            {
              id: 3,
              value: 6,
              prefix: "2–",
              suffix: " wks",
              label: "typical MVP timeline",
            },
          ],
        }),
        sortOrder: 2,
        active: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: uuidv4(),
        section: "story",
        title: "Our story",
        subtitle: null,
        content: JSON.stringify({
          text: "We started Visionara to give founders and product teams a partner who sweats the details. Today we're a cross-disciplinary crew shipping software and brands for fintech, SaaS, and consumer products—always balancing speed, craft, and measurable impact.",
        }),
        sortOrder: 3,
        active: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: uuidv4(),
        section: "values",
        title: "What we value",
        subtitle: null,
        content: JSON.stringify({
          items: [
            {
              title: "Clarity",
              description: "Simple interfaces. Clear roadmaps. No jargon.",
            },
            {
              title: "Craft",
              description: "From pixels to pipelines, we obsess over quality.",
            },
            {
              title: "Speed",
              description: "Short cycles, steady momentum, real outcomes.",
            },
            {
              title: "Ownership",
              description:
                "We act like product owners—proactive and accountable.",
            },
          ],
        }),
        sortOrder: 4,
        active: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: uuidv4(),
        section: "services",
        title: "What we do",
        subtitle: null,
        content: JSON.stringify({
          items: [
            {
              title: "Web App Development",
              items: [
                "Next.js / React / Node",
                "Design systems & a11y",
                "Testing, CI/CD, cloud",
              ],
            },
            {
              title: "Mobile App Development",
              items: [
                "React Native / Flutter",
                "Offline-first & push",
                "App Store / Play deploys",
              ],
            },
            {
              title: "Graphic Designing",
              items: [
                "Logos, UI kits, decks",
                "Illustration & motion",
                "Print & packaging",
              ],
            },
            {
              title: "Marketing",
              items: [
                "Positioning & messaging",
                "Landing pages & CRO",
                "Paid, SEO, analytics",
              ],
            },
          ],
        }),
        sortOrder: 5,
        active: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: uuidv4(),
        section: "tech",
        title: "Tech we love",
        subtitle: null,
        content: JSON.stringify({
          technologies: [
            "Next.js",
            "React",
            "TypeScript",
            "Node.js",
            "Prisma",
            "PostgreSQL",
            "Firebase",
            "AWS",
            "Vercel",
            "Flutter",
            "React Native",
            "Figma",
          ],
        }),
        sortOrder: 7,
        active: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: uuidv4(),
        section: "testimonials",
        title: "What clients say",
        subtitle: null,
        content: JSON.stringify({
          testimonials: [
            {
              quote:
                "Visionara delivered a polished MVP in five weeks and nailed our brand.",
              attribution: "— Product Lead, Fintech",
            },
            {
              quote:
                "The team is proactive, communicative, and deeply technical. True partners.",
              attribution: "— CTO, SaaS Startup",
            },
            {
              quote:
                "Our conversion rate doubled after their redesign and CRO experiments.",
              attribution: "— Growth Manager, DTC",
            },
          ],
        }),
        sortOrder: 8,
        active: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: uuidv4(),
        section: "cta",
        title: "Let's build what's next.",
        subtitle: null,
        content: JSON.stringify({
          description:
            "Tell us where you're headed—we'll help you get there faster.",
          button: {
            text: "Book a discovery call",
            href: "/contact",
          },
        }),
        sortOrder: 9,
        active: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ];

    await queryInterface.bulkInsert("about_content", aboutContentData, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("about_content", null, {});
  },
};
