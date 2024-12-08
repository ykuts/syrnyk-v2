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

const OrdersPanel = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [adminComments, setAdminComments] = useState({});
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/orders/all`),
        fetch(`${process.env.REACT_APP_API_URL}/api/products`)
      ]);

      if (!ordersResponse.ok || !productsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [ordersData, productsData] = await Promise.all([
        ordersResponse.json(),
        productsResponse.json()
      ]);

      const productsMap = productsData.reduce((acc, product) => {
        acc[product.id] = product;
        return acc;
      }, {});

      setOrders(ordersData);
      setProducts(productsMap);
      
      const comments = {};
      ordersData.forEach(order => {
        comments[order.id] = order.notesAdmin || '';
      });
      setAdminComments(comments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('uk-UA', {
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
      'CANCELLED': 'danger'
    };
    return statusVariants[status] || 'secondary';
  };

  const getDeliveryDetails = (order) => {
    switch (order.deliveryType) {
      case 'ADDRESS':
        return order.addressDelivery ? 
          `${order.addressDelivery.city}, ${order.addressDelivery.street} ${order.addressDelivery.house}` :
          'Адреса не вказана';
      case 'RAILWAY_STATION':
        return order.stationDelivery ?
          `Залізнична станція: ${order.stationDelivery.station?.name}, Час: ${formatDate(order.stationDelivery.meetingTime)}` :
          'Станція не вказана';
      case 'PICKUP':
        return order.pickupDelivery ?
          `Самовивіз: ${order.pickupDelivery.store?.name}, Час: ${formatDate(order.pickupDelivery.pickupTime)}` :
          'Магазин не вказаний';
      default:
        return 'Тип доставки не вказаний';
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}/status`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}/payment-status`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}/notes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notesAdmin: comment }),
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
          <span className="visually-hidden">Завантаження...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          Помилка: {error}
        </Alert>
      </Container>
    );
  }

  const filteredOrders = orders.filter(order => {
    if (filterStatus !== 'ALL' && order.status !== filterStatus) return false;
    if (filterPaymentStatus !== 'ALL' && order.paymentStatus !== filterPaymentStatus) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date_asc':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'date_desc':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'amount_asc':
        return Number(a.totalAmount) - Number(b.totalAmount);
      case 'amount_desc':
        return Number(b.totalAmount) - Number(a.totalAmount);
      default:
        return 0;
    }
  });

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Замовлення</h1>
      
      <Row className="mb-4">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Статус замовлення</Form.Label>
            <Form.Select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Всі статуси</option>
              <option value="PENDING">Нові замовлення</option>
              <option value="CONFIRMED">Підтверджені</option>
              <option value="DELIVERED">Виконані</option>
              <option value="CANCELLED">Скасовані</option>
            </Form.Select>
          </Form.Group>
        </Col>
        
        <Col md={3}>
          <Form.Group>
            <Form.Label>Статус оплати</Form.Label>
            <Form.Select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
            >
              <option value="ALL">Всі статуси</option>
              <option value="PENDING">Очікує оплати</option>
              <option value="PAID">Оплачено</option>
              <option value="REFUNDED">Повернення</option>
            </Form.Select>
          </Form.Group>
        </Col>
        
        <Col md={3}>
          <Form.Group>
            <Form.Label>Сортування</Form.Label>
            <Form.Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date_desc">Спочатку нові</option>
              <option value="date_asc">Спочатку старі</option>
              <option value="amount_desc">Спочатку дорожчі</option>
              <option value="amount_asc">Спочатку дешевші</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      
      <div className="mb-3">
        <p className="text-muted">
          {filteredOrders.length === orders.length 
            ? `Всього замовлень: ${orders.length}`
            : `Показано ${filteredOrders.length} з ${orders.length} замовлень`
          }
        </p>
      </div>
      {filteredOrders.map((order) => (
        <Card key={order.id} className="mb-4">
          <Card.Body>
            <Row>
              <Row>
                <Col>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="mb-0">Замовлення #{order.id} від {formatDate(order.createdAt)}</h5>
                    <Badge bg={getStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </Col>
              </Row>
              <Col md={8}>
                <Row className="text-start">
                  <Col md={6}>
                    <p><strong>Клієнт:</strong> {order.user?.firstName} {order.user?.lastName}</p>
                    <p><strong>Email:</strong> {order.user?.email}</p>
                    <p><strong>Телефон:</strong> {order.user?.phone}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Сума замовлення:</strong> {Number(order.totalAmount).toLocaleString()} CHF</p>
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
                    <p><strong>Доставка:</strong> {getDeliveryDetails(order)}</p>
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
                    <option value="CONFIRMED">Підтверджено</option>
                    <option value="DELIVERED">Виконано</option>
                    <option value="CANCELLED">Скасовано</option>
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
                <Button
                  variant="outline-primary"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="w-100"
                >
                  {expandedOrder === order.id ? 'Приховати деталі' : 'Показати деталі'}
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
                        <div>Кількість: {item.quantity}</div>
                        <div>Ціна: {Number(item.price).toLocaleString()} CHF</div>
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

export default OrdersPanel;