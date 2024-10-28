import express from 'express';
import { createCategory, getCategories } from '../controllers/categoryController.js';

const router = express.Router();

// Добавление новой категории
router.post('/', createCategory);
router.get('/', getCategories)

export default router;
