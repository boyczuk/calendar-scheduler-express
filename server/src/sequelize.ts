import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5433', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialect: 'postgres',
    logging: true,
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Sequelize connected successfully.');
    } catch (error) {
        console.error('Cannot connect to database: ', error);
    }
})();