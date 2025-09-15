'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Services
    const services = [
      {
        id: uuidv4(),
        title: 'Web Development',
        iconUrl: '/icons/computer.gif',
        text: 'Pixel-perfect, responsive websites with fast load times and clean, scalable code.',
        sortOrder: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: 'Mobile App Development',
        iconUrl: '/icons/computer.gif',
        text: 'iOS & Android apps with modern UI and smooth, native-feel interactions.',
        sortOrder: 2,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: 'Graphic Designing',
        iconUrl: '/icons/computer.gif',
        text: 'Logos, brand systems, and marketing collateral that feel premium and consistent.',
        sortOrder: 3,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: 'Marketing',
        iconUrl: '/icons/computer.gif',
        text: 'Full-funnel strategy across SEO, paid, and lifecycle—creative that converts.',
        sortOrder: 4,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Reviews
    const reviews = [
      {
        id: uuidv4(),
        name: 'Amina K.',
        role: 'Product Designer',
        rating: 5,
        text: 'The experience was buttery smooth. The micro-animations made everything feel premium without being flashy.',
        sortOrder: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Usman H.',
        role: 'Founder, Fintly',
        rating: 5,
        text: 'Fantastic. Performance is snappy and the UI polish stands out—customers noticed immediately.',
        sortOrder: 2,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Sana R.',
        role: 'Marketing Lead',
        rating: 4,
        text: 'Love the details: hover states, subtle glow, and the way cards slide in. Instantly elevated our brand feel.',
        sortOrder: 3,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Zayn M.',
        role: 'Engineer',
        rating: 5,
        text: 'Setup was effortless and the animations are configurable. Dark-mode friendly out of the box.',
        sortOrder: 4,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Gallery Items
    const galleryItems = [
      {
        id: uuidv4(),
        imageUrl: '/gallery/s1.png',
        alt: 'Achievement 1',
        sortOrder: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        imageUrl: '/gallery/s2.png',
        alt: 'Achievement 2',
        sortOrder: 2,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        imageUrl: '/gallery/s3.png',
        alt: 'Achievement 3',
        sortOrder: 3,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        imageUrl: '/gallery/s4.png',
        alt: 'Achievement 4',
        sortOrder: 4,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        imageUrl: '/gallery/s5.png',
        alt: 'Achievement 5',
        sortOrder: 5,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        imageUrl: '/gallery/s6.png',
        alt: 'Achievement 6',
        sortOrder: 6,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        imageUrl: '/gallery/s8.png',
        alt: 'Achievement 7',
        sortOrder: 7,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Stats
    const stats = [
      {
        id: uuidv4(),
        label: 'Projects Completed',
        value: 150,
        prefix: null,
        suffix: '+',
        sortOrder: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        label: 'Happy Clients',
        value: 98,
        prefix: null,
        suffix: '%',
        sortOrder: 2,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        label: 'Years Experience',
        value: 5,
        prefix: null,
        suffix: '+',
        sortOrder: 3,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        label: 'Team Members',
        value: 12,
        prefix: null,
        suffix: null,
        sortOrder: 4,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('services', services);
    await queryInterface.bulkInsert('reviews', reviews);
    await queryInterface.bulkInsert('gallery_items', galleryItems);
    await queryInterface.bulkInsert('stats', stats);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('stats', null, {});
    await queryInterface.bulkDelete('gallery_items', null, {});
    await queryInterface.bulkDelete('reviews', null, {});
    await queryInterface.bulkDelete('services', null, {});
  },
};