"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "googleId");
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "googleId", {
      type: Sequelize.STRING,
      unique: true,
    });
  },
};
