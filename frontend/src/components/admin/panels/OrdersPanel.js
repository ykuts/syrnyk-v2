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
  Collapse,
  ButtonGroup,
  Offcanvas
} from 'react-bootstrap';
import {
  User, Phone, Mail, Calendar, DollarSign, Truck,
  Package, Edit3, MessageSquare, ChevronDown, ChevronUp,
  MapPin, Clock, Store, Settings, Download, Filter, X
} from 'lucide-react';
import { apiClient } from '../../../utils/api';
import OrderItemsEditor from './OrdersPanelComp/OrderItemsEditor';
import DeliveryEditor from './OrdersPanelComp/DeliveryEditor';
import './OrdersPanel.css';

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
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState({});

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
      'CANCELLED': 'danger',
      'REQUIRES_AGREEMENT': 'info'
    };
    return variants[status] || 'secondary';
  };

  // Translate order status to Ukrainian
  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': 'Нове',
      'REQUIRES_AGREEMENT': 'Треба домовитись',
      'CONFIRMED': 'Підтверджено',
      'DELIVERED': 'Виконано',
      'CANCELLED': 'Відмінено'
    };
    return labels[status] || status;
  };

  // Translate payment status to Ukrainian
  const getPaymentStatusLabel = (paymentStatus) => {
    const labels = {
      'PENDING': 'Очікування',
      'PAID': 'Сплачено',
      'REFUNDED': 'Повернення'
    };
    return labels[paymentStatus] || paymentStatus;
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
    const isExpanded = expandedOrder === order.id;

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
      <Card key={order.id} className="mb-3 mb-md-4 border-0 shadow-sm order-card-v2">
        <Card.Body className="p-3 p-md-4">
          {/* COMPACT HEADER */}
          <div className="mb-3">
            {/* Перша лінія: номер замовлення та сума */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-2">
                <Package size={18} />
                <span className="fw-bold">#{order.id}</span>
                {customerInfo.isGuest && (
                  <Badge bg="secondary" style={{ fontSize: '0.7rem' }}>Гість</Badge>
                )}
              </div>

              <div className="h4 mb-0 text-primary">
                ${Number(order.totalAmount).toFixed(2)}
              </div>
            </div>

            {/* Друга лінія: дата зліва */}
            <div className="mb-2">
              <small className="text-muted d-flex align-items-center">
                <Calendar className="me-1" size={12} />
                {new Date(order.createdAt).toLocaleDateString('uk-UA', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </small>
            </div>

            {/* Третя лінія: статуси українською */}
            <div className="d-flex gap-2 flex-wrap">
              <Badge
                bg={getStatusVariant(order.status)}
                className="px-2 py-1"
                style={{ fontSize: '0.75rem' }}
              >
                Статус: {getStatusLabel(order.status)}
              </Badge>
              <Badge
                bg={order.paymentStatus === 'PAID' ? 'success' : 'warning'}
                className="px-2 py-1"
                style={{ fontSize: '0.75rem' }}
              >
                Оплата: {getPaymentStatusLabel(order.paymentStatus)}
              </Badge>
            </div>
          </div>

          {/* CUSTOMER & DELIVERY */}
          <Row className="mb-3 g-2">
            <Col xs={12} md={6}>
              <div className="p-2 bg-light rounded">
                <div className="d-flex align-items-center mb-1">
                  <User className="me-2 text-muted flex-shrink-0" size={14} />
                  <span className="small fw-medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {customerInfo.name}
                  </span>
                </div>
                <div className="d-flex align-items-center">
                  <Phone className="me-2 text-muted flex-shrink-0" size={14} />
                  <a
                    href={`tel:${customerInfo.phone}`}
                    className="small text-decoration-none"
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {customerInfo.phone}
                  </a>
                </div>
              </div>
            </Col>

            <Col xs={12} md={6}>
              <div className="p-2 bg-light rounded">
                <div className="d-flex align-items-start">
                  {getDeliveryIcon(order.deliveryType)}
                  <div className="ms-2 flex-grow-1">
                    <div className="small fw-medium">Доставка</div>
                    <div className="small text-muted" style={{ wordBreak: 'break-word' }}>
                      {getDeliveryDetails(order)}
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* QUICK ACTIONS */}
          <div className="d-grid gap-2 d-md-flex mb-3">
            <Button
              variant={isExpanded ? "outline-secondary" : "primary"}
              size="sm"
              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
              className="d-flex align-items-center justify-content-center"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="me-2" size={16} />
                  <span className="d-none d-md-inline">Згорнути деталі</span>
                  <span className="d-md-none">Згорнути</span>
                </>
              ) : (
                <>
                  <ChevronDown className="me-2" size={16} />
                  <span className="d-none d-md-inline">Розгорнути деталі</span>
                  <span className="d-md-none">Детальніше</span>
                </>
              )}
            </Button>

            <Button
              variant="success"
              size="sm"
              onClick={() => openDeliveryEditor(order)}
              className="d-flex align-items-center justify-content-center"
            >
              <Truck className="me-2" size={16} />
              <span className="d-none d-md-inline">Управління доставкою</span>
              <span className="d-md-none">Доставка</span>
            </Button>
          </div>

          {/* EXPANDED CONTENT */}
          <Collapse in={isExpanded}>
            <div className="expanded-content-v2">
              <hr className="my-3" />

              {/* Status Management */}
              <Row className="mb-4 g-2">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-medium text-muted">
                      СТАТУС ЗАМОВЛЕННЯ
                    </Form.Label>
                    <Form.Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      size="sm"
                    >
                      <option value="PENDING">Нове</option>
                      <option value="REQUIRES_AGREEMENT">Треба домовитись</option>
                      <option value="CONFIRMED">Підтверджено</option>
                      <option value="DELIVERED">Виконано</option>
                      <option value="CANCELLED">Відмінено</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
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

              {/* Order Items */}
              <div className="items-section">
                {/* <h6 className="mb-3">
                  <Package className="me-2" size={16} />
                  Товари в замовленні
                </h6> */}
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

              {/* Full contact info - mobile only */}
              {/* <div className="mt-3 p-3 border rounded bg-light d-md-none">
                <h6 className="small fw-medium mb-2">Повна інформація</h6>
                <div className="small mb-2">
                  <Mail className="me-2" size={14} />
                  <a
                    href={`mailto:${customerInfo.email}`}
                    className="text-decoration-none"
                    style={{ wordBreak: 'break-all' }}
                  >
                    {customerInfo.email}
                  </a>
                </div>
              </div> */}

              {/* History - collapsible */}
              {order.changes && order.changes.length > 0 && (
                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">
                      <Clock className="me-2" size={16} />
                      Історія змін ({order.changes.length})
                    </h6>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setShowHistory(prev => ({
                        ...prev,
                        [order.id]: !prev[order.id]
                      }))}
                      className="p-0 text-decoration-none"
                    >
                      {showHistory[order.id] ? (
                        <>
                          <ChevronUp size={16} className="me-1" />
                          Приховати
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} className="me-1" />
                          Показати
                        </>
                      )}
                    </Button>
                  </div>

                  <Collapse in={showHistory[order.id]}>
                    <div>
                      <ListGroup variant="flush" className="border rounded">
                        {order.changes.map((change, index) => (
                          <ListGroup.Item key={index} className="small text-muted py-2">
                            {change}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </div>
                  </Collapse>
                </div>
              )}

              {/* Admin Notes */}
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
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => saveAdminNotes(order.id)}
                  className="mt-2 w-100 w-md-auto"
                >
                  Зберегти
                </Button>
              </Form.Group>

            </div>
          </Collapse>
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

      <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4">
        <h1 className="mb-0 d-none d-md-block">Замовлення</h1>
        <h4 className="mb-0 d-md-none">Замовлення</h4>

        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => setShowFilters(true)}
          className="d-md-none d-flex align-items-center"
        >
          <Filter size={16} className="me-2" />
          Фільтри
        </Button>
      </div>

      {/* Filters section */}
      <Row className="mb-4 d-none d-md-flex">
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

      <div className="mb-3 d-flex justify-content-between align-items-center">
        <small className="text-muted">
          {filteredOrders.length === orders.length
            ? `Всього: ${orders.length}`
            : `Показано ${filteredOrders.length} з ${orders.length}`
          }
        </small>

        {(filterStatus !== 'ALL' || filterPaymentStatus !== 'ALL') && (
          <Button
            variant="link"
            size="sm"
            className="text-decoration-none p-0 d-md-none"
            onClick={() => {
              setFilterStatus('ALL');
              setFilterPaymentStatus('ALL');
            }}
          >
            <X size={14} className="me-1" />
            Скинути
          </Button>
        )}
      </div>

      {/* Orders list */}
      {filteredOrders.map(renderOrder)}

      {/* MOBILE FILTERS OFFCANVAS */}
      <Offcanvas
        show={showFilters}
        onHide={() => setShowFilters(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Фільтри і сортування</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form.Group className="mb-3">
            <Form.Label>Статус замовлення</Form.Label>
            <Form.Select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
              }}
            >
              <option value="ALL">Усі статуси</option>
              <option value="PENDING">Нове</option>
              <option value="CONFIRMED">Підтверджено</option>
              <option value="DELIVERED">Доставлено</option>
              <option value="CANCELLED">Відмінено</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Статус оплати</Form.Label>
            <Form.Select
              value={filterPaymentStatus}
              onChange={(e) => {
                setFilterPaymentStatus(e.target.value);
              }}
            >
              <option value="ALL">Усі статуси</option>
              <option value="PENDING">Нові</option>
              <option value="PAID">Оплачені</option>
              <option value="REFUNDED">Повернення</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Сортування</Form.Label>
            <Form.Select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
              }}
            >
              <option value="date_desc">Нові спочатку</option>
              <option value="date_asc">Старі спочатку</option>
              <option value="amount_desc">Найбільша вартість</option>
              <option value="amount_asc">Найменша вартість</option>
            </Form.Select>
          </Form.Group>

          <Button
            variant="primary"
            className="w-100 mb-2"
            onClick={() => setShowFilters(false)}
          >
            Застосувати
          </Button>

          {(filterStatus !== 'ALL' || filterPaymentStatus !== 'ALL') && (
            <Button
              variant="outline-secondary"
              className="w-100"
              onClick={() => {
                setFilterStatus('ALL');
                setFilterPaymentStatus('ALL');
                setSortBy('date_desc');
              }}
            >
              Скинути всі фільтри
            </Button>
          )}
        </Offcanvas.Body>
      </Offcanvas>

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