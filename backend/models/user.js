module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      isPrivate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      picture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      followersCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      followingCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      postCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
    },
    {}
  );

  // Add the association method to define the relationship between User and Story
  User.associate = (models) => {
    User.hasMany(models.Story, { foreignKey: "userId", as: "stories" }); // A user can have many stories

    User.hasMany(models.Notification, {
      foreignKey: "userId", // Recipient of notifications
      as: "Notifications",
    });

    User.hasMany(models.Notification, {
      foreignKey: "triggeredById", // Triggered notifications
      as: "TriggeredNotifications",
    });

    User.hasMany(models.Follow, { foreignKey: "followerId", as: "Followers" });
    User.hasMany(models.Follow, { foreignKey: "followingId", as: "Following" });

    User.hasMany(models.Post, { foreignKey: "userId" });
    User.hasMany(models.Comment, { foreignKey: "userId", as: "comments" });

    User.hasMany(models.Like, { as: "likes", foreignKey: "userId" });
  };

  return User;
};
