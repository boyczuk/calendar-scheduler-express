import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

interface DriverAttributes {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface DriverCreationAttributes extends Optional<DriverAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

// Extending model to driver class
export class Driver extends Model<DriverAttributes, DriverCreationAttributes> implements DriverAttributes {
    public id!: number;
    public name!: string;
    public startTime!: string;
    public endTime!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Driver.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Driver',
    tableName: 'drivers',
    timestamps: true,
});