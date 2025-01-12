import React, { useState } from 'react';
import { Card, Button, Row, Col, Form, Alert, Badge } from 'react-bootstrap';
import { X, Star, StarFill } from 'react-bootstrap-icons';
import { apiClient } from '../../../../utils/api';
import { getImageUrl } from '../../../../config';

const ImageManager = ({ images, mainImage, onImagesChange, onMainImageChange }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [imageErrors, setImageErrors] = useState({});

  const defaultImageUrl = '/placeholder.png';

  const handleImageError = (imageUrl) => {
    if (!imageErrors[imageUrl]) {
      setImageErrors(prev => ({
        ...prev,
        [imageUrl]: true
      }));
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
  
    setUploading(true);
    setError(null);
  
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
  
    try {
      const data = await apiClient.upload('/upload/products', formData);
      
      const newImages = [...(images || []), ...data.urls];
      onImagesChange(newImages);
      
      if (!mainImage && data.urls.length > 0) {
        onMainImageChange(data.urls[0]);
      }
    } catch (err) {
      setError('Failed to upload images');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageUrl) => {
    try {
      const filename = imageUrl.split('/').pop();
      await apiClient.delete(`/upload/products/${filename}`);
  
      const newImages = (images || []).filter(img => img !== imageUrl);
      onImagesChange(newImages);
  
      if (imageUrl === mainImage) {
        onMainImageChange(newImages[0] || '');
      }
    } catch (err) {
      setError('Failed to delete image');
      console.error(err);
    }
  };

  const handleSetMainImage = (imageUrl) => {
    onMainImageChange(imageUrl);
  };

  return (
    <div className="mb-4">
      <h5 className="mb-3">Зображення</h5>
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <div className="mb-3">
        <Form.Group>
          <Form.Label>Завантажити зображення</Form.Label>
          <Form.Control
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </Form.Group>
      </div>

      <Row xs={2} md={4} className="g-3">
        {(images || []).map((imageUrl, index) => (
          <Col key={index}>
            <Card>
              <Card.Img
                variant="top"
                src={imageErrors[imageUrl] ? defaultImageUrl : getImageUrl(imageUrl, 'product')}
                style={{ height: '150px', objectFit: 'cover' }}
                onError={() => handleImageError(imageUrl)}
              />
              <div className="position-absolute top-0 end-0 p-2">
                <Button
                  variant="danger"
                  size="sm"
                  className="rounded-circle p-1"
                  onClick={() => handleDeleteImage(imageUrl)}
                >
                  <X size={16} />
                </Button>
              </div>
              <div className="position-absolute top-0 start-0 p-2">
                <Button
                  variant={imageUrl === mainImage ? "warning" : "light"}
                  size="sm"
                  className="rounded-circle p-1"
                  onClick={() => handleSetMainImage(imageUrl)}
                >
                  {imageUrl === mainImage ? (
                    <StarFill size={16} />
                  ) : (
                    <Star size={16} />
                  )}
                </Button>
              </div>
              {imageUrl === mainImage && (
                <Badge 
                  bg="warning" 
                  className="position-absolute bottom-0 start-0 m-2"
                >
                  Головне фото
                </Badge>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ImageManager;