const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const SEO = sequelize.define('SEO', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  page: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Page identifier (e.g., "home", "contact", "about", "global")',
  },
  title: {
    type: DataTypes.STRING(70),
    allowNull: false,
    comment: 'Page title (50-60 characters optimal)',
  },
  description: {
    type: DataTypes.STRING(160),
    allowNull: false,
    comment: 'Meta description (150-160 characters optimal)',
  },
  keywords: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Comma-separated keywords',
  },
  ogTitle: {
    type: DataTypes.STRING(70),
    allowNull: true,
    comment: 'Open Graph title',
  },
  ogDescription: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Open Graph description',
  },
  ogImage: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Open Graph image URL',
  },
  ogImageAlt: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Open Graph image alt text',
  },
  twitterCard: {
    type: DataTypes.ENUM('summary', 'summary_large_image', 'app', 'player'),
    defaultValue: 'summary_large_image',
    comment: 'Twitter card type',
  },
  twitterTitle: {
    type: DataTypes.STRING(70),
    allowNull: true,
    comment: 'Twitter card title',
  },
  twitterDescription: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Twitter card description',
  },
  twitterImage: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Twitter card image URL',
  },
  canonicalUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Canonical URL for the page',
  },
  robots: {
    type: DataTypes.STRING,
    defaultValue: 'index, follow',
    comment: 'Robots meta tag (e.g., "index, follow", "noindex, nofollow")',
  },
  structuredData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON-LD structured data',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this SEO configuration is active',
  },
}, {
  tableName: 'seos',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['page'],
    },
  ],
});

module.exports = SEO;
