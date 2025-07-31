import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';
import Workspace from './Workspace';
import Task from './Task';
import User from './User'; 

class Project extends Model {
    public id!: number;
    public name!: string;
    public description!: string;
    public deadline!: Date;
    public workspaceId!: number;
}

Project.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: true
    },
    workspaceId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'project'
});


export default Project;
