import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function for processing an array of images
const processImages = (image, images) => {
  const mainImage = image || '';
  let imageArray = [];

  // Processing an array of images
  if (Array.isArray(images) && images.length > 0) {
    imageArray = images;
  } else if (typeof images === 'string' && images) {
    imageArray = [images];
  }

  // If there is a main image and it is not in the array, we add it
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

    // Checking required fields
    if (!name || !description || !price || !categoryId || !weight) {
      return res.status(400).json({
        message: 'Необходимо указать название, описание, цену, вес и категорию продукта.'
      });
    }

    // Image processing
    const { mainImage, imageArray } = processImages(image, images);

    console.log('Processed images:', { mainImage, imageArray }); // Для отладки

    // Create new product
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    // Validation of required fields
    if (!name || !description || !price || !categoryId || !weight) {
      return res.status(400).json({
        message: 'All required fields must be provided: name, description, price, category, and weight'
      });
    }

    // Image processing with additional checks
    const { mainImage, imageArray } = processImages(image, images);

    console.log('Updating product:', {
      id,
      mainImage,
      imageArray,
      categoryId
    });

    // Preparing data for update with type conversion
    const updateData = {
      name,
      description,
      descriptionFull: descriptionFull || description,
      price: typeof price === 'string' ? parseFloat(price) : price,
      weight,
      image: mainImage,
      images: imageArray,
      umovy: umovy || '',
      recipe: recipe || '',
      assortment: Array.isArray(assortment) ? assortment : [],
      stock: typeof stock === 'string' ? parseInt(stock) : (stock || 0),
      categoryId: typeof categoryId === 'string' ? parseInt(categoryId) : categoryId,
      isActive: isActive ?? true
    };

    // Update product with error handling
    const updatedProduct = await prisma.product.update({
      where: {
        id: parseInt(id)
      },
      data: updateData,
      include: {
        category: true
      }
    });

    if (!updatedProduct) {
      throw new Error('Failed to update product');
    }

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Error updating product:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return res.status(404).json({
        message: 'Product not found',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(500).json({
      message: 'Error updating product',
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