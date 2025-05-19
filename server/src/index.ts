import express from 'express';
import cors from 'cors';
import usersRouter from './routes/test';
import userAuth from './routes/auth';
import driverRouter from './routes/drivers';
import bookRouter from './routes/book';
import { User } from './models/User';
import { Driver } from './models/Driver';
import { Booking } from './models/Bookings';
import { sequelize } from './sequelize';

const app = express();
const PORT = 4000;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}))

/*
 * Drivers table with availability range
 * Bookings table with all bookings using drivers foreign keys
 * Find way to check if slot available during each time
 */

// Enable Sequelize, and set everything up in Docker
app.use(express.json());
app.use('/api/users', usersRouter);
app.use('/api/auth', userAuth);
app.use('/api/drivers', driverRouter);
app.use('/api/book', bookRouter);

const startServer = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        console.log('✅ DB connected');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('🔥 DB failed, shutting down:', error);
        process.exit(1);
    }
};

startServer();