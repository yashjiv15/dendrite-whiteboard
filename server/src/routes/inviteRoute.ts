import { Router } from 'express';
import { handleInvite } from '../controllers/inviteController';

const router = Router();
router.post('/send-invite', handleInvite);
export default router;
