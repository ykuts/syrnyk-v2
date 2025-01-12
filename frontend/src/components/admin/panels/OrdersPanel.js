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
import { apiClient } from '../../../utils/api';

const OrdersPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');

  // Auth headers for all requests
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/admin/orders', getAuthHeaders());
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await apiClient.patch(
        `/orders/${orderId}/status`, 
        { status: newStatus },
        getAuthHeaders()
      );
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      setError(err.message);
      console.error('Error updating order status:', err);
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      await apiClient.patch(
        `/orders/${orderId}/payment-status`,
        { paymentStatus: newStatus },
        getAuthHeaders()
      );
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, paymentStatus: newStatus } : order
      ));
    } catch (err) {
      setError(err.message);
      console.error('Error updating payment status:', err);
    }
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function for status badge variants
  const getStatusVariant = (status) => {
    const variants = {
      'PENDING': 'warning',
      'CONFIRMED': 'primary',
      'DELIVERED': 'success',
      'CANCELLED': 'danger'
    };
    return variants[status] || 'secondary';
  };

  // Helper function for delivery details
  const getDeliveryDetails = (order) => {
    switch (order.deliveryType) {
      case 'ADDRESS':
        return order.addressDelivery ? 
          `${order.addressDelivery.city}, ${order.addressDelivery.street} ${order.addressDelivery.house}` :
          'Адресу не зазначено';
      case 'RAILWAY_STATION':
        return order.stationDelivery ?
          `Railway Station: ${order.stationDelivery.station?.name}, Time: ${formatDate(order.stationDelivery.meetingTime)}` :
          'Станцію не обрано';
      case 'PICKUP':
        return order.pickupDelivery ?
          `Pickup: ${order.pickupDelivery.store?.name}, Time: ${formatDate(order.pickupDelivery.pickupTime)}` :
          'Магазин не обрано';
      default:
        return 'Не обрано метод доставки';
    }
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      if (filterStatus !== 'ALL' && order.status !== filterStatus) return false;
      if (filterPaymentStatus !== 'ALL' && order.paymentStatus !== filterPaymentStatus) return false;
      return true;
    })
    .sort((a, b) => {
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

  if (loading && !orders.length) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Завантаження...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      <h1 className="mb-4">Замовлення</h1>
      
      <Row className="mb-4">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Статус замовлення</Form.Label>
            <Form.Select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Усі статуси</option>
              <option value="PENDING">Нові</option>
              <option value="CONFIRMED">Підтверджені</option>
              <option value="DELIVERED">Доставлені</option>
              <option value="CANCELLED">Відмінені</option>
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
              <option value="ALL">Усі статуси</option>
              <option value="PENDING">Нові</option>
              <option value="PAID">Оплачені</option>
              <option value="REFUNDED">Повернуто</option>
            </Form.Select>
          </Form.Group>
        </Col>
        
        <Col md={3}>
          <Form.Group>
            <Form.Label>Відсортувати</Form.Label>
            <Form.Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date_desc">Спочатку нові</option>
              <option value="date_asc">Спочатку старі</option>
              <option value="amount_desc">Найбільше</option>
              <option value="amount_asc">Найменше</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <div className="mb-3">
        <p className="text-muted">
          {filteredOrders.length === orders.length 
            ? `Усього замовлень: ${orders.length}`
            : `Showing ${filteredOrders.length} of ${orders.length} orders`
          }
        </p>
      </div>

      {filteredOrders.map((order) => (
        <Card key={order.id} className="mb-4">
          <Card.Body>
            <Row>
              <Col md={8}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Замовлення №{order.id}</h5>
                  <Badge bg={getStatusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                
                <p><strong>Дата:</strong> {formatDate(order.createdAt)}</p>
                <p><strong>Клієнт:</strong> {order.user?.firstName} {order.user?.lastName}</p>
                <p><strong>Email:</strong> {order.user?.email}</p>
                <p><strong>Телефон:</strong> {order.user?.phone}</p>
                <p><strong>Загальна вартість:</strong> ${Number(order.totalAmount).toFixed(2)}</p>
                <p><strong>Доставка:</strong> {getDeliveryDetails(order)}</p>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Статус замовлення</Form.Label>
                  <Form.Select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    <option value="PENDING">Нове</option>
                    <option value="CONFIRMED">Підтверджено</option>
                    <option value="DELIVERED">Доставлено</option>
                    <option value="CANCELLED">Відмінено</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Статус оплати</Form.Label>
                  <Form.Select 
                    value={order.paymentStatus}
                    onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                  >
                    <option value="PENDING">Нове</option>
                    <option value="PAID">Оплачено</option>
                    <option value="REFUNDED">Повернення</option>
                  </Form.Select>
                </Form.Group>

                <Button
                  variant="outline-primary"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="w-100"
                >
                  {expandedOrder === order.id ? 'Приховати деталі' : 'Детальніше'}
                </Button>
              </Col>
            </Row>

            {expandedOrder === order.id && (
              <div className="mt-4">
                <h6>Позиції у замовленні:</h6>
                <ListGroup>
                  {order.items?.map((item) => (
                    <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <span>{item.product?.name}</span>
                        <small className="text-muted d-block">
                          Кількість: {item.quantity}
                        </small>
                      </div>
                      <span>${Number(item.price).toFixed(2)}</span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
};

export default OrdersPanel;