import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import ImageManager from './ImageManager';

const ProductForm = ({ show, onHide, onSave, product, categories, loading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    descriptionFull: '',
    price: '',
    weight: '',
    image: '',
    images: '',
    umovy: '',
    recipe: '',
    categoryId: '',
    assortment: '',
    stock: 0,
    isActive: true
  });

  // Заполняем форму при открытии для редактирования
  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        assortment: product.assortment?.join('\n') || '',
        categoryId: product.categoryId.toString()
      });
    } else {
      // Сброс формы при создании нового продукта
      setFormData({
        name: '',
        description: '',
        descriptionFull: '',
        price: '',
        weight: '',
        image: '',
        images: '',
        umovy: '',
        recipe: '',
        categoryId: '',
        assortment: '',
        stock: 0,
        isActive: true
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Преобразуем данные перед отправкой
    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      categoryId: parseInt(formData.categoryId),
      // Убедимся, что assortment всегда массив
      assortment: formData.assortment
        ? formData.assortment
            .split('\n')
            .map(item => item.trim())
            .filter(item => item)
        : [],
      // Убедимся, что images всегда массив
        images: Array.isArray(formData.images) ? formData.images : [],
        image: formData.image || ''
        /* images: formData.image ? [formData.image] : [] */
    };
  
    onSave(submitData);
  };

  const handleImagesChange = (newImages) => {
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleMainImageChange = (newMainImage) => {
    setFormData(prev => ({
      ...prev,
      image: newMainImage
    }));
  };


  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {product ? 'Редактировать продукт' : 'Добавить продукт'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Название</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Категория</Form.Label>
            <Form.Select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
            >
              <option value="">Выберите категорию</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Краткое описание</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Полное описание</Form.Label>
            <Form.Control
              as="textarea"
              name="descriptionFull"
              value={formData.descriptionFull}
              onChange={handleInputChange}
            />
          </Form.Group>

          <div className="row">
            <Form.Group className="col-md-6 mb-3">
              <Form.Label>Цена (CHF)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="col-md-6 mb-3">
              <Form.Label>Вес</Form.Label>
              <Form.Control
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </div>

          <ImageManager
            images={formData.images || []}
            mainImage={formData.image}
            onImagesChange={handleImagesChange}
            onMainImageChange={handleMainImageChange}
          />

          <Form.Group className="mb-3">
            <Form.Label>Условия хранения</Form.Label>
            <Form.Control
              type="text"
              name="umovy"
              value={formData.umovy}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Рецепт приготовления</Form.Label>
            <Form.Control
              as="textarea"
              name="recipe"
              value={formData.recipe}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ассортимент (каждый вариант с новой строки)</Form.Label>
            <Form.Control
              as="textarea"
              name="assortment"
              value={formData.assortment}
              onChange={handleInputChange}
            />
          </Form.Group>

          <div className="row">
            <Form.Group className="col-md-6 mb-3">
              <Form.Label>Количество на складе</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="col-md-6 mb-3 d-flex align-items-center">
              <Form.Check
                type="checkbox"
                label="Активен"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
            </Form.Group>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Отмена
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProductForm;