'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('seos', [
      {
        page: 'global',
        title: 'VISIONARA | Turn Your Visions Into Reality',
        description: 'Transform your business ideas into reality with VISIONARA. Expert web development, mobile apps, AI solutions, and digital transformation services in Canada.',
        keywords: 'web development, mobile app development, AI solutions, digital transformation, software development, custom software, Canada tech company, business solutions, innovative technology',
        ogTitle: 'VISIONARA | Your Vision, Our Technology',
        ogDescription: 'Turn your visions into reality with our innovative solutions. Expert web development, mobile apps, and AI-powered business solutions.',
        ogImage: 'https://www.visionara.ca/images/medium_res_logo.webp',
        ogImageAlt: 'VISIONARA - Your Vision, Our Technology',
        twitterCard: 'summary_large_image',
        twitterTitle: 'VISIONARA | Your Vision, Our Technology',
        twitterDescription: 'Turn your visions into reality with our innovative solutions. Expert web development, mobile apps, and AI-powered business solutions.',
        twitterImage: 'https://www.visionara.ca/images/medium_res_logo.webp',
        canonicalUrl: 'https://www.visionara.ca',
        robots: 'index, follow',
        structuredData: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "VISIONARA",
          "url": "https://www.visionara.ca",
          "logo": "https://www.visionara.ca/images/medium_res_logo.webp",
          "description": "Transform your business ideas into reality with expert web development, mobile apps, and AI solutions.",
          "sameAs": [],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "email": "info@visionara.ca"
          }
        }),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        page: 'home',
        title: 'VISIONARA | Innovative Web & App Development Solutions',
        description: 'Leading tech partner for businesses. Custom web development, mobile apps, AI integration. Transform your ideas into powerful digital products.',
        keywords: 'web development services, app development, custom software, AI integration, digital solutions, business technology, startup technology partner, enterprise solutions',
        ogTitle: 'VISIONARA | Innovative Web & App Development',
        ogDescription: 'Leading technology partner for businesses. Custom web development, mobile apps, AI integration, and digital solutions.',
        ogImage: 'https://www.visionara.ca/images/medium_res_logo.webp',
        ogImageAlt: 'VISIONARA - Innovative Development Solutions',
        twitterCard: 'summary_large_image',
        twitterTitle: 'VISIONARA | Innovative Web & App Development',
        twitterDescription: 'Leading technology partner for businesses. Custom web development, mobile apps, AI integration, and digital solutions.',
        twitterImage: 'https://www.visionara.ca/images/medium_res_logo.webp',
        canonicalUrl: 'https://www.visionara.ca',
        robots: 'index, follow',
        structuredData: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": "https://www.visionara.ca/#webpage",
          "url": "https://www.visionara.ca",
          "name": "VISIONARA | Innovative Web & App Development Solutions",
          "isPartOf": {
            "@id": "https://www.visionara.ca/#website"
          },
          "about": {
            "@id": "https://www.visionara.ca/#organization"
          },
          "description": "Leading technology partner for businesses. Custom web development, mobile apps, AI integration, and digital solutions."
        }),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        page: 'contact',
        title: 'Contact VISIONARA | Get Your Free Project Quote',
        description: 'Ready to start your project? Contact us for a free consultation. Expert web development, mobile apps, AI solutions. Bring your vision to life.',
        keywords: 'contact visionara, project quote, free consultation, web development inquiry, app development contact, technology consultation, project estimate',
        ogTitle: 'Contact VISIONARA | Get Your Free Project Quote',
        ogDescription: 'Ready to start your project? Contact us today for a free consultation. Expert web development, mobile apps, and AI solutions.',
        ogImage: 'https://www.visionara.ca/images/medium_res_logo.webp',
        ogImageAlt: 'Contact VISIONARA',
        twitterCard: 'summary_large_image',
        twitterTitle: 'Contact VISIONARA | Get Your Free Project Quote',
        twitterDescription: 'Ready to start your project? Contact us today for a free consultation.',
        twitterImage: 'https://www.visionara.ca/images/medium_res_logo.webp',
        canonicalUrl: 'https://www.visionara.ca/contact',
        robots: 'index, follow',
        structuredData: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "@id": "https://www.visionara.ca/contact#contactpage",
          "url": "https://www.visionara.ca/contact",
          "name": "Contact VISIONARA",
          "description": "Get in touch with VISIONARA for your web development, mobile app, and AI solution needs.",
          "mainEntity": {
            "@type": "Organization",
            "@id": "https://www.visionara.ca/#organization"
          }
        }),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        page: 'about',
        title: 'About VISIONARA | Expert Technology Solutions Team',
        description: 'Meet the VISIONARA team. Passionate developers, designers, innovators transforming your business ideas into powerful digital solutions.',
        keywords: 'about visionara, technology team, software development company, web development experts, app developers, innovation team, tech solutions company',
        ogTitle: 'About VISIONARA | Expert Technology Solutions Team',
        ogDescription: 'Meet the VISIONARA team. Passionate developers, designers, and innovators dedicated to transforming your business ideas.',
        ogImage: 'https://www.visionara.ca/images/medium_res_logo.webp',
        ogImageAlt: 'About VISIONARA Team',
        twitterCard: 'summary_large_image',
        twitterTitle: 'About VISIONARA | Expert Technology Solutions Team',
        twitterDescription: 'Meet the VISIONARA team. Passionate developers, designers, and innovators dedicated to transforming your business ideas.',
        twitterImage: 'https://www.visionara.ca/images/medium_res_logo.webp',
        canonicalUrl: 'https://www.visionara.ca/about',
        robots: 'index, follow',
        structuredData: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "@id": "https://www.visionara.ca/about#aboutpage",
          "url": "https://www.visionara.ca/about",
          "name": "About VISIONARA",
          "description": "Learn about VISIONARA's mission to transform business ideas into powerful digital solutions.",
          "mainEntity": {
            "@type": "Organization",
            "@id": "https://www.visionara.ca/#organization"
          }
        }),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        page: 'services',
        title: 'Our Services | Web Development, Mobile Apps & AI Solutions',
        description: 'Comprehensive tech services: Web development, mobile apps, AI integration, cloud solutions, digital transformation. Tailored for your business.',
        keywords: 'web development services, mobile app development, AI solutions, cloud computing, digital transformation, custom software development, enterprise solutions, startup tech services',
        ogTitle: 'Our Services | Web Development, Mobile Apps & AI Solutions',
        ogDescription: 'Comprehensive technology services: Custom web development, mobile apps, AI integration, cloud solutions, and digital transformation.',
        ogImage: 'https://www.visionara.ca/images/medium_res_logo.webp',
        ogImageAlt: 'VISIONARA Services',
        twitterCard: 'summary_large_image',
        twitterTitle: 'Our Services | Web Development, Mobile Apps & AI',
        twitterDescription: 'Comprehensive technology services tailored for your business needs.',
        twitterImage: 'https://www.visionara.ca/images/medium_res_logo.webp',
        canonicalUrl: 'https://www.visionara.ca/services',
        robots: 'index, follow',
        structuredData: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "Software Development",
          "provider": {
            "@type": "Organization",
            "@id": "https://www.visionara.ca/#organization"
          },
          "areaServed": "CA",
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Technology Services",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Web Development"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Mobile App Development"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "AI Solutions"
                }
              }
            ]
          }
        }),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('seos', null, {});
  }
};
