"use strict";

const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Extract FAQ content from existing about page
    const faqData = [
      {
        id: uuidv4(),
        question: "What engagement models do you offer?",
        answer:
          "Fixed-scope projects, monthly product pods, or augmenting your in-house team.",
        category: "General",
        sortOrder: 1,
        active: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: uuidv4(),
        question: "Do you work with early-stage startups?",
        answer: "Yes—MVPs and rapid validation are our sweet spot.",
        category: "General",
        sortOrder: 2,
        active: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: uuidv4(),
        question: "Can you take over an existing codebase?",
        answer:
          "Absolutely. We audit, stabilize, and then ship improvements in short sprints.",
        category: "Technical",
        sortOrder: 3,
        active: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ];

    await queryInterface.bulkInsert("faqs", faqData, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("faqs", null, {});
  },
};
