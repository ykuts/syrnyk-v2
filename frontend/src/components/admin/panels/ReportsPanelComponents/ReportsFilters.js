// frontend/src/components/admin/panels/ReportsPanelComponents/ReportsFilters.js
import React from 'react';
import { Card, Row, Col, Form, Button, ButtonGroup } from 'react-bootstrap';
import { RefreshCw, Calendar, Filter } from 'lucide-react';

const ReportsFilters = ({ filters, onFiltersChange, onRefresh, loading }) => {
  const handleFilterChange = (field, value) => {
    onFiltersChange({ [field]: value });
  };

  const handleQuickDateRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    onFiltersChange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      startDate: '',
      endDate: '',
      status: 'all',
      deliveryType: 'all'
    });
  };

  const getDateRangeLabel = () => {
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate).toLocaleDateString('uk-UA');
      const end = new Date(filters.endDate).toLocaleDateString('uk-UA');
      return `${start} - ${end}`;
    }
    return 'Всі дати';
  };

  return (
    <Card className="mb-4">
      <Card.Header className="bg-light">
        <div className="d-flex align-items-center gap-2">
          <Filter size={20} />
          <h5 className="mb-0">Фільтри</h5>
        </div>
      </Card.Header>
      <Card.Body>
        <Row className="g-3">
          {/* Quick Date Range Buttons */}
          <Col lg={12}>
            <Form.Label className="fw-bold">Швидкий вибір періоду:</Form.Label>
            <div className="d-flex gap-2 flex-wrap">
              <ButtonGroup size="sm">
                <Button 
                  variant="outline-primary"
                  onClick={() => handleQuickDateRange(7)}
                >
                  7 днів
                </Button>
                <Button 
                  variant="outline-primary"
                  onClick={() => handleQuickDateRange(30)}
                >
                  30 днів
                </Button>
                <Button 
                  variant="outline-primary"
                  onClick={() => handleQuickDateRange(90)}
                >
                  3 місяці
                </Button>
                <Button 
                  variant="outline-primary"
                  onClick={() => handleQuickDateRange(365)}
                >
                  Рік
                </Button>
              </ButtonGroup>
            </div>
            <small className="text-muted">
              Поточний період: {getDateRangeLabel()}
            </small>
          </Col>

          {/* Custom Date Range */}
          <Col md={6} lg={3}>
            <Form.Group>
              <Form.Label className="fw-bold">
                <Calendar size={16} className="me-1" />
                Дата початку
              </Form.Label>
              <Form.Control
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                max={filters.endDate || new Date().toISOString().split('T')[0]}
              />
            </Form.Group>
          </Col>

          <Col md={6} lg={3}>
            <Form.Group>
              <Form.Label className="fw-bold">
                <Calendar size={16} className="me-1" />
                Дата кінця
              </Form.Label>
              <Form.Control
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                min={filters.startDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </Form.Group>
          </Col>

          {/* Status Filter */}
          <Col md={6} lg={3}>
            <Form.Group>
              <Form.Label className="fw-bold">Статус замовлення</Form.Label>
              <Form.Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">Всі статуси</option>
                <option value="PENDING">В обробці</option>
                <option value="CONFIRMED">Підтверджено</option>
                <option value="DELIVERED">Доставлено</option>
                <option value="CANCELLED">Скасовано</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Delivery Type Filter */}
          <Col md={6} lg={3}>
            <Form.Group>
              <Form.Label className="fw-bold">Тип доставки</Form.Label>
              <Form.Select
                value={filters.deliveryType}
                onChange={(e) => handleFilterChange('deliveryType', e.target.value)}
              >
                <option value="all">Всі типи</option>
                <option value="RAILWAY_STATION">ЖД Станція</option>
                <option value="ADDRESS">Адресна доставка</option>
                <option value="PICKUP">Самовивіз</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Action Buttons */}
        <Row className="mt-3">
          <Col>
            <div className="d-flex gap-2">
              <Button 
                variant="primary" 
                onClick={onRefresh}
                disabled={loading}
                className="d-flex align-items-center gap-2"
              >
                <RefreshCw size={16} className={loading ? 'spin' : ''} />
                {loading ? 'Завантаження...' : 'Оновити дані'}
              </Button>
              
              <Button 
                variant="outline-secondary"
                onClick={clearFilters}
                disabled={loading}
              >
                Очистити фільтри
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ReportsFilters;