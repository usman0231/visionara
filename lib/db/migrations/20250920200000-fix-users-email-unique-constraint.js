'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the existing unique constraint on email if it exists
    try {
      await queryInterface.removeConstraint('users', 'users_email_key');
    } catch (error) {
      console.log('Constraint users_email_key does not exist, skipping removal');
    }

    // Drop any existing unique index on email if it exists
    try {
      await queryInterface.removeIndex('users', 'users_email_key');
    } catch (error) {
      console.log('Index users_email_key does not exist, skipping removal');
    }

    // Create a partial unique index that only applies to non-deleted rows
    // This allows the same email to exist multiple times if the user is soft-deleted
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX users_email_unique_active
      ON "users" ("email")
      WHERE "deletedAt" IS NULL;
    `);

    console.log('✅ Created partial unique index on users.email for active users only');
  },

  async down(queryInterface, Sequelize) {
    // Drop the partial unique index
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS users_email_unique_active;
    `);

    // Recreate the original unique constraint (this might fail if there are duplicates)
    try {
      await queryInterface.addConstraint('users', {
        fields: ['email'],
        type: 'unique',
        name: 'users_email_key'
      });
    } catch (error) {
      console.log('Warning: Could not recreate original unique constraint due to duplicate emails');
      console.log('You may need to clean up duplicate emails manually');
    }

    console.log('⚠️  Reverted to original email constraint (may have issues with duplicates)');
  }
};