'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('newsletter_subscriptions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      status: {
        type: Sequelize.ENUM('subscribed', 'unsubscribed'),
        defaultValue: 'subscribed',
        allowNull: false,
      },
      subscribedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      unsubscribedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      ipAddress: {
        type: Sequelize.STRING(45), // IPv6 max length
        allowNull: true,
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add index on email for faster lookups
    await queryInterface.addIndex('newsletter_subscriptions', ['email'], {
      name: 'idx_newsletter_email',
    });

    // Add index on status for filtering
    await queryInterface.addIndex('newsletter_subscriptions', ['status'], {
      name: 'idx_newsletter_status',
    });

    console.log('✅ Newsletter subscriptions table created successfully');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('newsletter_subscriptions');
    console.log('⚠️ Newsletter subscriptions table dropped');
  }
};
