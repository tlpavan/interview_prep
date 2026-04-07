import express from "express";
import { careerPath } from "../controllers/career.controller.js";

const router = express.Router();

router.post("/path", careerPath);

export default router;
