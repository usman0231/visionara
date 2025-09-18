"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create about_content table
    await queryInterface.createTable("about_content", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      section: {
        type: Sequelize.ENUM(
          "hero",
          "story",
          "values",
          "services",
          "tech",
          "testimonials",
          "cta"
        ),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subtitle: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      content: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
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

    // Create faqs table
    await queryInterface.createTable("faqs", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      answer: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      category: {
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

    // Add indexes for about_content
    await queryInterface.addIndex("about_content", ["section", "sortOrder"]);
    await queryInterface.addIndex("about_content", ["active"]);

    // Add indexes for faqs
    await queryInterface.addIndex("faqs", ["category"]);
    await queryInterface.addIndex("faqs", ["sortOrder"]);
    await queryInterface.addIndex("faqs", ["active"]);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables
    await queryInterface.dropTable("faqs");
    await queryInterface.dropTable("about_content");

    // Drop ENUM type (PostgreSQL specific)
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_about_content_section";'
    );
  },
};
