import express from 'express';
import Message from '../models/Message.js';
import { getMessages, getUsersForSidebar, markMessagesAsSeen, sendMessage } from '../controllers/messageController.js';
import { protectRoute } from '../middleware/auth.js';

const messageRouter = express.Router();

messageRouter.get('/users', protectRoute, getUsersForSidebar);
messageRouter.get('/:id', protectRoute, getMessages);
messageRouter.put('/mark/:id', protectRoute, markMessagesAsSeen);
messageRouter.post('/send/:id', protectRoute, sendMessage);


export default messageRouter;