module.exports = (sequelize, DataTypes) => {
  const Story = sequelize.define("Story", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // Points to the Users table
        key: "id", // The column in Users table to be referenced
      },
      onDelete: "CASCADE",
    },
    contentType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["image", "video"]],
      },
    },
    contentUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  Story.associate = function (models) {
    Story.belongsTo(models.User, { foreignKey: "userId", as: "user" });
  };

  return Story;
};
