// frontend/src/components/admin/panels/ReportsPanelComponents/ReportsSummary.js
import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  Truck, 
  DollarSign,
  TrendingUp,
  Package,
  Users
} from 'lucide-react';

const ReportsSummary = ({ summaryData, filters }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'requires_agreement': return 'info';
      case 'confirmed': return 'success';
      default: return 'primary';
    }
  };

  const getDeliveryTypeLabel = (type) => {
    switch (type) {
      case 'RAILWAY_STATION': return 'ЖД Станція';
      case 'ADDRESS': return 'Адреса';
      case 'PICKUP': return 'Самовивіз';
      default: return type;
    }
  };

  const SummaryCard = ({ title, value, subtitle, icon: Icon, variant = 'primary', trend }) => (
    <Card className={`border-${variant} h-100`}>
      <Card.Body>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <div className={`text-${variant}`} style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {value}
            </div>
            <div className="fw-bold text-dark">{title}</div>
            {subtitle && <small className="text-muted">{subtitle}</small>}
            {trend && (
              <div className={`small text-${trend > 0 ? 'success' : 'danger'} mt-1`}>
                <TrendingUp size={14} className="me-1" />
                {trend > 0 ? '+' : ''}{trend}%
              </div>
            )}
          </div>
          <div className={`text-${variant}`} style={{ opacity: 0.7 }}>
            <Icon size={40} />
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="mb-4">
      {/* Main Statistics */}
      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <SummaryCard
            title="Загальна кількість замовлень"
            value={summaryData.orders.total}
            icon={ShoppingCart}
            variant="primary"
          />
        </Col>
        
        <Col sm={6} lg={3}>
          <SummaryCard
            title="Нові замовлення"
            value={summaryData.orders.pending}
            subtitle="Очікують підтвердження"
            icon={Clock}
            variant="warning"
          />
        </Col>

        <Col sm={6} lg={3}>
          <SummaryCard
            title="Треба домовитись"
            value={summaryData.orders.requires_agreement}
            subtitle="Треба домовитись"
            icon={Clock}
            variant="warning"
          />
        </Col>
        
        <Col sm={6} lg={3}>
          <SummaryCard
            title="Підтверджено"
            value={summaryData.orders.confirmed}
            subtitle="Готові до доставки"
            icon={Truck}
            variant="info"
          />
        </Col>
        
        {/* <Col sm={6} lg={3}>
          <SummaryCard
            title="Доставлено"
            value={summaryData.orders.delivered}
            subtitle="Завершені замовлення"
            icon={CheckCircle}
            variant="success"
          />
        </Col> */}
      </Row>

      {/* Revenue and Additional Stats */}
      {/* <Row className="g-3 mb-4">
        <Col md={6} lg={4}>
          <SummaryCard
            title="Загальний дохід"
            value={formatCurrency(summaryData.revenue.total)}
            subtitle="За вибраний період"
            icon={DollarSign}
            variant="success"
          />
        </Col>
        
        <Col md={6} lg={4}>
          <Card className="border-info h-100">
            <Card.Body>
              <div className="d-flex align-items-center gap-2 mb-3">
                <Package className="text-info" size={24} />
                <h6 className="mb-0 fw-bold">Топ продуктів</h6>
              </div>
              <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                {summaryData.top_products.slice(0, 3).map((product, index) => (
                  <div key={product.product_id} className="d-flex justify-content-between align-items-center py-1">
                    <div className="small">
                      <div className="fw-bold">{product.product_name}</div>
                      <div className="text-muted">{product.category}</div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold text-info">{product.total_quantity}</div>
                      <div className="small text-muted">{product.order_count} замовлень</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={12} lg={4}>
          <Card className="border-secondary h-100">
            <Card.Body>
              <div className="d-flex align-items-center gap-2 mb-3">
                <Truck className="text-secondary" size={24} />
                <h6 className="mb-0 fw-bold">Типи доставки</h6>
              </div>
              <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                {summaryData.delivery_stats.map((stat, index) => (
                  <div key={stat.delivery_type} className="d-flex justify-content-between align-items-center py-1">
                    <span className="small">{getDeliveryTypeLabel(stat.delivery_type)}</span>
                    <span className="fw-bold text-secondary">{stat.count}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row> */}

      {/* Period Info */}
      {(filters.startDate || filters.endDate) && (
        <Row>
          <Col>
            <Card className="border-light bg-light">
              <Card.Body className="py-2">
                <small className="text-muted">
                  <strong>Період звіту:</strong> {' '}
                  {filters.startDate && filters.endDate 
                    ? `з ${new Date(filters.startDate).toLocaleDateString('uk-UA')} до ${new Date(filters.endDate).toLocaleDateString('uk-UA')}`
                    : filters.startDate 
                    ? `з ${new Date(filters.startDate).toLocaleDateString('uk-UA')}`
                    : `до ${new Date(filters.endDate).toLocaleDateString('uk-UA')}`
                  }
                  {filters.status !== 'all' && ` | Статус: ${filters.status}`}
                  {filters.deliveryType !== 'all' && ` | Тип доставки: ${getDeliveryTypeLabel(filters.deliveryType)}`}
                </small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default ReportsSummary;