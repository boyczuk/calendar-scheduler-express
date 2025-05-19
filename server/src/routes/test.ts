import { Router } from 'express';
import { pool } from '../db';
import { sequelize } from '../sequelize';

const router = Router();

router.get('/', async (_req, res) => {
	try {
		const [results, metadata] = await sequelize.query('SELECT current_user, current_database(), NOW()');
		console.log(results);
		res.json({ success: true, result: results });
	} catch (err: any) {
		console.error("🔥 DB query failed:", err);
		res.status(500).json({ error: 'Database error', detail: err.message });
	}
});


export default router;
