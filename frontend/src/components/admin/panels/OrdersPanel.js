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
  const [adminNotes, setAdminNotes] = useState({});

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

      // Initialize admin notes from orders
      const notesObj = {};
      data.orders.forEach(order => {
        notesObj[order.id] = order.notesAdmin || '';
      });
      setAdminNotes(notesObj);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };


   // Handle admin notes change
   const handleAdminNotesChange = (orderId, value) => {
    setAdminNotes(prev => ({
      ...prev,
      [orderId]: value
    }));
  };

  // Save admin notes
  const saveAdminNotes = async (orderId) => {
    try {
      await apiClient.patch(
        `/orders/${orderId}/notes`,
        { notesAdmin: adminNotes[orderId] },
        getAuthHeaders()
      );
      
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, notesAdmin: adminNotes[orderId] } 
          : order
      ));
      
      setError(null);
    } catch (err) {
      setError('Failed to save admin notes');
      console.error('Error saving admin notes:', err);
    }
  };

  // Get customer information (handles both registered and guest users)
  const getCustomerInfo = (order) => {
    console.log('Order data:', order);
    if (order.user) {
      return {
        name: `${order.user.firstName} ${order.user.lastName}`,
        email: order.user.email,
        phone: order.user.phone,
        isGuest: false
      };
    }
    
    if (order.guestInfo) {
      return {
        name: `${order.guestInfo.firstName} ${order.guestInfo.lastName}`,
        email: order.guestInfo.email,
        phone: order.guestInfo.phone,
        isGuest: true
      };
    }

    return {
      name: 'Unknown Customer',
      email: 'N/A',
      phone: 'N/A',
      isGuest: true
    };
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

  /*if (loading && !orders.length) {
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
}; */

 // Render single order
 const renderOrder = (order) => {
  const customerInfo = getCustomerInfo(order);

  return (
    <Card key={order.id} className="mb-4">
      <Card.Body>
        <Row>
          <Col md={8}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>
                Order #{order.id}
                {customerInfo.isGuest && (
                  <Badge bg="info" className="ms-2">Guest Order</Badge>
                )}
              </h5>
              <Badge bg={getStatusVariant(order.status)}>
                {order.status}
              </Badge>
            </div>
            
            <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
            <p><strong>Customer:</strong> {customerInfo.name}</p>
            <p><strong>Email:</strong> {customerInfo.email}</p>
            <p><strong>Phone:</strong> {customerInfo.phone}</p>
            <p><strong>Total Amount:</strong> ${Number(order.totalAmount).toFixed(2)}</p>
            <p><strong>Delivery:</strong> {getDeliveryDetails(order)}</p>
            
            {order.notesClient && (
              <div className="mb-3">
                <strong>Customer Notes:</strong>
                <Alert variant="info" className="mt-2">
                  {order.notesClient}
                </Alert>
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label><strong>Admin Notes:</strong></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={adminNotes[order.id] || ''}
                onChange={(e) => handleAdminNotesChange(order.id, e.target.value)}
                placeholder="Add administrative notes here..."
              />
              <div className="mt-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => saveAdminNotes(order.id)}
                >
                  Save Notes
                </Button>
              </div>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Order Status</Form.Label>
              <Form.Select 
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Payment Status</Form.Label>
              <Form.Select 
                value={order.paymentStatus}
                onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="REFUNDED">Refunded</option>
              </Form.Select>
            </Form.Group>

            <Button
              variant="outline-primary"
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              className="w-100"
            >
              {expandedOrder === order.id ? 'Hide Details' : 'Show Details'}
            </Button>
          </Col>
        </Row>

        {expandedOrder === order.id && (
          <div className="mt-4">
            <h6>Order Items:</h6>
            <ListGroup>
              {order.items?.map((item) => (
                <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                  <div>
                    <span>{item.product?.name}</span>
                    <small className="text-muted d-block">
                      Quantity: {item.quantity}
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
  );
};

if (loading && !orders.length) {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
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
    
    <h1 className="mb-4">Orders</h1>
    
    {/* Filters section */}
    <Row className="mb-4">
      <Col md={3}>
        <Form.Group>
          <Form.Label>Order Status</Form.Label>
          <Form.Select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </Form.Select>
        </Form.Group>
      </Col>
      
      <Col md={3}>
        <Form.Group>
          <Form.Label>Payment Status</Form.Label>
          <Form.Select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="REFUNDED">Refunded</option>
          </Form.Select>
        </Form.Group>
      </Col>
      
      <Col md={3}>
        <Form.Group>
          <Form.Label>Sort By</Form.Label>
          <Form.Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </Form.Select>
        </Form.Group>
      </Col>
    </Row>

    <div className="mb-3">
      <p className="text-muted">
        {filteredOrders.length === orders.length 
          ? `Total Orders: ${orders.length}`
          : `Showing ${filteredOrders.length} of ${orders.length} orders`
        }
      </p>
    </div>

    {/* Orders list */}
    {filteredOrders.map(renderOrder)}
  </Container>
);
};

export default OrdersPanel;