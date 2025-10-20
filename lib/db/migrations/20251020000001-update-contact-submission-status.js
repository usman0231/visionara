'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Update the enum type for status column
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_contact_submissions_status" ADD VALUE IF NOT EXISTS 'unseen';
      ALTER TYPE "enum_contact_submissions_status" ADD VALUE IF NOT EXISTS 'seen';
    `);

    // Update existing 'pending' records to 'unseen'
    await queryInterface.sequelize.query(`
      UPDATE contact_submissions
      SET status = 'unseen'
      WHERE status = 'pending';
    `);
  },

  async down(queryInterface, Sequelize) {
    // Update 'unseen' and 'seen' back to 'pending'
    await queryInterface.sequelize.query(`
      UPDATE contact_submissions
      SET status = 'pending'
      WHERE status IN ('unseen', 'seen');
    `);
  }
};
