const { Model, DataTypes } = require("sequelize");

const { sequelize } = require("../util/db");

class Membership extends Model {}

Membership.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    blogId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "blogs", key: "id" },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    readinglistId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "readinglists", key: "id" },
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: "membership",
  }
);

module.exports = Membership;
