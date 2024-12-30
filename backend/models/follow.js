"use strict";
module.exports = (sequelize, DataTypes) => {
  const Follow = sequelize.define("Follow", {
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "accepted", // Default to "accepted" for public profiles
    },
  });

  Follow.associate = (models) => {
    Follow.belongsTo(models.User, { foreignKey: "followerId", as: "Follower" });
    Follow.belongsTo(models.User, {
      foreignKey: "followingId",
      as: "Following",
    });
  };

  return Follow;
};
