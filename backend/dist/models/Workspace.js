"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../utils/db"));
class Workspace extends sequelize_1.Model {
}
Workspace.init({
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    ownerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    brandingLogo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true // Branding is optional
    }
}, {
    sequelize: db_1.default,
    modelName: 'workspace'
});
exports.default = Workspace;
