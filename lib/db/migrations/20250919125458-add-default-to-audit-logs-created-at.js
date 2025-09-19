'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add default value to createdAt column in audit_logs table
    await queryInterface.changeColumn('audit_logs', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove default value from createdAt column
    await queryInterface.changeColumn('audit_logs', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  }
};
