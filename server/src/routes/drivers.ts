import { response, Router } from 'express';
import { Driver } from '../models/Driver';
import { Booking } from '../models/Bookings';
import { sequelize } from '../sequelize';

const router = Router();

const drivers = [
    { id: 1, name: 'Driver 1', startTime: "08:00", endTime: "20:00" },
    { id: 2, name: 'Driver 2', startTime: "08:00", endTime: "20:00" },
    { id: 3, name: 'Driver 3', startTime: "10:00", endTime: "20:00" },
    { id: 4, name: 'Driver 4', startTime: "08:00", endTime: "18:00" },
    { id: 5, name: 'Driver 5', startTime: "08:00", endTime: "20:00" },
];


router.post('/update-drivers', async (request, response) => {
    try {
        await Driver.destroy({ where: {}, truncate: true });

        await Driver.bulkCreate(drivers);

        response.json({ message: "Drivers updated" });
    } catch (error) {
        console.error("Error updating drivers", error);
        response.status(500).json({ error: "failed to update drivers " });
    }
});

router.get('/get-drivers', async (req, res) => {
    // Grab driver number based on available
    try {
        const drivers: Driver[] = await Driver.findAll();
        console.log(drivers);
        res.json(drivers);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get drivers" })
    }
});

// Need to connect to an actual available driver
router.post('/test-booking', async (req, res) => {
    try {
            const date: string = req.body.date;
            const time: string = req.body.time;
            const user_id: number = req.body.user_id;
            const driver_id: number = req.body.driver_id;
    
            await Booking.create({
                date: date,
                time: time,
                user_id: user_id,
                driver_id: driver_id,
            });
            
            res.json("Booking created");
            
        } catch (error: any) {
            res.status(500).json({ error: "couldnt get available drivers" });
        }
});

export default router;