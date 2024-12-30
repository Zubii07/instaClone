module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "isPrivate", {
      type: Sequelize.BOOLEAN,
      defaultValue: false, // Default to public
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "isPrivate");
  },
};
