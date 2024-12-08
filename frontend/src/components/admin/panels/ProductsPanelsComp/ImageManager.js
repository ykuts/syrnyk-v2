import React, { useState } from 'react';
import { Card, Button, Row, Col, Form, Alert, Badge } from 'react-bootstrap';
import { X, Star, StarFill } from 'react-bootstrap-icons';

const ImageManager = ({ images, mainImage, onImagesChange, onMainImageChange }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [imageErrors, setImageErrors] = useState({});

  // Вспомогательная функция для формирования полного URL изображения
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\/uploads\//, '');
    return `${process.env.REACT_APP_API_URL}/uploads/${cleanPath}`;
  };

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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/upload/products`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      
      // Добавляем новые изображения к существующим
      const newImages = [...(images || []), ...data.urls];
      onImagesChange(newImages);
      
      // Если это первое изображение, делаем его главным
      if (!mainImage && data.urls.length > 0) {
        onMainImageChange(data.urls[0]);
      }
    } catch (err) {
      setError('Failed to upload images');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageUrl) => {
    try {
      // Получаем только имя файла из полного пути
      const filename = imageUrl.split('/').pop();
      await fetch(`${process.env.REACT_APP_API_URL}/api/upload/products/${filename}`, {
        method: 'DELETE',
      });

      // Удаляем изображение из списка
      const newImages = (images || []).filter(img => img !== imageUrl);
      onImagesChange(newImages);

      // Если удалили главное изображение, выбираем новое главное
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
      <h5 className="mb-3">Изображения продукта</h5>
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <div className="mb-3">
        <Form.Group>
          <Form.Label>Загрузить изображения</Form.Label>
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
                src={imageErrors[imageUrl] ? defaultImageUrl : getImageUrl(imageUrl)}
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
                  Главное фото
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