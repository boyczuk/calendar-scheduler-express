import { Router } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcrypt';

const router = Router();

// Post and gett for register/login

router.post('/register-user', async (request, response) => {

    // Create user
    try {
        const { email, password } = request.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        // Awaits added here and above so we guarantee that we have it before moving on
        const user = await User.create({
            email,
            password: hashedPassword,
        });
        response.json({ success: true, user: { id: user.id, email: user.email } });
    } catch (error: any) {
        console.error(error);
        response.status(500).json({ error: "registration failed", detail: error.message });
    }
})

router.post('/login-user', async (request, response) => {
    try {
        const { email, password } = request.body;

        const user = await User.findOne({
            where: { email: email },
        });

        if (user) {
            const match = await bcrypt.compare(password, user.email);
            if (match) {
                response.json("Logged in");
            } else {
                response.json("Failed to login");
            }

        } else {
            console.log("User not found");
            response.json({ error: "User not found" });
        }

    } catch (error) {
        console.error(error);
        response.json({ error: error });
    }
})

export default router;