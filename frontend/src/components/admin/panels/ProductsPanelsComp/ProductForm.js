import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
//import { useTranslation } from 'react-i18next';
import ImageManager from './ImageManager';

const ProductForm = ({ show, onHide, onSave, product, categories, loading }) => {
  /* const { t } = useTranslation(); */
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

  // Fill the form when opening for editing
  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        assortment: product.assortment?.join('\n') || '',
        categoryId: product.categoryId.toString()
      });
    } else {
      // Reset form when creating a new product
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
    
    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      categoryId: parseInt(formData.categoryId),
      // Ensure assortment is always an array
      assortment: formData.assortment
        ? formData.assortment
            .split('\n')
            .map(item => item.trim())
            .filter(item => item)
        : [],
      // Ensure images is always an array and image is a string
      images: Array.isArray(formData.images) ? formData.images : [],
      image: formData.image || ''
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
          {product ? 'Edit Product' : 'Add Product'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Short Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Full Description</Form.Label>
            <Form.Control
              as="textarea"
              name="descriptionFull"
              value={formData.descriptionFull}
              onChange={handleInputChange}
            />
          </Form.Group>

          <div className="row">
            <Form.Group className="col-md-6 mb-3">
              <Form.Label>Price (CHF)</Form.Label>
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
              <Form.Label>Weight</Form.Label>
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
            <Form.Label>Storage Conditions</Form.Label>
            <Form.Control
              type="text"
              name="umovy"
              value={formData.umovy}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Cooking Recipe</Form.Label>
            <Form.Control
              as="textarea"
              name="recipe"
              value={formData.recipe}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Assortment (each variant on a new line)</Form.Label>
            <Form.Control
              as="textarea"
              name="assortment"
              value={formData.assortment}
              onChange={handleInputChange}
            />
          </Form.Group>

          <div className="row">
            <Form.Group className="col-md-6 mb-3">
              <Form.Label>Stock Quantity</Form.Label>
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
                label="Active"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
            </Form.Group>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProductForm;