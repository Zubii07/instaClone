"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("Users", "email", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("Users", "email", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false,
    });
  },
};
