"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
class Task extends sequelize_1.Model {
}
Task.init({
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Todo'
    },
    priority: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Medium'
    },
    labels: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    dueDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    assignedTo: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    projectId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize: db_1.default,
    modelName: 'task'
});
exports.default = Task;
