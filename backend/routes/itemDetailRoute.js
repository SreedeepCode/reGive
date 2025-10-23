
import express from 'express';
import { getItemDetails } from '../controllers/itemDetailController.js';
// ... other routes
const router = express.Router();
// Route for single item details
router.get("/item/:id", getItemDetails); // ADD THIS ROUTE
export default router;

