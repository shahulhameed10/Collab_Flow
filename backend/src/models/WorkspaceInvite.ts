import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';

class WorkspaceInvite extends Model {
  public id!: number;
  public email!: string;
  public workspaceId!: number;
  public role!: string;
  public token!: string;
  public accepted!: boolean;
}

export default WorkspaceInvite;

WorkspaceInvite.init({
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  workspaceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'Member',
  },
  token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  accepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  sequelize,
  modelName: 'workspaceInvite',
});
