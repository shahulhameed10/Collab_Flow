"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const appconfig_1 = require("../config/appconfig");
console.log('DB CONFIG:', appconfig_1.config.db);
//use sequelise to connect the db
const sequelize = new sequelize_1.Sequelize(appconfig_1.config.db.name, appconfig_1.config.db.user, appconfig_1.config.db.pass, {
    host: appconfig_1.config.db.host,
    dialect: 'postgres',
    logging: false,
});
exports.default = sequelize;
