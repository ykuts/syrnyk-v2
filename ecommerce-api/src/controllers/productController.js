// ecommerce-api/src/controllers/productController.js
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
     isActive,
     translations // New field for translations
   } = req.body;

   console.log('Received data:', { image, images }); // For debugging

   // Checking required fields
   if (!name || !description || !price || !categoryId || !weight) {
     return res.status(400).json({
       message: 'All required fields must be provided: name, description, price, category, and weight'
     });
   }

   // Image processing
   const { mainImage, imageArray } = processImages(image, images);

   console.log('Processed images:', { mainImage, imageArray }); // For debugging

   // Base product data
   const productData = {
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
   };
   
   // Add translations if provided
   if (translations && Object.keys(translations).length > 0) {
     productData.translations = {
       create: Object.entries(translations).map(([language, data]) => ({
         language,
         name: data.name || null,
         description: data.description || null,
         descriptionFull: data.descriptionFull || null,
         weight: data.weight || null,
         umovy: data.umovy || null,
         recipe: data.recipe || null,
         // Convert assortment array if it exists
         assortment: Array.isArray(data.assortment) ? data.assortment : []
       }))
     };
   }

   // Create product with translations
   const product = await prisma.product.create({
     data: productData,
     include: {
       category: true,
       translations: true
     }
   });

   res.status(201).json({
     message: 'Product successfully created',
     product,
   });
 } catch (error) {
   console.error('Error creating product:', error);
   res.status(500).json({
     message: 'Error creating product',
     error: process.env.NODE_ENV === 'development' ? error.message : undefined,
   });
 }
};

// Get all products with translations
export const getProducts = async (req, res) => {
 try {
   // Get the requested language from query parameter or header
   const lang = req.query.lang || req.headers['accept-language']?.split(',')[0]?.substring(0, 2) || 'uk';

   const products = await prisma.product.findMany({
     include: {
       category: true,
       translations: {
         where: {
           language: lang
         }
       }
     },
      orderBy: {
        displayOrder: 'asc'
      }
   });
   
   // Transform the response to merge translations with base product data
   const transformedProducts = products.map(product => {
     const translation = product.translations[0] || {};
     
     return {
       ...product,
       // Apply translation if available, otherwise keep original value
       name: translation.name || product.name,
       description: translation.description || product.description,
       descriptionFull: translation.descriptionFull || product.descriptionFull,
       weight: translation.weight || product.weight,
       umovy: translation.umovy || product.umovy,
       recipe: translation.recipe || product.recipe,
       // Clean up the response
       translations: undefined
     };
   });
   
   res.json(transformedProducts);
 } catch (error) {
   console.error('Error fetching products:', error);
   res.status(500).json({ message: error.message });
 }
};

// Get a product by ID with translations
export const getProductById = async (req, res) => {
 const { id } = req.params;
 const lang = req.query.lang || req.headers['accept-language']?.split(',')[0]?.substring(0, 2) || 'uk';

 try {
   const product = await prisma.product.findUnique({
     where: { id: parseInt(id) },
     include: {
       category: true,
       translations: true // Get all translations
     }
   });
   
   if (!product) {
     return res.status(404).json({ message: 'Product not found' });
   }

   // Transform response to make translations more accessible
   const currentTranslation = product.translations.find(t => t.language === lang);
   
   const transformedProduct = {
     ...product,
     // Apply current language translation if available
     name: currentTranslation?.name || product.name,
     description: currentTranslation?.description || product.description,
     descriptionFull: currentTranslation?.descriptionFull || product.descriptionFull,
     weight: currentTranslation?.weight || product.weight,
     umovy: currentTranslation?.umovy || product.umovy,
     recipe: currentTranslation?.recipe || product.recipe,
     // Format all translations as an object for easier access
     translations: product.translations.reduce((acc, translation) => {
       acc[translation.language] = {
         name: translation.name,
         description: translation.description,
         descriptionFull: translation.descriptionFull,
         weight: translation.weight,
         umovy: translation.umovy,
         recipe: translation.recipe,
         assortment: translation.assortment
       };
       return acc;
     }, {})
   };

   res.json(transformedProduct);
 } catch (error) {
   console.error('Error fetching product by ID:', error);
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
     isActive,
     translations // For translations
   } = req.body;

   // Check if product exists
   const existingProduct = await prisma.product.findUnique({
     where: { id: parseInt(id) },
     include: { translations: true }
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

   // Handle translations within a transaction
   const result = await prisma.$transaction(async (prisma) => {
     // Update base product
     const updatedProduct = await prisma.product.update({
       where: {
         id: parseInt(id)
       },
       data: updateData,
       include: {
         category: true,
         translations: true
       }
     });

     // Handle translations if provided
     if (translations && Object.keys(translations).length > 0) {
       // Delete existing translations
       await prisma.productTranslation.deleteMany({
         where: { productId: parseInt(id) }
       });

       // Create new translations
       for (const [language, data] of Object.entries(translations)) {
         if (data && Object.keys(data).some(key => data[key])) {
           await prisma.productTranslation.create({
             data: {
               productId: parseInt(id),
               language,
               name: data.name || null,
               description: data.description || null,
               descriptionFull: data.descriptionFull || null,
               weight: data.weight || null,
               umovy: data.umovy || null,
               recipe: data.recipe || null,
               assortment: Array.isArray(data.assortment) ? data.assortment : []
             }
           });
         }
       }

       // Get updated product with translations
       return await prisma.product.findUnique({
         where: { id: parseInt(id) },
         include: {
           category: true,
           translations: true
         }
       });
     }

     return updatedProduct;
   });

   if (!result) {
     throw new Error('Failed to update product');
   }

   res.json({
     message: 'Product updated successfully',
     product: result
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
   // First delete associated translations (should happen automatically with cascading delete)
   await prisma.product.delete({
     where: { id: parseInt(id) }
   });

   res.json({ message: 'Product successfully deleted' });
 } catch (error) {
   console.error('Error deleting product:', error);
   res.status(500).json({ message: error.message });
 }
};

// Get all available languages for translations
export const getAvailableLanguages = async (req, res) => {
 try {
   // Get distinct languages from the database
   const languages = await prisma.productTranslation.findMany({
     select: {
       language: true
     },
     distinct: ['language']
   });
   
   // Map to simple array of language codes
   const languageCodes = languages.map(l => l.language);
   
   // Add default language if not already present
   if (!languageCodes.includes('uk')) {
     languageCodes.push('uk');
   }
   
   res.json({
     languages: languageCodes
   });
 } catch (error) {
   console.error('Error fetching available languages:', error);
   res.status(500).json({ message: error.message });
 }
};

export const updateProductOrder = async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({ message: 'Updates must be an array' });
    }
    
    // Use transaction to ensure all updates succeed or fail together
    const result = await prisma.$transaction(
      updates.map(update => 
        prisma.product.update({
          where: { id: parseInt(update.id) },
          data: { displayOrder: update.displayOrder }
        })
      )
    );
    
    res.status(200).json({
      message: 'Product order updated successfully',
      updatedCount: result.length
    });
  } catch (error) {
    console.error('Error updating product order:', error);
    res.status(500).json({
      message: 'Error updating product order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};