import { Router } from "express";
import { sequelize } from "../sequelize";
import { Booking } from "../models/Bookings";


const router = Router();

// id: number;
//     date: Date;
//     time: string;
//     user_id: number;
//     driver_id: number;

router.get('/test-one', async (request, response) => {
    try {
        const date: string = request.body.date;
        const time: string = request.body.time;
        const driver_id: number = request.body.driver_id;

        if (!driver_id || !date || !time) {
            response.status(400).json({ error: 'Missing driver_id, date, or time' });
        }

        const existingBooking = await Booking.findOne({
            where: {
                driver_id,
                date,
                time,
            },
        });

        if (existingBooking) {
            response.status(200).json(existingBooking);
        } else {
            response.status(200).json({ exists: false, message: 'Slot is free' });
        }
    } catch (error: any) {
        response.status(500).json({ error: "couldnt get available drivers" });
    }
});


router.post('/get-available', async (request, response) => {
    try {
        const { date } = request.body;

        if (!date) {
            response.status(400).json({ error: 'Missing date in body' });
        }

        const bookings = await Booking.findAll({
            where: {
                date
            }
        });

        response.status(200).json(bookings);
    } catch (error: any) {
        response.status(500).json({ error: "couldnt get available drivers" });
    }
});


// Need to add check/create unique id for booking
router.post('/book-driver', async (req, res) => {
    try {
        const date: string = req.body.date;
        const time: string = req.body.time;
        const user_id: number = req.body.user_id;
        const driver_id: number = req.body.driver_id;

        const unique_id: string = date + time + driver_id;

        await Booking.create({
            id: unique_id,
            date: date,
            time: time,
            user_id: user_id,
            driver_id: driver_id,
        });

        res.json("Booking created");

    } catch (error: any) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(409).json({ error: "Driver already booked for this time." });
        }
        console.log(error);
        res.status(500).json({ error });
    }
});

export default router;