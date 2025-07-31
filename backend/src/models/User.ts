import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';

class User extends Model {
    public id!: number;
    public email!: string;
    public password!: string;
    public role!: string;
    public isVerified!: boolean;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('Admin', 'WorkspaceOwner', 'ProjectManager', 'Developer', 'Viewer'), // ✅ Fixed casing
            defaultValue: 'Developer'
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        sequelize,
        modelName: 'user'
    }
);

export default User;
