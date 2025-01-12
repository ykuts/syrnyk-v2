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
        await apiClient.delete(`/products/${id}`);
        await fetchProducts();
    } catch (err) {
        setError('Помилка при видаленні продукту');
        console.error(err);
    }
};

  // Opening the form for editing
  const handleEdit = (product) => {
    setSelectedProduct(product);
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
      
      <ProductList 
        products={products}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onAddNew={() => {
          setSelectedProduct(null);
          setShowModal(true);
        }}
      />

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