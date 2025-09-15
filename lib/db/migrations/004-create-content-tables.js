'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Services table
    await queryInterface.createTable('services', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      iconUrl: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Packages table
    await queryInterface.createTable('packages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      category: {
        type: Sequelize.ENUM('Web', 'Mobile', 'Graphic', 'Marketing'),
        allowNull: false,
      },
      tier: {
        type: Sequelize.ENUM('Basic', 'Standard', 'Enterprise'),
        allowNull: false,
      },
      priceOnetime: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      priceMonthly: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      priceYearly: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      features: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: [],
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Reviews table
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Gallery Items table
    await queryInterface.createTable('gallery_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      imageUrl: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      alt: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Stats table
    await queryInterface.createTable('stats', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      value: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      prefix: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      suffix: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Features Matrix table
    await queryInterface.createTable('features_matrix', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      serviceKey: {
        type: Sequelize.ENUM('web', 'mobile', 'graphic', 'marketing'),
        allowNull: false,
      },
      planKey: {
        type: Sequelize.ENUM('basic', 'standard', 'enterprise'),
        allowNull: false,
      },
      priceOnetime: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      priceMonthly: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      priceYearly: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tag: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Settings table
    await queryInterface.createTable('settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      value: {
        type: Sequelize.JSONB,
        allowNull: false,
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

    // Contact Submissions table
    await queryInterface.createTable('contact_submissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      company: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      serviceType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      budget: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      timeline: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      meta: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes
    await queryInterface.addIndex('services', ['active', 'sortOrder']);
    await queryInterface.addIndex('packages', ['category', 'tier'], { 
      unique: true,
      where: { deletedAt: null }
    });
    await queryInterface.addIndex('reviews', ['active', 'sortOrder']);
    await queryInterface.addIndex('gallery_items', ['active', 'sortOrder']);
    await queryInterface.addIndex('stats', ['active', 'sortOrder']);
    await queryInterface.addIndex('features_matrix', ['serviceKey', 'planKey'], {
      unique: true,
      where: { deletedAt: null }
    });
    await queryInterface.addIndex('settings', ['key']);
    await queryInterface.addIndex('contact_submissions', ['email', 'createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('contact_submissions');
    await queryInterface.dropTable('settings');
    await queryInterface.dropTable('features_matrix');
    await queryInterface.dropTable('stats');
    await queryInterface.dropTable('gallery_items');
    await queryInterface.dropTable('reviews');
    await queryInterface.dropTable('packages');
    await queryInterface.dropTable('services');
  },
};