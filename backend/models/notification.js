"use strict";
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      type: {
        type: DataTypes.STRING, // "follow", "like", etc.
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      triggeredById: {
        type: DataTypes.INTEGER, // User who triggered the notification
        allowNull: false,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {}
  );

  Notification.associate = function (models) {
    Notification.belongsTo(models.User, {
      foreignKey: "userId",
      as: "Recipient",
    });
    Notification.belongsTo(models.User, {
      foreignKey: "triggeredById",
      as: "TriggeredBy",
    });
  };

  return Notification;
};
