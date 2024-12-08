import React, { useState, useEffect } from 'react';
import { Container, Alert, Spinner } from 'react-bootstrap';
import ProductList from './ProductsPanelsComp/ProductList';
import ProductForm from './ProductsPanelsComp/ProductForm';
import { useTranslation } from 'react-i18next';

const ProductsPanel = () => {
  const { t } = useTranslation();
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError('Ошибка при загрузке продуктов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

 
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError('Ошибка при загрузке категорий');
      console.error(err);
    }
  };

  // Удаление продукта
  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот продукт?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      await fetchProducts(); // Обновляем список после удаления
    } catch (err) {
      setError('Ошибка при удалении продукта');
      console.error(err);
    }
  };

  // Открытие формы для редактирования
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Создание или обновление продукта
  const handleSave = async (productData) => {
    setLoading(true);
    try {
      const url = selectedProduct
        ? `${process.env.REACT_APP_API_URL}/api/products/${selectedProduct.id}`
        : `${process.env.REACT_APP_API_URL}/api/products/add`;

      const method = selectedProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Failed to save product');
      }

      await fetchProducts(); 
      setShowModal(false);
      setSelectedProduct(null);
    } catch (err) {
      setError('Ошибка при сохранении продукта');
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