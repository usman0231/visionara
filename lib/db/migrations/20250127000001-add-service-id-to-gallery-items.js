'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('gallery_items', 'service_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'services',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Add index for better query performance
    await queryInterface.addIndex('gallery_items', ['service_id'], {
      name: 'gallery_items_service_id_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('gallery_items', 'gallery_items_service_id_idx');
    await queryInterface.removeColumn('gallery_items', 'service_id');
  },
};
