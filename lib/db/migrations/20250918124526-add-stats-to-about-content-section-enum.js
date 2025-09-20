'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add 'stats' to the enum type
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_about_content_section" ADD VALUE 'stats';
    `);
  },

  async down (queryInterface, Sequelize) {
    // Note: PostgreSQL doesn't support removing enum values directly
    // This would require recreating the enum and updating the column
    // For this project, we'll leave this empty as it's a development environment
    console.log('Warning: Cannot remove enum values in PostgreSQL. Manual intervention required.');
  }
};
