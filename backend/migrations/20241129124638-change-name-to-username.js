"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("Users", "name", "username");
    await queryInterface.removeColumn("Users", "provider");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("Users", "username", "name");
    await queryInterface.addColumn("Users", "provider", {
      type: Sequelize.ENUM("google", "email"),
      allowNull: false,
      defaultValue: "email",
    });
  },
};
