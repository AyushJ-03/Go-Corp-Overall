import express from 'express';
import { getNotificationHistory, updateNotificationSettings } from './notification.controller.js';
import { authUser } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/history/:officeId', authUser, getNotificationHistory);
router.put('/settings/:officeId', authUser, updateNotificationSettings);

export default router;
