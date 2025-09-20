'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove any partial unique indexes first
    try {
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS users_email_unique_active;');
    } catch (error) {
      console.log('Partial index does not exist, skipping removal');
    }

    // Remove the deletedAt column
    try {
      await queryInterface.removeColumn('users', 'deletedAt');
      console.log('✅ Removed deletedAt column from users table');
    } catch (error) {
      console.log('deletedAt column does not exist, skipping removal');
    }

    // Ensure we have a simple unique constraint on email
    try {
      await queryInterface.addConstraint('users', {
        fields: ['email'],
        type: 'unique',
        name: 'users_email_unique'
      });
      console.log('✅ Added unique constraint on users.email');
    } catch (error) {
      console.log('Unique constraint on email already exists or failed to add');
    }
  },

  async down(queryInterface, Sequelize) {
    // Add back the deletedAt column
    await queryInterface.addColumn('users', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Remove the simple unique constraint
    try {
      await queryInterface.removeConstraint('users', 'users_email_unique');
    } catch (error) {
      console.log('Could not remove unique constraint');
    }

    // Add back the partial unique index
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX users_email_unique_active
      ON "users" ("email")
      WHERE "deletedAt" IS NULL;
    `);

    console.log('⚠️  Restored soft delete functionality');
  }
};