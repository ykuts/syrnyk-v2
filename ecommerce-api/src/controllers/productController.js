import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Вспомогательная функция для обработки массива изображений
const processImages = (image, images) => {
  const mainImage = image || '';
  let imageArray = [];

  // Обрабатываем массив images
  if (Array.isArray(images) && images.length > 0) {
    imageArray = images;
  } else if (typeof images === 'string' && images) {
    imageArray = [images];
  }

  // Если есть главное изображение и его нет в массиве, добавляем
  if (mainImage && !imageArray.includes(mainImage)) {
    imageArray.push(mainImage);
  }

  return {
    mainImage,
    imageArray
  };
};

export const createProduct = async (req, res) => {
  try {
    let { 
      name, 
      description, 
      descriptionFull,
      price, 
      weight,
      image,
      images,
      umovy,
      recipe,
      assortment,
      stock, 
      categoryId, 
      isActive 
    } = req.body;

    console.log('Received images:', { image, images }); // Для отладки

    // Проверка обязательных полей
    if (!name || !description || !price || !categoryId || !weight) {
      return res.status(400).json({
        message: 'Необходимо указать название, описание, цену, вес и категорию продукта.'
      });
    }

    // Обработка изображений
    const { mainImage, imageArray } = processImages(image, images);

    console.log('Processed images:', { mainImage, imageArray }); // Для отладки

    // Создание нового продукта
    const product = await prisma.product.create({
      data: {
        name,
        description,
        descriptionFull: descriptionFull || description,
        price: parseFloat(price),
        weight,
        image: mainImage,
        images: imageArray,
        umovy: umovy || '',
        recipe: recipe || '',
        assortment: Array.isArray(assortment) ? assortment : [],
        stock: parseInt(stock) || 0,
        categoryId: parseInt(categoryId),
        isActive: isActive ?? true,
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

// Get all products with category
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a product by ID with category
export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true
      }
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let { 
      name, 
      description, 
      descriptionFull,
      price, 
      weight,
      image,
      images,
      umovy,
      recipe,
      assortment,
      stock, 
      categoryId, 
      isActive 
    } = req.body;

    console.log('Update received images:', { image, images }); // Для отладки

    // Валидация обязательных полей
    if (!name || !description || !price || !categoryId || !weight) {
      return res.status(400).json({
        message: 'Необходимо указать название, описание, цену, вес и категорию продукта.'
      });
    }

    // Обработка изображений
    const { mainImage, imageArray } = processImages(image, images);

    console.log('Update processed images:', { mainImage, imageArray }); // Для отладки

    // Подготавливаем данные для обновления
    const updateData = {
      name,
      description,
      descriptionFull: descriptionFull || description,
      price: parseFloat(price),
      weight,
      image: mainImage,
      images: imageArray,
      umovy: umovy || '',
      recipe: recipe || '',
      assortment: Array.isArray(assortment) ? assortment : [],
      stock: parseInt(stock) || 0,
      categoryId: parseInt(categoryId),
      isActive: isActive ?? true
    };

    // Обновляем продукт
    const updatedProduct = await prisma.product.update({
      where: {
        id: parseInt(id)
      },
      data: updateData,
      include: {
        category: true
      }
    });

    res.json({
      message: 'Продукт успешно обновлен',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Ошибка при обновлении продукта:', error);
    res.status(500).json({
      message: 'Ошибка при обновлении продукта',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Продукт успешно удален' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};