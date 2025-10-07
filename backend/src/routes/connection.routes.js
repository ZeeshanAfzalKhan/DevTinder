import express from 'express';
const router = express.Router();

import authenticate from '../middlewares/auth.middleware.js';
import { sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, blockConnection, getAllPendingConnectionsRequests, getAllConnections} from '../controllers/connection.controller.js';

router.post('/request/:receiverId', authenticate, sendConnectionRequest);

router.post('/accept/:senderId', authenticate, acceptConnectionRequest);

router.post('/reject/:senderId', authenticate, rejectConnectionRequest);

router.post('/block/:userId', authenticate, blockConnection);

router.get('/pending-requests', authenticate, getAllPendingConnectionsRequests);

router.get('/all-connections', authenticate, getAllConnections);


export default router;