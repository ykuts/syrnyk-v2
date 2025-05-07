import React, { useState, useEffect } from 'react';
import { Container, Alert, Spinner } from 'react-bootstrap';
import ProductList from './ProductsPanelsComp/ProductList';
import ProductForm from './ProductsPanelsComp/ProductForm';
import { apiClient } from '../../../utils/api';
//import { useTranslation } from 'react-i18next';

const ProductsPanel = () => {
  //const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reorderStatus, setReorderStatus] = useState({
    saving: false,
    success: false
  });


  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);


  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/products');
      setProducts(data);
    } catch (err) {
      setError('Помилка під час завантаження продуктів');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

 
  const fetchCategories = async () => {
    try {
      const data = await apiClient.get('/categories');
      setCategories(data);
    } catch (err) {
      setError('Помилка під час завантаження категорій');
      console.error(err);
    }
  };

  
  const handleDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що бажаєте видалити цей продукт?')) {
        return;
    }
    
    try {
      const product = products.find(p => p.id === id);
    
    // Delete main image and additional images if they exist
    if (product.image || (product.images && product.images.length > 0)) {
      const allImages = [product.image, ...(product.images || [])].filter(Boolean);
      
      for (const imagePath of allImages) {
        const filename = imagePath.split('/').pop();
        try {
          await apiClient.delete(`/upload/products/${filename}`);
        } catch (err) {
          console.error('Error deleting image:', imagePath, err);
        }
      }
    }

        await apiClient.delete(`/products/${id}`);
        await fetchProducts();
    } catch (err) {
        setError('Помилка при видаленні продукту');
        console.error(err);
    }
};

  // Opening the form for editing
  const handleEdit = (product) => {
    const cleanedProduct = {
      ...product,
      image: product.image ? product.image.replace(/^\/+/, '') : '',
      images: (product.images || []).map(img => img.replace(/^\/+/, ''))
    };

    setSelectedProduct(cleanedProduct);
    setShowModal(true);
  };

  // Creating or updating a product
  const handleSave = async (productData) => {
    setLoading(true);
    try {
        if (selectedProduct) {
            // Use PUT instead of POST for updates
            await apiClient.put(`/products/${selectedProduct.id}`, productData);
        } else {
            await apiClient.post('/products/add', productData);
        }
        
        await fetchProducts();
        setShowModal(false);
        setSelectedProduct(null);
    } catch (err) {
        setError('Помилка при збереженні продукту');
        console.error(err);
    } finally {
        setLoading(false);
    }
};

// handle reordering
const handleReorder = async (reorderedProducts) => {
  setReorderStatus({ saving: true, success: false });
  try {
    // Prepare updates array with only id and displayOrder
    const updates = reorderedProducts.map((product) => ({
      id: product.id,
      displayOrder: product.displayOrder
    }));
    
    // Send updates to backend
    await apiClient.post('/products/update-order', { updates });
    
    // Update local products state
    setProducts(reorderedProducts);
    
    // Show success message
    setReorderStatus({ saving: false, success: true });
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setReorderStatus(prev => ({ ...prev, success: false }));
    }, 3000);
  } catch (err) {
    setError('Помилка під час збереження порядку продуктів');
    console.error(err);
    setReorderStatus({ saving: false, success: false });
  }
};

if (loading && !products.length) {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
      <Spinner animation="border" />
    </Container>
  );
}

return (
  <Container className="py-4">
    {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
    {reorderStatus.success && <Alert variant="success">Порядок продуктів успішно збережено</Alert>}
    
    <ProductList 
  products={products}
  onDelete={handleDelete}
  onEdit={handleEdit}
  onAddNew={() => {
    setSelectedProduct(null);
    setShowModal(true);
  }}
  onReorder={handleReorder}
/>

    {reorderStatus.saving && (
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
        <Alert variant="info">
          Зберігаємо порядок продуктів...
        </Alert>
      </div>
    )}

    <ProductForm
      show={showModal}
      onHide={() => {
        setShowModal(false);
        setSelectedProduct(null);
      }}
      onSave={handleSave}
      product={selectedProduct}
      categories={categories}
      loading={loading}
    />
  </Container>
);
};

export default ProductsPanel;