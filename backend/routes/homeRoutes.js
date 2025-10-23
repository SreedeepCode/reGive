
import express from 'express';
import { getHomePage } from '../controllers/homeController.js';

const router = express.Router();

// Maps the root URL (/) to the getHomePage controller
router.get('/', getHomePage);

export default router;