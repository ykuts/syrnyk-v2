import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, images, isActive } = req.body;

    // Проверка обязательных полей
    if (!name || !description || !price || !categoryId) {
      return res.status(400).json({ 
        message: 'Необходимо указать название, описание, цену и категорию продукта.' 
      });
    }

    // Создание нового продукта
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock: stock || 0,      // по умолчанию 0
        categoryId,
        images: images || [],   // по умолчанию пустой массив
        isActive: isActive ?? true, // по умолчанию true
      },
    });

    res.status(201).json({
      message: 'Продукт успешно создан',
      product,
    });
  } catch (error) {
    console.error('Ошибка при создании продукта:', error);
    res.status(500).json({
      message: 'Ошибка при создании продукта',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a product by ID
export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

