import express from 'express';
import { generateAgenticSuggestions, generateSuggestions } from '../controllers/ai.controller.js';
const router = express.Router();

router.post('/', generateSuggestions);
router.post('/agentic', generateAgenticSuggestions);

export default router;