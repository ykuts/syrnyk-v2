import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Card, 
  Badge, 
  Spinner, 
  Alert,
  Button,
  Form,
  ListGroup,
  Row,
  Col
} from 'react-bootstrap';

const AdminPage = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [adminComments, setAdminComments] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        fetch('http://localhost:3001/api/orders/all'),
        fetch('http://localhost:3001/api/products')
      ]);

      if (!ordersResponse.ok || !productsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [ordersData, productsData] = await Promise.all([
        ordersResponse.json(),
        productsResponse.json()
      ]);

      // Преобразуем массив продуктов в объект для быстрого доступа
      const productsMap = productsData.reduce((acc, product) => {
        acc[product.id] = product;
        return acc;
      }, {});

      setOrders(ordersData);
      setProducts(productsMap);

      // Инициализация комментариев админа
      const comments = {};
      ordersData.forEach(order => {
        comments[order.id] = order.notes || '';
      });
      setAdminComments(comments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusVariant = (status) => {
    const statusVariants = {
      'PENDING': 'warning',
      'CONFIRMED': 'primary',
      'DELIVERED': 'success',
      'CANCELLED': 'danger',
      'PAID': 'success',
      'REFUNDED': 'warning'
    };
    return statusVariants[status] || 'secondary';
  };

  const getPaymentMethodLabel = (method) => {
    const methodLabels = {
      'CREDIT_CARD': 'Кредитная карта',
      'DEBIT_CARD': 'Дебетовая карта',
      'BANK_TRANSFER': 'Банковский перевод',
      'TWINT': 'TWINT',
      'CASH': 'Наличные'
    };
    return methodLabels[method] || method;
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, paymentStatus: newStatus } : order
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAdminCommentChange = async (orderId, comment) => {
    setAdminComments(prev => ({ ...prev, [orderId]: comment }));
    
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/notes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: comment }),
      });

      if (!response.ok) {
        throw new Error('Failed to update admin notes');
      }
    } catch (err) {
      setError(err.message);
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
    <Container fluid className="py-4">
      <h1 className="mb-4">Панель адміністратора</h1>
      {orders.map((order) => (
        <Card key={order.id} className="mb-4">
          <Card.Body>
            <Row>
              <Row>
                <Col>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="mb-0">Замовлення #{order.id} от {formatDate(order.createdAt)}</h5>
                    <Badge bg={getStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  </Col>
                </Row>
                <Col md={8} > 
                <Row className="text-start">
                  <Col md={6}>
                    <p><strong>Клієнт:</strong> {order.user.firstName} {order.user.lastName}</p>
                    <p><strong>Email:</strong> {order.user.email}</p>
                    <p><strong>Телефон:</strong> {order.user.phone}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Сумма замовлення:</strong> {Number(order.totalAmount).toLocaleString()} CHF</p>
                    <p><strong>Спосіб оплати:</strong> {order.paymentMethod}</p>
                    <p>
                      <strong>Статус оплати:</strong>{' '}
                      <Badge bg={getStatusVariant(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </p>
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col>
                    <p><strong>Адреса доставки:</strong> {order.address.city}, {order.address.station}</p>
                  </Col>
                </Row>
              </Col>
              <Col md={4}>
              <Form.Group className="mb-3 text-start">
                <Form.Label><strong>Статус замовлення</strong></Form.Label>
                <Form.Select 
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  <option value="PENDING">Нове замовлення</option>
                  <option value="CONFIRMED">Затверждено</option>
                  <option value="DELIVERED">Виконано</option>
                  <option value="CANCELLED">Відміна</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3 text-start">
                <Form.Label><strong>Статус оплати</strong></Form.Label>
                <Form.Select 
                  value={order.paymentStatus}
                  onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                >
                  <option value="PENDING">Очікує оплати</option>
                  <option value="PAID">Оплачено</option>
                  <option value="REFUNDED">Повернення</option>
                </Form.Select>
              </Form.Group>
              <p><strong>Спосіб оплати:</strong> {getPaymentMethodLabel(order.paymentMethod)}</p>
              <Button
                variant="outline-primary"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="w-100"
              >
                {expandedOrder === order.id ? 'Скрыть детали' : 'Показать детали'}
              </Button>
            </Col>
            </Row>

            {expandedOrder === order.id && (
              <div className="mt-4">
                <h6 className="mb-3">Товари в замовленні:</h6>
                <ListGroup className="mb-4">
                  {order.items.map((item) => (
                    <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{products[item.productId]?.name || `Product ID: ${item.productId}`}</strong>
                        {products[item.productId]?.description && (
                          <p className="text-muted mb-0 small">{products[item.productId].description}</p>
                        )}
                      </div>
                      <div className="text-end">
                        <div>Количество: {item.quantity}</div>
                        <div>Цена: {Number(item.price).toLocaleString()} CHF</div>
                        <div className="text-muted small">
                          Всього: {(Number(item.price) * item.quantity).toLocaleString()} CHF
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>

                <Form.Group className="mb-3">
                  <Form.Label>Коментар адміністратора:</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={adminComments[order.id] || ''}
                    onChange={(e) => handleAdminCommentChange(order.id, e.target.value)}
                    placeholder="Додати коментар..."
                  />
                </Form.Group>

                {order.trackingNumber && (
                  <p><strong>Номер відстеження:</strong> {order.trackingNumber}</p>
                )}
              </div>
            )}
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
};

export default AdminPage;