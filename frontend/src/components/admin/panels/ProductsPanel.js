import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Card, 
  Button, 
  Table, 
  Form, 
  Modal,
  Spinner,
  Alert
} from 'react-bootstrap';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const ProductsPanel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          Ошибка: {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Управління продукцією</h2>
        <Button 
          variant="primary" 
          onClick={() => {
            setCurrentProduct(null);
            setShowModal(true);
          }}
          className="d-flex align-items-center gap-2"
        >
          <Plus size={20} />
          Додати продукт
        </Button>
      </div>

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Изображение</th>
                <th>Название</th>
                <th>Категория</th>
                <th>Цена</th>
                <th>В наличии</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>
                    {product.imageUrl && (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.price} CHF</td>
                  <td>{product.inStock}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => {
                          setCurrentProduct(product);
                          setShowModal(true);
                        }}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Модальное окно для добавления/редактирования продукта */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentProduct ? 'Редактировать продукт' : 'Добавить новый продукт'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Название</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Введите название продукта"
                defaultValue={currentProduct?.name}
              />
            </Form.Group>
            {/* Добавьте остальные поля формы */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Отмена
          </Button>
          <Button variant="primary">
            {currentProduct ? 'Сохранить изменения' : 'Добавить продукт'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductsPanel;