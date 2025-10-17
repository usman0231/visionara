'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('seos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      page: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: 'Page identifier (e.g., "home", "contact", "about", "global")',
      },
      title: {
        type: Sequelize.STRING(70),
        allowNull: false,
        comment: 'Page title (50-60 characters optimal)',
      },
      description: {
        type: Sequelize.STRING(160),
        allowNull: false,
        comment: 'Meta description (150-160 characters optimal)',
      },
      keywords: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Comma-separated keywords',
      },
      ogTitle: {
        type: Sequelize.STRING(70),
        allowNull: true,
        comment: 'Open Graph title',
      },
      ogDescription: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Open Graph description',
      },
      ogImage: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Open Graph image URL',
      },
      ogImageAlt: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Open Graph image alt text',
      },
      twitterCard: {
        type: Sequelize.ENUM('summary', 'summary_large_image', 'app', 'player'),
        defaultValue: 'summary_large_image',
        comment: 'Twitter card type',
      },
      twitterTitle: {
        type: Sequelize.STRING(70),
        allowNull: true,
        comment: 'Twitter card title',
      },
      twitterDescription: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Twitter card description',
      },
      twitterImage: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Twitter card image URL',
      },
      canonicalUrl: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Canonical URL for the page',
      },
      robots: {
        type: Sequelize.STRING,
        defaultValue: 'index, follow',
        comment: 'Robots meta tag (e.g., "index, follow", "noindex, nofollow")',
      },
      structuredData: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'JSON-LD structured data',
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Whether this SEO configuration is active',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('seos', ['page'], {
      unique: true,
      name: 'seos_page_unique',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('seos');
  }
};
