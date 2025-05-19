import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

interface BookingAttributes {
    id: string;
    date: string;
    time: string;
    user_id: number;
    driver_id: number;
    createdAt?: Date;
    updatedAt?: Date;
}

// When creating a Booking, the following fields are optional (id, createdAt, updatedAt will be auto-generated)
interface BookingCreationAttributes extends Optional<BookingAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

// Extending Sequelize's Model
export class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
    public id!: string;
    public date!: string;
    public time!: string;
    public user_id!: number;
    public driver_id!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Initialize Booking model
Booking.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        date: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        time: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        driver_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Booking',
        tableName: 'bookings',
        timestamps: true,
    }
);
