import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Badge,
  Spinner,
  Alert,
  Button,
  Form,
  Row,
  Col,
  Modal,
  ListGroup,
  Collapse, ButtonGroup
} from 'react-bootstrap';
import { 
  User, Phone, Mail, Calendar, DollarSign, Truck, 
  Package, Edit3, MessageSquare, ChevronDown, ChevronUp,
  MapPin, Clock, Store, Settings, Download
} from 'lucide-react';
import { apiClient } from '../../../utils/api';
import OrderItemsEditor from './OrdersPanelComp/OrderItemsEditor';
import DeliveryEditor from './OrdersPanelComp/DeliveryEditor';

const OrdersPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');
  const [adminNotes, setAdminNotes] = useState({});
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false);
  const [stations, setStations] = useState([]);
  const [showDeliveryEditor, setShowDeliveryEditor] = useState(false);
  const [currentEditingOrder, setCurrentEditingOrder] = useState(null);

  // Auth headers for all requests
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    fetchOrders();
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await apiClient.get('/railway-stations');
      console.log('API response:', response);

      if (response.data && Array.isArray(response.data)) {
        setStations(response.data);
        console.log('Stations loaded:', response.data);
      } else {
        console.error('Unexpected API response structure:', response);
      }
    } catch (err) {
      console.error('Error fetching stations:', err);
    }
  };


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


  const handleSendNotification = async () => {
    setSendingNotification(true);
    try {
      await apiClient.post(
        `/orders/${currentOrderId}/notify-changes`,
        {
          message: notificationMessage
        },
        getAuthHeaders()
      );

      // Обновляем заказ в состоянии
      const updatedOrders = orders.map(order => {
        if (order.id === currentOrderId) {
          return { ...order, lastNotificationSent: new Date() };
        }
        return order;
      });
      setOrders(updatedOrders);

      setShowNotificationModal(false);
      setNotificationMessage('');
    } catch (error) {
      setError('Failed to send notification');
    } finally {
      setSendingNotification(false);
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

  const handleDeliveryUpdate = (updatedOrder) => {
    setOrders(orders.map(order =>
      order.id === updatedOrder.id ? updatedOrder : order
    ));
  };

  const openDeliveryEditor = (order) => {
    setCurrentEditingOrder(order);
    setShowDeliveryEditor(true);
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
        {
          status: newStatus
        },
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

  const getStationNameById = (stationId) => {
    console.log('Looking for station ID:', stationId, 'type:', typeof stationId);
    console.log('Available stations:', stations);


    if (!stations.length) {
      return 'Завантаження станцій...';
    }

    const station = stations.find(s => s.id == stationId);
    console.log('Found station:', station);


    if (station) {
      console.log('Found station city:', station.city);
      return station.city;
    }

    return `Station ID: ${stationId}`;
  };

  // Helper function for delivery details
  const getDeliveryDetails = (order) => {
    switch (order.deliveryType) {
      case 'ADDRESS':
        return order.addressDelivery ?
          `${order.addressDelivery.city}, ${order.addressDelivery.street} ${order.addressDelivery.house}` :
          'Адресу не зазначено';

      case 'RAILWAY_STATION':
        if (order.deliveryStationId) {
          const stationName = getStationNameById(order.deliveryStationId);
          const meetingTime = order.deliveryDate ? formatDate(order.deliveryDate) : 'час не вказано';

          if (stationName.startsWith('Station ID:')) {
            return `Невідома станція (ID: ${order.deliveryStationId}) - ${meetingTime}`;
          }

          return `${stationName} (${meetingTime})`;
        }
        return 'Станцію не обрано';

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

  // Render single order
  const renderOrder = (order) => {
  const customerInfo = getCustomerInfo(order);

  if (order.deliveryType === 'RAILWAY_STATION' && !stations.length) {
    return (
      <Card key={order.id} className="mb-4">
        <Card.Body>Завантаження станцій...</Card.Body>
      </Card>
    );
  }

  const getDeliveryIcon = (deliveryType) => {
    switch (deliveryType) {
      case 'ADDRESS': return <MapPin size={16} className="text-info" />;
      case 'RAILWAY_STATION': return <Truck size={16} className="text-primary" />;
      case 'PICKUP': return <Store size={16} className="text-success" />;
      default: return <Package size={16} />;
    }
  };

  return (
    <Card key={order.id} className="mb-4 border-0 shadow-sm order-card-v2">
      <Card.Body className="p-0">
        <Row className="g-0">
          {/* ОСНОВНА ІНФОРМАЦІЯ */}
          <Col lg={9} md={8}>
            <div className="p-4">
              {/* Заголовок заказа */}
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 className="mb-1 d-flex align-items-center">
                    <Package className="me-2" size={20} />
                    Замовлення #{order.id}
                    {customerInfo.isGuest && (
                      <Badge bg="secondary" className="ms-2 fs-6">Гість</Badge>
                    )}
                  </h5>
                  <small className="text-muted">
                    <Calendar className="me-1" size={14} />
                    {formatDate(order.createdAt)}
                  </small>
                </div>
                
                <div className="text-end">
                  <div className="h4 mb-1 text-primary">
                    ${Number(order.totalAmount).toFixed(2)}
                  </div>
                  <div>
                    <Badge bg={getStatusVariant(order.status)} className="me-1">
                      {order.status}
                    </Badge>
                    <Badge bg={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Информация о клиенте */}
              <Row className="mb-3">
                <Col md={6}>
                  <div className="customer-info-compact">
                    <div className="d-flex align-items-center mb-1">
                      <User className="me-2 text-muted" size={16} />
                      <span className="fw-medium">{customerInfo.name}</span>
                    </div>
                    <div className="d-flex align-items-center mb-1">
                      <Mail className="me-2 text-muted" size={16} />
                      <span className="small text-muted">{customerInfo.email}</span>
                    </div>
                    {customerInfo.phone && (
                      <div className="d-flex align-items-center">
                        <Phone className="me-2 text-muted" size={16} />
                        <span className="small text-muted">{customerInfo.phone}</span>
                      </div>
                    )}
                  </div>
                </Col>
                
                <Col md={6}>
                  <div className="delivery-info-compact">
                    <div className="d-flex align-items-start">
                      {getDeliveryIcon(order.deliveryType)}
                      <div className="ms-2">
                        <div className="small fw-medium">Доставка</div>
                        <div className="small text-muted">
                          {getDeliveryDetails(order)}
                        </div>
                        {order.deliveryDate && (
                          <div className="small text-muted mt-1">
                            <Clock className="me-1" size={12} />
                            {formatDate(order.deliveryDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Развернутая секция */}
              <Collapse in={expandedOrder === order.id}>
                <div className="expanded-content-v2">
                  <hr className="my-3" />
                  
                  {/* Управление статусами */}
                  <Row className="mb-4">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-medium text-muted">
                          СТАТУС ЗАМОВЛЕННЯ
                        </Form.Label>
                        <Form.Select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          size="sm"
                        >
                          <option value="PENDING">Нове</option>
                          <option value="CONFIRMED">Підтверджено</option>
                          <option value="DELIVERED">Доставлено</option>
                          <option value="CANCELLED">Відмінено</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-medium text-muted">
                          СТАТУС ОПЛАТИ
                        </Form.Label>
                        <Form.Select
                          value={order.paymentStatus}
                          onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                          size="sm"
                        >
                          <option value="PENDING">Очікування</option>
                          <option value="PAID">Сплачено</option>
                          <option value="REFUNDED">Повернення</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Комментарий администратора */}
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-medium text-muted">
                      КОМЕНТАР АДМІНІСТРАТОРА
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={adminNotes[order.id] || ''}
                      onChange={(e) => handleAdminNotesChange(order.id, e.target.value)}
                      placeholder="Внутрішні нотатки..."
                      size="sm"
                    />
                    <div className="mt-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => saveAdminNotes(order.id)}
                      >
                        Зберегти
                      </Button>
                    </div>
                  </Form.Group>

                  {/* Товары в заказе */}
                  <div className="items-section">
                    <h6 className="mb-3">
                      <Package className="me-2" size={16} />
                      Товари в замовленні
                    </h6>
                    <div className="border rounded p-3 bg-light">
                      <OrderItemsEditor
                        order={order}
                        onOrderUpdate={(updatedOrder) => {
                          setOrders(orders.map(o =>
                            o.id === updatedOrder.id ? updatedOrder : o
                          ));
                        }}
                        getAuthHeaders={getAuthHeaders}
                        onOrderChange={() => {
                          setCurrentOrderId(order.id);
                        }}
                      />
                    </div>
                  </div>

                  {/* История изменений */}
                  {order.changes && order.changes.length > 0 && (
                    <div className="mt-4">
                      <h6 className="mb-3">
                        <Clock className="me-2" size={16} />
                        Історія змін
                      </h6>
                      <ListGroup variant="flush" className="border rounded">
                        {order.changes.slice(0, 3).map((change, index) => (
                          <ListGroup.Item key={index} className="small text-muted py-2">
                            {change}
                          </ListGroup.Item>
                        ))}
                        {order.changes.length > 3 && (
                          <ListGroup.Item className="text-center py-2">
                            <Button variant="link" size="sm" className="p-0">
                              Показати всі ({order.changes.length})
                            </Button>
                          </ListGroup.Item>
                        )}
                      </ListGroup>
                    </div>
                  )}
                </div>
              </Collapse>
            </div>
          </Col>

          {/* ПАНЕЛЬ ДЕЙСТВИЙ (БОКОВАЯ) */}
          <Col lg={3} md={4} className="border-start bg-light">
            <div className="p-3 d-flex flex-column h-100">
              <div className="mb-3">
                <small className="text-muted fw-medium">ШВИДКІ ДІЇ</small>
              </div>
              
              {/* Основные действия */}
              <div className="d-grid gap-2 mb-3">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => openDeliveryEditor(order)}
                  className="d-flex align-items-center justify-content-start"
                >
                  <Truck className="me-2" size={16} />
                  Управління доставкою
                </Button>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="d-flex align-items-center justify-content-start"
                >
                  {expandedOrder === order.id ? (
                    <>
                      <ChevronUp className="me-2" size={16} />
                      Згорнути деталі
                    </>
                  ) : (
                    <>
                      <ChevronDown className="me-2" size={16} />
                      Розгорнути деталі
                    </>
                  )}
                </Button>
                
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => {
                    setCurrentOrderId(order.id);
                    setShowNotificationModal(true);
                  }}
                  className="d-flex align-items-center justify-content-start"
                >
                  <MessageSquare className="me-2" size={16} />
                  Повідомити клієнта
                </Button>
              </div>

              {/* <hr className="my-3" /> */}

              {/* Дополнительные действия */}
              {/* <div className="mb-3">
                <small className="text-muted fw-medium">ДОДАТКОВО</small>
              </div>
              
              <div className="d-grid gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="d-flex align-items-center justify-content-start"
                >
                  <Download className="me-2" size={16} />
                  Експорт
                </Button>
                
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="d-flex align-items-center justify-content-start"
                >
                  <Settings className="me-2" size={16} />
                  Налаштування
                </Button>
              </div> */}

              {/* Быстрая информация внизу */}
              <div className="mt-auto pt-3 border-top">
                <div className="small text-muted">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Товарів:</span>
                    <span className="fw-medium">{order.items?.length || 0}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Сума:</span>
                    <span className="fw-medium text-success">
                      ${Number(order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                  {order.deliveryDate && (
                    <div className="d-flex justify-content-between">
                      <span>Доставка:</span>
                      <span className="fw-medium">
                        {new Date(order.deliveryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

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

      {/* Filters section */}
      <Row className="mb-4">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Статус замовлення</Form.Label>
            <Form.Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Усі статуси</option>
              <option value="PENDING">Нове</option>
              <option value="CONFIRMED">Підтверджено</option>
              <option value="DELIVERED">Доставлено</option>
              <option value="CANCELLED">Відмінено</option>
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
              <option value="REFUNDED">Повернення</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label>Відсотровано за</Form.Label>
            <Form.Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date_desc">Нові спочатку</option>
              <option value="date_asc">Старі спочатку</option>
              <option value="amount_desc">Найбільша вартість</option>
              <option value="amount_asc">Найменша вартість</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <div className="mb-3">
        <p className="text-muted">
          {filteredOrders.length === orders.length
            ? `Загальна кількість замовлень: ${orders.length}`
            : `Показано ${filteredOrders.length} з ${orders.length} замовлень`
          }
        </p>
      </div>

      {/* Orders list */}
      {filteredOrders.map(renderOrder)}

      {/* Notification Modal */}
      <Modal
        show={showNotificationModal}
        onHide={() => {
          setShowNotificationModal(false);
          setNotificationMessage('');
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Відправити повідомлення клієнту</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Текст повідомлення</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              placeholder="Опишіть зміни в замовленні або інформацію для клієнта..."
            />
            <Form.Text className="text-muted">
              Клієнт отримає цей текст разом з оновленими деталями замовлення
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowNotificationModal(false);
              setNotificationMessage('');
            }}
          >
            Скасувати
          </Button>
          <Button
            variant="primary"
            onClick={handleSendNotification}
            disabled={sendingNotification || !notificationMessage.trim()}
          >
            {sendingNotification ? 'Відправка...' : 'Відправити'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delivery Editor Modal */}
      <DeliveryEditor
        show={showDeliveryEditor}
        onHide={() => {
          setShowDeliveryEditor(false);
          setCurrentEditingOrder(null);
        }}
        order={currentEditingOrder}
        onDeliveryUpdate={handleDeliveryUpdate}
        getAuthHeaders={getAuthHeaders}
      />
    </Container>
  );
};

export default OrdersPanel;