"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
class WorkspaceInvite extends sequelize_1.Model {
}
exports.default = WorkspaceInvite;
WorkspaceInvite.init({
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    workspaceId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    role: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'Member',
    },
    token: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    accepted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    sequelize: db_1.default,
    modelName: 'workspaceInvite',
});
