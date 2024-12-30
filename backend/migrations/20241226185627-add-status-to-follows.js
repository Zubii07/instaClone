"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Follows", "status", {
      type: Sequelize.STRING,
      defaultValue: "accepted",
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Follows", "status");
  },
};
