// frontend/src/components/admin/panels/ProductionReport/ProductionReport.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Badge,
  Collapse,
  ListGroup,
  ButtonGroup
} from 'react-bootstrap';
import { Calendar, MapPin, Package, Truck, ChevronDown, ChevronUp, List } from 'lucide-react';
import { apiClient } from '../../../../utils/api';
import './ProductionReport.css';

const ProductionReport = () => {
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 days
    canton: 'ALL',
    deliveryType: 'ALL',
    status: 'CONFIRMED'
  });

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('production'); // 'production' or 'details'
  /* const [showOrderDetails, setShowOrderDetails] = useState(false); */
  const [expandedCustomers, setExpandedCustomers] = useState({});

  useEffect(() => {
    loadProductionReport();
  }, [filters.startDate, filters.endDate, filters.canton, filters.deliveryType, filters.status]);

  const loadProductionReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.canton !== 'ALL' && { canton: filters.canton }),
        ...(filters.deliveryType !== 'ALL' && { deliveryType: filters.deliveryType }),
        status: filters.status
      });

      const response = await apiClient.get(
        `/admin/production-report?${params.toString()}`,
        {
          'Authorization': `Bearer ${token}`
        }
      );

      setReportData(response);
    } catch (err) {
      console.error('Error loading production report:', err);
      setError(err.response?.data?.error || 'Failed to load production report');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const getDeliveryTypeLabel = (type) => {
    const labels = {
      'ADDRESS': 'Адресна',
      'RAILWAY_STATION': 'ЖД станція',
      'PICKUP': 'Самовивіз',
      'ALL': 'Усі типи'
    };
    return labels[type] || type;
  };

  const toggleCustomerInfo = (orderId) => {
    setExpandedCustomers(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  return (
    <Container fluid className="production-report-container">
      <div className="production-report-header mb-4">
        <h2>📦 Виробничий звіт</h2>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end g-3">
            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label className="d-flex align-items-center gap-2">
                  <Calendar size={18} />
                  Дата з
                </Form.Label>
                <Form.Control
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label className="d-flex align-items-center gap-2">
                  <Calendar size={18} />
                  Дата по
                </Form.Label>
                <Form.Control
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={2}>
              <Form.Group>
                <Form.Label className="d-flex align-items-center gap-2">
                  <MapPin size={18} />
                  Кантон
                </Form.Label>
                <Form.Select
                  value={filters.canton}
                  onChange={(e) => handleFilterChange('canton', e.target.value)}
                >
                  <option value="ALL">Усі</option>
                  <option value="VD">Vaud</option>
                  <option value="GE">Geneva</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={2}>
              <Form.Group>
                <Form.Label className="d-flex align-items-center gap-2">
                  <Truck size={18} />
                  Тип доставки
                </Form.Label>
                <Form.Select
                  value={filters.deliveryType}
                  onChange={(e) => handleFilterChange('deliveryType', e.target.value)}
                >
                  <option value="ALL">Усі типи</option>
                  <option value="ADDRESS">Адресна</option>
                  <option value="RAILWAY_STATION">ЖД станція</option>
                  <option value="PICKUP">Самовивіз</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={2}>
              <Form.Group>
                <Form.Label>Статус</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="ALL">Усі статуси</option>
                  <option value="CONFIRMED">Підтверджено</option>
                  <option value="PENDING">Нове</option>
                  <option value="DELIVERED">Виконано</option>
                  <option value="CANCELLED">Скасовано</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={2}>
              <Button
                variant="primary"
                className="w-100"
                onClick={loadProductionReport}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : 'Оновити'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* View Mode Toggle */}
      {reportData && (
        <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="mb-0">Режим перегляду:</h5>
          <ButtonGroup>
            <Button
              variant={viewMode === 'production' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('production')}
            >
              <Package size={18} className="me-2" />
              Виробництво
            </Button>
            <Button
              variant={viewMode === 'details' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('details')}
            >
              <List size={18} className="me-2" />
              Деталі
            </Button>
          </ButtonGroup>
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Завантаження...</p>
        </div>
      )}

      {/* Content */}
      {!loading && reportData && (
        <>
          {/* Summary */}
          <Card className="mb-4 summary-card">
            <Card.Body>
              <Row className="text-center">
                <Col xs={6} md={3} className="mb-3 mb-md-0">
                  <div className="summary-item">
                    <div className="summary-value text-primary">
                      {reportData.summary.totalOrders}
                    </div>
                    <div className="summary-label">Замовлень</div>
                  </div>
                </Col>
                <Col xs={6} md={3} className="mb-3 mb-md-0">
                  <div className="summary-item">
                    <div className="summary-value text-success">
                      {reportData.summary.totalProducts}
                    </div>
                    <div className="summary-label">Одиниць</div>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="summary-item">
                    <div className="summary-value text-info">
                      {formatCurrency(reportData.summary.totalAmount)}
                    </div>
                    <div className="summary-label">Сума</div>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="summary-item">
                    <div className="summary-value text-secondary">
                      {reportData.products.length}
                    </div>
                    <div className="summary-label">Найменувань</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Production View */}
          {viewMode === 'production' && (
            <>
              {/* Products List */}
              {reportData.productsByDeliveryType && filters.deliveryType === 'ALL' ? (
                // Grouped by delivery type
                <>
                  {/* Address Delivery */}
                  {reportData.productsByDeliveryType.ADDRESS.length > 0 && (
                    <Card className="mb-3 products-card">
                      <Card.Header className="bg-primary text-white">
                        <h6 className="mb-0">
                          🏠 Адресна доставка ({reportData.productsByDeliveryType.ADDRESS.reduce((sum, p) => sum + p.totalQuantity, 0)} шт)
                        </h6>
                      </Card.Header>
                      <ListGroup variant="flush">
                        {reportData.productsByDeliveryType.ADDRESS.map((product) => (
                          <ListGroup.Item key={product.id} className="product-item">
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="product-name">{product.name}</div>
                              <Badge bg="primary" className="product-quantity">
                                {product.totalQuantity} шт
                              </Badge>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Card>
                  )}

                  {/* Railway Station */}
                  {reportData.productsByDeliveryType.RAILWAY_STATION.length > 0 && (
                    <Card className="mb-3 products-card">
                      <Card.Header className="bg-info text-white">
                        <h6 className="mb-0">
                          🚂 ЖД станції ({reportData.productsByDeliveryType.RAILWAY_STATION.reduce((sum, p) => sum + p.totalQuantity, 0)} шт)
                        </h6>
                      </Card.Header>
                      <ListGroup variant="flush">
                        {reportData.productsByDeliveryType.RAILWAY_STATION.map((product) => (
                          <ListGroup.Item key={product.id} className="product-item">
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="product-name">{product.name}</div>
                              <Badge bg="info" className="product-quantity">
                                {product.totalQuantity} шт
                              </Badge>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Card>
                  )}

                  {/* Pickup */}
                  {reportData.productsByDeliveryType.PICKUP.length > 0 && (
                    <Card className="mb-3 products-card">
                      <Card.Header className="bg-warning text-dark">
                        <h6 className="mb-0">
                          📦 Самовивіз ({reportData.productsByDeliveryType.PICKUP.reduce((sum, p) => sum + p.totalQuantity, 0)} шт)
                        </h6>
                      </Card.Header>
                      <ListGroup variant="flush">
                        {reportData.productsByDeliveryType.PICKUP.map((product) => (
                          <ListGroup.Item key={product.id} className="product-item">
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="product-name">{product.name}</div>
                              <Badge bg="warning" text="dark" className="product-quantity">
                                {product.totalQuantity} шт
                              </Badge>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Card>
                  )}

                  {/* Total Summary */}
                  <Card className="mb-4 products-card">
                    <Card.Header className="bg-success text-white">
                      <h5 className="mb-0">
                        <Package size={20} className="me-2" />
                        Загальний підсумок
                      </h5>
                    </Card.Header>
                    <ListGroup variant="flush">
                      {reportData.products.map((product) => (
                        <ListGroup.Item key={product.id} className="product-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="product-name">{product.name}</div>
                            <Badge bg="success" className="product-quantity">
                              {product.totalQuantity} шт
                            </Badge>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card>
                </>
              ) : (
                // Single list (when specific delivery type selected)
                <Card className="mb-4 products-card">
                  <Card.Header className="bg-success text-white">
                    <h5 className="mb-0">
                      <Package size={20} className="me-2" />
                      До виробництва
                    </h5>
                  </Card.Header>
                  <ListGroup variant="flush">
                    {reportData.products.length === 0 ? (
                      <ListGroup.Item>
                        <Alert variant="info" className="mb-0">
                          Немає продукції для виробництва
                        </Alert>
                      </ListGroup.Item>
                    ) : (
                      reportData.products.map((product) => (
                        <ListGroup.Item key={product.id} className="product-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="product-name">{product.name}</div>
                            <Badge bg="success" className="product-quantity">
                              {product.totalQuantity} шт
                            </Badge>
                          </div>
                        </ListGroup.Item>
                      ))
                    )}
                  </ListGroup>
                </Card>
              )}

              {/* Order Details - Collapsible */}
              {/* {reportData.orders.length > 0 && (
                <div className="mb-4">
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowOrderDetails(!showOrderDetails)}
                    className="w-100 d-flex justify-content-between align-items-center"
                  >
                    <span>Деталі замовлень ({reportData.orders.length})</span>
                    {showOrderDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </Button>

                  <Collapse in={showOrderDetails}>
                    <div className="mt-3">
                      {reportData.orders.map((order) => (
                        <Card key={order.id} className="mb-2 order-detail-card">
                          <Card.Body className="py-2 px-3">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <strong>{order.customerName}</strong>
                                <div className="text-muted small">
                                  {order.orderNumber}
                                  {order.deliveryInfo && ` • ${order.deliveryInfo}`}
                                </div>
                              </div>
                              <Badge bg="info">{formatCurrency(order.total)}</Badge>
                            </div>
                            <div className="mt-2 small">
                              {order.items.map((item, idx) => (
                                <div key={idx}>
                                  • {item.productName} × {item.quantity}
                                </div>
                              ))}
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  </Collapse>
                </div>
              )} */}
            </>
          )}

          {/* Details View */}
          {viewMode === 'details' && (
            <>
              {/* Group orders by delivery type */}
              {(() => {
                // Group orders
                const ordersByType = {
                  ADDRESS: reportData.orders.filter(o => o.deliveryType === 'ADDRESS'),
                  RAILWAY_STATION: reportData.orders.filter(o => o.deliveryType === 'RAILWAY_STATION'),
                  PICKUP: reportData.orders.filter(o => o.deliveryType === 'PICKUP')
                };

                return (
                  <>
                    {/* Address Delivery Orders */}
                    {ordersByType.ADDRESS.length > 0 && (
                      <Card className="mb-3">
                        <Card.Header className="bg-primary text-white">
                          <h6 className="mb-0">
                            🏠 Адресна доставка ({ordersByType.ADDRESS.length} {ordersByType.ADDRESS.length === 1 ? 'замовлення' : 'замовлень'})
                          </h6>
                        </Card.Header>
                        <ListGroup variant="flush">
                          {ordersByType.ADDRESS.map((order) => (
                            <ListGroup.Item key={order.id}>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="mb-1">{order.orderNumber}</h6>
                                </div>
                                <div className="text-end">
                                  <div className="fw-bold text-primary">{formatCurrency(order.total)}</div>
                                  <Badge bg="secondary" className="mt-1 me-1">
                                    {order.status ==='CONFIRMED' ? '✅ Підтверджено' : order.status === 'PENDING' ? '⏳ Нове' : order.status === 'DELIVERED' ? '🚚 Виконано' : '❌ Скасовано'}
                                  </Badge>
                                  <Badge bg="secondary" className="mt-1">
                                    {order.paymentStatus === 'PAID' ? '✅ Оплачено' : '💵 При доставці'}
                                  </Badge>
                                </div>
                              </div>

                              {/* Order Items */}
                              <div className="ms-3 mb-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="d-flex justify-content-between py-1 border-top small">
                                    <span>• {item.productName}</span>
                                    <span>× {item.quantity}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Customer Info Toggle */}
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => toggleCustomerInfo(order.id)}
                                className="w-100 d-flex justify-content-between align-items-center"
                              >
                                <span>👤 <strong>Інфо про клієнта</strong></span>
                                {expandedCustomers[order.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </Button>

                              <Collapse in={expandedCustomers[order.id]}>
                                <div className="mt-2 p-3 bg-light rounded">
                                  <div className="mb-2">
                                    <strong>👤 {order.customer.name}</strong>
                                  </div>
                                  <div className="mb-2">
                                    <a href={`tel:${order.customer.phone}`} className="text-decoration-none">
                                      📞 {order.customer.phone}
                                    </a>
                                  </div>
                                  {order.deliveryInfo && (
                                    <div className="text-muted small">
                                      📍 {order.deliveryInfo}
                                    </div>
                                  )}
                                </div>
                              </Collapse>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </Card>
                    )}

                    {/* Railway Station Orders */}
                    {ordersByType.RAILWAY_STATION.length > 0 && (
                      <Card className="mb-3">
                        <Card.Header className="bg-danger text-white">
                          <h6 className="mb-0">
                            🚂 ЖД станції ({ordersByType.RAILWAY_STATION.length} {ordersByType.RAILWAY_STATION.length === 1 ? 'замовлення' : 'замовлень'})
                          </h6>
                        </Card.Header>
                        <ListGroup variant="flush">
                          {ordersByType.RAILWAY_STATION.map((order) => (
                            <ListGroup.Item key={order.id}>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="mb-1">{order.orderNumber}</h6>
                                </div>
                                <div className="text-end">
                                  <div className="fw-bold text-danger">{formatCurrency(order.total)}</div>
                                  <Badge bg="secondary" className="mt-1 me-1">
                                    {order.status ==='CONFIRMED' ? '✅ Підтверджено' : order.status === 'PENDING' ? '⏳ Нове' : order.status === 'DELIVERED' ? '🚚 Виконано' : '❌ Скасовано'}
                                  </Badge>
                                  <Badge bg="secondary" className="mt-1">
                                    {order.paymentStatus === 'PAID' ? '✅ Оплачено' : '💵 При доставці'}
                                  </Badge>
                                </div>
                              </div>

                              {/* Order Items */}
                              <div className="ms-3 mb-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="d-flex justify-content-between py-1 border-top small">
                                    <span>• {item.productName}</span>
                                    <span>× {item.quantity}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Customer Info Toggle */}
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => toggleCustomerInfo(order.id)}
                                className="w-100 d-flex justify-content-between align-items-center"
                              >
                                <span>👤  <strong>Інфо про клієнта</strong></span>
                                {expandedCustomers[order.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </Button>

                              <Collapse in={expandedCustomers[order.id]}>
                                <div className="mt-2 p-3 bg-light rounded">
                                  <div className="mb-2">
                                    <strong>👤 {order.customer.name}</strong>
                                  </div>
                                  <div className="mb-2">
                                    <a href={`tel:${order.customer.phone}`} className="text-decoration-none">
                                      📞 {order.customer.phone}
                                    </a>
                                  </div>
                                  {order.deliveryInfo && (
                                    <div className="text-muted small">
                                      🚂 {order.deliveryInfo}
                                    </div>
                                  )}
                                </div>
                              </Collapse>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </Card>
                    )}

                    {/* Pickup Orders */}
                    {ordersByType.PICKUP.length > 0 && (
                      <Card className="mb-3">
                        <Card.Header className="bg-warning text-dark">
                          <h6 className="mb-0">
                            📦 Самовивіз ({ordersByType.PICKUP.length} {ordersByType.PICKUP.length === 1 ? 'замовлення' : 'замовлень'})
                          </h6>
                        </Card.Header>
                        <ListGroup variant="flush">
                          {ordersByType.PICKUP.map((order) => (
                            <ListGroup.Item key={order.id}>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="mb-1">{order.orderNumber}</h6>
                                </div>
                                <div className="text-end">
                                  <div className="fw-bold text-warning">{formatCurrency(order.total)}</div>
                                  <Badge bg="secondary" className="mt-1 me-1">
                                    {order.status ==='CONFIRMED' ? '✅ Підтверджено' : order.status === 'PENDING' ? '⏳ Нове' : order.status === 'DELIVERED' ? '🚚 Виконано' : '❌ Скасовано'}
                                  </Badge>
                                  <Badge bg="secondary" className="mt-1">
                                    {order.paymentStatus === 'PAID' ? '✅ Оплачено' : '💵 При доставці'}
                                  </Badge>
                                </div>
                              </div>

                              {/* Order Items */}
                              <div className="ms-3 mb-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="d-flex justify-content-between py-1 border-top small">
                                    <span>• {item.productName}</span>
                                    <span>× {item.quantity}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Customer Info Toggle */}
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => toggleCustomerInfo(order.id)}
                                className="w-100 d-flex justify-content-between align-items-center"
                              >
                                <span>👤 <strong>Інфо про клієнта</strong></span>
                                {expandedCustomers[order.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </Button>

                              <Collapse in={expandedCustomers[order.id]}>
                                <div className="mt-2 p-3 bg-light rounded">
                                  <div className="mb-2">
                                    <strong>👤 {order.customer.name}</strong>
                                  </div>
                                  <div className="mb-2">
                                    <a href={`tel:${order.customer.phone}`} className="text-decoration-none">
                                      📞 {order.customer.phone}
                                    </a>
                                  </div>
                                  {order.deliveryInfo && (
                                    <div className="text-muted small">
                                      📦 {order.deliveryInfo}
                                    </div>
                                  )}
                                </div>
                              </Collapse>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </Card>
                    )}

                    {/* Empty State */}
                    {ordersByType.ADDRESS.length === 0 &&
                      ordersByType.RAILWAY_STATION.length === 0 &&
                      ordersByType.PICKUP.length === 0 && (
                        <Card className="mb-4">
                          <Card.Body>
                            <Alert variant="info" className="mb-0">
                              Немає замовлень за обраний період
                            </Alert>
                          </Card.Body>
                        </Card>
                      )}
                  </>
                );
              })()}
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default ProductionReport;
