import express from "express";


import { getSearchResults } from "../controllers/itemController.js";
const router = express.Router();
router.get("/search", getSearchResults);
export default router;
