import express from 'express';
import { checkAuth, login, signup, updateProfile } from '../controllers/userController.js';
import { protectRoute } from '../middleware/auth.js';

const UserRouter = express.Router();

UserRouter.post('/signup', signup);
UserRouter.post('/login', login);
UserRouter.put("/update-profile", protectRoute, updateProfile)
UserRouter.get("/check-auth", protectRoute, checkAuth )

export default UserRouter;