"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "provider", {
      type: Sequelize.ENUM("google", "email"),
      allowNull: false,
      defaultValue: "email",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "provider");
  },
};
