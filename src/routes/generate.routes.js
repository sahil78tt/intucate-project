import express from "express";
import {
  generate,
  generateMultiple,
} from "../controllers/generate.controllers.js";

const router = express.Router();

router.post("/", generate);
router.post("/multiple", generateMultiple);

export default router;
