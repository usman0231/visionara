'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns to contact_submissions table
    await queryInterface.addColumn('contact_submissions', 'status', {
      type: Sequelize.ENUM('pending', 'replied', 'archived'),
      defaultValue: 'pending',
      allowNull: false,
    });

    await queryInterface.addColumn('contact_submissions', 'replyMessage', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('contact_submissions', 'repliedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('contact_submissions', 'repliedBy', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await queryInterface.addColumn('contact_submissions', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });

    console.log('✅ Contact submissions table updated with reply functionality');
  },

  async down(queryInterface, Sequelize) {
    // Remove the added columns
    await queryInterface.removeColumn('contact_submissions', 'status');
    await queryInterface.removeColumn('contact_submissions', 'replyMessage');
    await queryInterface.removeColumn('contact_submissions', 'repliedAt');
    await queryInterface.removeColumn('contact_submissions', 'repliedBy');
    await queryInterface.removeColumn('contact_submissions', 'updatedAt');

    console.log('⚠️ Contact submissions reply functionality removed');
  }
};
