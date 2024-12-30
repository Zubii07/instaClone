"use strict";
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define("Post", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  Post.associate = (models) => {
    Post.hasMany(models.PostImage, {
      foreignKey: "postId",
      as: "images",
      onDelete: "CASCADE",
    });
    Post.belongsTo(models.User, { foreignKey: "userId", as: "user" });

    Post.hasMany(models.Comment, { foreignKey: "postId", as: "comments" });

    Post.hasMany(models.Like, { as: "likes", foreignKey: "postId" });
  };

  return Post;
};
