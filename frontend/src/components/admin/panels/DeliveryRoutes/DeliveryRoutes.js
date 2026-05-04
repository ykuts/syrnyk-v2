// frontend/src/components/admin/panels/DeliveryRoutes/DeliveryRoutes.js
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
  Badge
} from 'react-bootstrap';
import { Calendar, MapPin } from 'lucide-react';
import { apiClient } from '../../../../utils/api';
import DeliveryRouteCard from './DeliveryRouteCard';
import './DeliveryRoutes.css';

const DeliveryRoutes = () => {
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0], // Today's date
    canton: 'ALL'
  });
  
  const [deliveryData, setDeliveryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load delivery routes when filters change
  useEffect(() => {
    loadDeliveryRoutes();
  }, [filters.date, filters.canton]);

  const loadDeliveryRoutes = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        date: filters.date,
        ...(filters.canton !== 'ALL' && { canton: filters.canton })
      });

      const response = await apiClient.get(
        `/admin/delivery-routes?${params.toString()}`,
        {
          'Authorization': `Bearer ${token}`
        }
      );

      setDeliveryData(response);
    } catch (err) {
      console.error('Error loading delivery routes:', err);
      setError(err.response?.data?.error || 'Failed to load delivery routes');
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

  const handleDeliveryComplete = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      
      await apiClient.patch(
        `/admin/orders/${orderId}/complete-delivery`,
        {},
        {
          'Authorization': `Bearer ${token}`
        }
      );

      // Reload data
      await loadDeliveryRoutes();
    } catch (err) {
      console.error('Error completing delivery:', err);
      alert('Помилка при відмітці доставки: ' + (err.response?.data?.error || err.message));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const getCantonName = (code) => {
    const names = {
      'VD': 'Vaud (VD)',
      'GE': 'Geneva (GE)',
      'ALL': 'Усі кантони'
    };
    return names[code] || code;
  };

  return (
    <Container fluid className="delivery-routes-container">
      <div className="delivery-routes-header mb-4">
        <h2>📋 План доставок</h2>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col xs={12} md={5}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label className="d-flex align-items-center gap-2">
                  <Calendar size={18} />
                  Дата доставки
                </Form.Label>
                <Form.Control
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={5}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label className="d-flex align-items-center gap-2">
                  <MapPin size={18} />
                  Кантон
                </Form.Label>
                <Form.Select
                  value={filters.canton}
                  onChange={(e) => handleFilterChange('canton', e.target.value)}
                >
                  <option value="ALL">Усі кантони</option>
                  <option value="VD">Vaud (VD)</option>
                  <option value="GE">Geneva (GE)</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={2}>
              <Button 
                variant="primary" 
                className="w-100"
                onClick={loadDeliveryRoutes}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : 'Оновити'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Summary */}
      {deliveryData?.summary && (
        <Card className="mb-4 summary-card">
          <Card.Body>
            <Row className="text-center">
              <Col xs={6} md={3} className="mb-3 mb-md-0">
                <div className="summary-item">
                  <div className="summary-value text-primary">
                    {deliveryData.summary.totalOrders}
                  </div>
                  <div className="summary-label">Всього замовлень</div>
                </div>
              </Col>
              <Col xs={6} md={3} className="mb-3 mb-md-0">
                <div className="summary-item">
                  <div className="summary-value text-success">
                    {deliveryData.summary.deliveredOrders}
                  </div>
                  <div className="summary-label">Доставлено</div>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="summary-item">
                  <div className="summary-value text-warning">
                    {formatCurrency(deliveryData.summary.cashOnDelivery)}
                  </div>
                  <div className="summary-label">До отримання (готівка)</div>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="summary-item">
                  <div className="summary-value text-info">
                    {formatCurrency(deliveryData.summary.total)}
                  </div>
                  <div className="summary-label">Загальна сума</div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
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

      {/* Orders List */}
      {!loading && deliveryData && (
        <>
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              Замовлення: {getCantonName(filters.canton)}
              {deliveryData.orders.length === 0 && (
                <Badge bg="secondary" className="ms-2">Немає замовлень</Badge>
              )}
            </h5>
          </div>

          {deliveryData.orders.length === 0 ? (
            <Alert variant="info">
              Немає замовлень для доставки на обрану дату та кантон.
            </Alert>
          ) : (
            <div className="delivery-orders-list">
              {deliveryData.orders.map((order, index) => (
                <DeliveryRouteCard
                  key={order.id}
                  order={order}
                  index={index}
                  onDeliveryComplete={handleDeliveryComplete}
                />
              ))}
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default DeliveryRoutes;
