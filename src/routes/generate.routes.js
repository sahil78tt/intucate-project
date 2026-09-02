import express from "express";
import { generate } from "../controllers/generate.controllers.js";

const router = express.Router();

router.post("/", generate);

export default router;
