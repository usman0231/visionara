'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('packages', [
      // Web Development Packages
      {
        id: uuidv4(),
        category: 'Web',
        tier: 'Basic',
        priceOnetime: '999',
        priceMonthly: '99',
        priceYearly: '999',
        features: [
          'Responsive Website Design',
          'Up to 5 Pages',
          'Basic SEO Setup',
          'Contact Form',
          'Mobile Optimization',
          '3 Months Support'
        ],
        sortOrder: 1,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        category: 'Web',
        tier: 'Standard',
        priceOnetime: '1999',
        priceMonthly: '199',
        priceYearly: '1999',
        features: [
          'Everything in Basic',
          'Up to 10 Pages',
          'Advanced SEO Optimization',
          'Blog Integration',
          'Social Media Integration',
          'Analytics Setup',
          '6 Months Support'
        ],
        sortOrder: 2,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        category: 'Web',
        tier: 'Enterprise',
        priceOnetime: '4999',
        priceMonthly: '399',
        priceYearly: '3999',
        features: [
          'Everything in Standard',
          'Unlimited Pages',
          'E-commerce Integration',
          'Custom CMS',
          'Advanced Analytics',
          'Priority Support',
          '12 Months Support'
        ],
        sortOrder: 3,
        active: true,
        createdAt: now,
        updatedAt: now,
      },

      // Mobile Development Packages
      {
        id: uuidv4(),
        category: 'Mobile',
        tier: 'Basic',
        priceOnetime: '2999',
        priceMonthly: '299',
        priceYearly: '2999',
        features: [
          'Native iOS or Android App',
          'Up to 5 Screens',
          'Basic UI/UX Design',
          'App Store Submission',
          'Push Notifications',
          '3 Months Support'
        ],
        sortOrder: 4,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        category: 'Mobile',
        tier: 'Standard',
        priceOnetime: '4999',
        priceMonthly: '499',
        priceYearly: '4999',
        features: [
          'Everything in Basic',
          'Cross-Platform (iOS & Android)',
          'Up to 10 Screens',
          'Advanced UI/UX Design',
          'Backend Integration',
          'In-App Purchases',
          '6 Months Support'
        ],
        sortOrder: 5,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        category: 'Mobile',
        tier: 'Enterprise',
        priceOnetime: '9999',
        priceMonthly: '899',
        priceYearly: '8999',
        features: [
          'Everything in Standard',
          'Custom Backend Development',
          'Advanced Security Features',
          'Real-time Data Sync',
          'Admin Dashboard',
          'Priority Support',
          '12 Months Support'
        ],
        sortOrder: 6,
        active: true,
        createdAt: now,
        updatedAt: now,
      },

      // Graphic Design Packages
      {
        id: uuidv4(),
        category: 'Graphic',
        tier: 'Basic',
        priceOnetime: '299',
        priceMonthly: '49',
        priceYearly: '499',
        features: [
          'Logo Design (3 Concepts)',
          'Business Card Design',
          'Basic Brand Guidelines',
          '3 Revisions',
          'High-Resolution Files',
          '1 Month Support'
        ],
        sortOrder: 7,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        category: 'Graphic',
        tier: 'Standard',
        priceOnetime: '699',
        priceMonthly: '99',
        priceYearly: '999',
        features: [
          'Everything in Basic',
          'Logo Design (5 Concepts)',
          'Complete Brand Identity',
          'Social Media Templates',
          'Marketing Materials',
          '5 Revisions',
          '3 Months Support'
        ],
        sortOrder: 8,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        category: 'Graphic',
        tier: 'Enterprise',
        priceOnetime: '1499',
        priceMonthly: '199',
        priceYearly: '1999',
        features: [
          'Everything in Standard',
          'Unlimited Concepts',
          'Complete Brand Package',
          'Print Design Materials',
          'Packaging Design',
          'Unlimited Revisions',
          '6 Months Support'
        ],
        sortOrder: 9,
        active: true,
        createdAt: now,
        updatedAt: now,
      },

      // Marketing Packages
      {
        id: uuidv4(),
        category: 'Marketing',
        tier: 'Basic',
        priceOnetime: '499',
        priceMonthly: '99',
        priceYearly: '999',
        features: [
          'Social Media Strategy',
          'Content Calendar (1 Month)',
          'Basic Analytics Setup',
          '5 Social Posts per Week',
          'Monthly Reporting',
          '3 Months Support'
        ],
        sortOrder: 10,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        category: 'Marketing',
        tier: 'Standard',
        priceOnetime: '999',
        priceMonthly: '199',
        priceYearly: '1999',
        features: [
          'Everything in Basic',
          'Content Calendar (3 Months)',
          'Google Ads Setup',
          'SEO Optimization',
          '10 Social Posts per Week',
          'Weekly Reporting',
          '6 Months Support'
        ],
        sortOrder: 11,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        category: 'Marketing',
        tier: 'Enterprise',
        priceOnetime: '2499',
        priceMonthly: '399',
        priceYearly: '3999',
        features: [
          'Everything in Standard',
          'Complete Marketing Strategy',
          'Multi-Platform Campaigns',
          'Advanced Analytics & Insights',
          'Dedicated Account Manager',
          'Daily Content Creation',
          '12 Months Support'
        ],
        sortOrder: 12,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
    ], {});

    console.log('✅ Packages seeded successfully');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('packages', null, {});
    console.log('⚠️ Packages data removed');
  }
};