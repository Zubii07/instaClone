"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface
      .changeColumn("Users", "profilePicture", {
        type: Sequelize.STRING,
        allowNull: true,
      })
      .then(() => {
        return queryInterface.changeColumn("Users", "googleId", {
          type: Sequelize.STRING,
          allowNull: true,
        });
      });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface
      .changeColumn("Users", "profilePicture", {
        type: Sequelize.STRING,
        allowNull: false,
      })
      .then(() => {
        return queryInterface.changeColumn("Users", "googleId", {
          type: Sequelize.STRING,
          allowNull: false,
        });
      });
  },
};
