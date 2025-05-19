import './Calendar.css';
import { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';

interface Bookings {
    id: number,
    date: string,
    time: string,
    user_id: number,
    driver_id: number,
}

interface Driver {
    id: number,
    name: string,
    startTime: string,
    endTime: string,
}

// This assumes drivers schedules are set and don't change
export default function BasicDateCalendar() {
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
    const [selectedTime, setSelectedTime] = useState<string | null>("");
    const [availableDriversMap, setAvailableDriversMap] = useState<Map<string, Driver[]>>(new Map());
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingBooking, setPendingBooking] = useState<{
        time: string;
        drivers: Driver[];
    } | null>(null);


    const timeslots: string[] = [];

    // Make it so that it starts at the time of day that it is rounded
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const hourStr = hour.toString().padStart(2, '0');
            const minuteStr = minute.toString().padStart(2, '0');

            timeslots.push(`${hourStr}:${minuteStr}`);
        }
    }

    const handleDataChange = (newValue: Dayjs | null) => {
        setSelectedDate(newValue);
    }

    const timeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
    };

    // Check all drivers based on availability for time
    const preComputeAvailableDrivers = async () => {
        // Maybe dont do an API call for each click, precompute? Check if time exists in map already?
        try {
            const response = await axios.get<Driver[]>('http://localhost:4000/api/drivers/get-drivers');
            const drivers: Driver[] = response.data;

            const map = new Map<string, Driver[]>();

            for (const time of timeslots) {
                const timeInMin: number = timeToMinutes(time);
                const available: Driver[] = [];

                for (const driver of drivers) {
                    const start = timeToMinutes(driver.startTime.slice(0, 5));
                    const end = timeToMinutes(driver.endTime.slice(0, 5));

                    if (start <= timeInMin && timeInMin < end) {
                        available.push(driver);
                    }
                }
                map.set(time, available);
            }


            getDriversBookings(map);
        } catch (error: any) {
            console.error(error);
        }
    };

    // Go through each timeslot, and see which drivers are unavailable, set to that timeslot in a map
    const getDriversBookings = async (availabilityMap: Map<string, Driver[]>) => {
        try {
            const date: string | undefined = selectedDate?.format('YYYY-MM-DD');

            const response = await axios.post<Bookings[]>('http://localhost:4000/api/book/get-available', {
                date: date,
            });

            const bookings: Bookings[] = response.data;

            const updatedAvailability = new Map<string, Driver[]>();

            for (const [time, drivers] of Array.from(availabilityMap)) {
                const timeInMin: number = timeToMinutes(time);

                // Filter bookings for this specific time
                const bookedDriverIds = bookings
                    .filter(booking => {
                        const bookedTimeMin = timeToMinutes(booking.time);

                        return timeInMin >= bookedTimeMin && timeInMin < bookedTimeMin + 60;
                    })
                    .map(booking => booking.driver_id);

                // Keep only drivers not booked at this time
                const freeDrivers = drivers.filter(driver => !bookedDriverIds.includes(driver.id));

                // Store updated list in the new map for each time
                updatedAvailability.set(time, freeDrivers);
            }

            // console.log(updatedAvailability);
            // console.log(bookings);

            // updateTimeSlots(updatedAvailability)
            setAvailableDriversMap(updatedAvailability);
            console.log(availableDriversMap);
            console.log(updatedAvailability);
        } catch (error: any) {
            console.error(error);
        }
    };

    const bookDriver = async (book_date: Dayjs | null, time: string, user_id: number, drivers: Driver[]) => {
        const date: string | undefined = selectedDate?.format('YYYY-MM-DD');

        // There is a smarter way to do this
        // We can make a call to see what drivers are working this day already and book the least
        // Or we can book who has a delivery the longest time away
        // Or based on distance to currently booked jobs
        // etc
        const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];
        const driver_id = randomDriver.id;

        try {
            const response = await axios.post('http://localhost:4000/api/book/book-driver', {
                date,
                time,
                user_id,
                driver_id
            });

            console.log("Booking response:", response.data);
            await preComputeAvailableDrivers();
        } catch (error) {
            console.error("Booking failed:", error);
        }
    };

    useEffect(() => {
        // call grab available
        preComputeAvailableDrivers();
    }, [selectedDate]);

    return (
        <div className='outer-calendar'>
            <div className="customer-calendar">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar value={selectedDate} onChange={handleDataChange} shouldDisableDate={(date) => {
                        // Grey out previous days
                        return date.isBefore(dayjs(), 'day');
                    }} />
                </LocalizationProvider>
            </div>
            <div className='right-calendar'>
                <h1>{selectedDate ? selectedDate.format('YYYY-MM-DD') : 'No date selected'}</h1>
                <h2>{selectedTime}</h2>
                <div className='time-selector'>
                    {Array.from(availableDriversMap.entries())
                        .filter(([_, drivers]) => drivers.length > 0) // keeps slots with available drivers
                        .map(([time, drivers]) => (
                            <div className='time-slot' key={time}>
                                <button
                                    className={selectedTime === time ? 'selected' : ''}
                                    onClick={() => {
                                        setSelectedTime(time);
                                        setPendingBooking({ time, drivers });
                                        setShowConfirmModal(true);
                                    }}
                                >
                                    {time}
                                </button>
                            </div>
                        ))}

                </div>

                {/* Popup */}
                {showConfirmModal && pendingBooking && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>Confirm Booking</h2>
                            <p>Book driver for {selectedDate?.format('YYYY-MM-DD')} at {pendingBooking.time}?</p>
                            <div className="modal-buttons">
                                <button
                                    onClick={() => {
                                        // user_id set to 1
                                        bookDriver(selectedDate, pendingBooking.time, 1, pendingBooking.drivers);
                                        setShowConfirmModal(false);
                                        setPendingBooking(null);
                                    }}>
                                    Book
                                </button>
                                <button
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setPendingBooking(null);
                                    }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>


    );
}