import React, { useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2 } from 'lucide-react';

const ProductList = ({ products, onDelete, onEdit, onAddNew }) => {
  const { t } = useTranslation();
  // Состояние для отслеживания ошибок загрузки изображений
  const [imageErrors, setImageErrors] = useState({});

  // Вспомогательная функция для формирования URL изображения
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // Убираем возможное дублирование /uploads/
    const cleanPath = path.replace(/^\/uploads\//, '');
    return `${process.env.REACT_APP_API_URL}/uploads/${cleanPath}`;
  };

  // URL изображения по умолчанию
  const defaultImageUrl = '/placeholder.jpg';

  const handleImageError = (productId) => {
    if (!imageErrors[productId]) {
      setImageErrors(prev => ({
        ...prev,
        [productId]: true
      }));
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Управление продуктами</h2>
        <Button onClick={onAddNew}>Добавить продукт</Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Зображення</th>
            <th>Назва</th>
            <th>Категорія</th>
            <th>Ціна</th>
            <th>Вага</th>
            <th>Склад</th>
            <th>Дія</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>
                {product.image && !imageErrors[product.id] ? (
                  <img 
                    src={getImageUrl(product.image)}
                    alt={product.name} 
                    style={{ height: '40px', width: '40px', objectFit: 'cover' }} 
                    onError={() => handleImageError(product.id)}
                  />
                ) : (
                  <img 
                    src={defaultImageUrl}
                    alt="Placeholder" 
                    style={{ height: '40px', width: '40px', objectFit: 'cover' }}
                  />
                )}
              </td>
              <td>{product.name}</td>
              <td>{product.category?.name}</td>
              <td>{product.price} CHF</td>
              <td>{product.weight}</td>
              <td>{product.stock}</td>
              <td>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => onEdit(product)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => onDelete(product.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ProductList;