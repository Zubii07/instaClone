module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "password", {
      type: Sequelize.STRING,
      allowNull: true, // or false if you want the password to be required
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "password");
  },
};
