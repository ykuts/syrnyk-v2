import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all categories
export const getCategories = async (req, res) => {
    try {
      const categories = await prisma.category.findMany();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// Create new category
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Checking required fields
    if (!name) {
      return res.status(400).json({ 
        message: 'Название категории обязательно' 
      });
    }

    // Check if a category with the same name exists
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return res.status(400).json({ 
        message: 'Категория с таким именем уже существует' 
      });
    }

    
    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json({
      message: 'Категория успешно создана',
      category,
    });
  } catch (error) {
    console.error('Ошибка при создании категории:', error);
    res.status(500).json({
      message: 'Ошибка при создании категории',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
