"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add foreign key to Notifications (userId -> Users)
    await queryInterface.addConstraint("Notifications", {
      fields: ["userId"],
      type: "foreign key",
      name: "fk_notifications_userId", // Constraint name
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add foreign key to Notifications (triggeredById -> Users)
    await queryInterface.addConstraint("Notifications", {
      fields: ["triggeredById"],
      type: "foreign key",
      name: "fk_notifications_triggeredById", // Constraint name
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add foreign key to Follows (followerId -> Users)
    await queryInterface.addConstraint("Follows", {
      fields: ["followerId"],
      type: "foreign key",
      name: "fk_follows_followerId", // Constraint name
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add foreign key to Follows (followingId -> Users)
    await queryInterface.addConstraint("Follows", {
      fields: ["followingId"],
      type: "foreign key",
      name: "fk_follows_followingId", // Constraint name
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  down: async (queryInterface) => {
    // Remove foreign key from Notifications (userId)
    await queryInterface.removeConstraint(
      "Notifications",
      "fk_notifications_userId"
    );

    // Remove foreign key from Notifications (triggeredById)
    await queryInterface.removeConstraint(
      "Notifications",
      "fk_notifications_triggeredById"
    );

    // Remove foreign key from Follows (followerId)
    await queryInterface.removeConstraint("Follows", "fk_follows_followerId");

    // Remove foreign key from Follows (followingId)
    await queryInterface.removeConstraint("Follows", "fk_follows_followingId");
  },
};
