import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';

class Task extends Model {
    public id!: number;
    public name!: string;
    public status!: string;
    public priority!: string;
    public labels!: string;
    public dueDate!: Date;
    public assignedTo!: number;
    public projectId!: number;
}

Task.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Todo'
    },
    priority: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Medium'
    },
    labels: {
        type: DataTypes.STRING,
        allowNull: true
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'task'
});

export default Task;
