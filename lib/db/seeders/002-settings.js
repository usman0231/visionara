'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const settings = [
      {
        id: uuidv4(),
        key: 'site_name',
        value: JSON.stringify({ value: 'Visionara' }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        key: 'site_tagline',
        value: JSON.stringify({ value: 'Turn your visions into reality' }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        key: 'company_email',
        value: JSON.stringify({ value: 'hello@visionara.ca' }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        key: 'company_phone',
        value: JSON.stringify({ value: '+1 (555) 123-4567' }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        key: 'company_hours',
        value: JSON.stringify({ value: 'Mon–Fri, 9am–6pm' }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        key: 'branding',
        value: JSON.stringify({
          logo: '/images/just_logo.png',
          primaryColor: '#763cac',
          backgroundColor: '#000000',
          textColor: '#ffffff'
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('settings', settings);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('settings', null, {});
  },
};