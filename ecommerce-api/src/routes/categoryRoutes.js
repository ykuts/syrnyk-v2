import express from 'express';
import { createCategory, getCategories } from '../controllers/categoryController.js';

const router = express.Router();

// Add new category
router.post('/', createCategory);
router.get('/', getCategories)

export default router;
