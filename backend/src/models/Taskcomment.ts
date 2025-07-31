import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';
import Task from './Task';
import User from './User';

class TaskComment extends Model {
    public id!: number;
    public content!: string;
    public taskId!: number;
    public userId!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

TaskComment.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'taskComment',
    tableName: 'task_comments',
    timestamps: true, 
});



export default TaskComment;
