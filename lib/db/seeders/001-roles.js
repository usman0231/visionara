'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = [
      {
        id: uuidv4(),
        name: 'SuperAdmin',
        permissions: JSON.stringify({
          users: ['read', 'write', 'delete'],
          content: ['read', 'write', 'delete', 'publish'],
          settings: ['read', 'write'],
          audit: ['read'],
          system: ['setup', 'manage']
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Admin',
        permissions: JSON.stringify({
          users: ['read', 'write'],
          content: ['read', 'write', 'delete', 'publish'],
          settings: ['read', 'write'],
          audit: ['read']
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Member',
        permissions: JSON.stringify({
          content: ['read', 'write'],
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('roles', roles);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  },
};