"use strict";
module.exports = (sequelize, DataTypes) => {
  const PostImage = sequelize.define("PostImage", {
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  PostImage.associate = (models) => {
    PostImage.belongsTo(models.Post, { foreignKey: "postId", as: "post" });
  };

  return PostImage;
};
