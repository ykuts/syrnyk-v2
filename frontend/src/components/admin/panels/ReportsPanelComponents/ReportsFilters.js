import React, { useState } from 'react';
import { Card, Row, Col, Form, Button, ButtonGroup } from 'react-bootstrap';
import { RefreshCw, Calendar, Filter, TrendingUp, HelpCircle } from 'lucide-react';
import PlanningHelpModal from './PlanningHelpModal';

const ReportsFilters = ({ filters, onFiltersChange, onRefresh, loading }) => {
  const [showPlanningHelp, setShowPlanningHelp] = useState(false);

  const handleFilterChange = (field, value) => {
    onFiltersChange({ [field]: value });
  };

  // Quick date range presets - modified to include future planning options
  const handleQuickDateRange = (days, includeFuture = false) => {
    const today = new Date();
    let startDate, endDate;

    if (includeFuture) {
      // For future planning - start from today and go forward
      startDate = new Date(today);
      endDate = new Date(today);
      endDate.setDate(today.getDate() + days);
    } else {
      // For historical data - go backward from today
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setDate(today.getDate() - days);
    }

    onFiltersChange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  // Planning-specific date ranges
  const handlePlanningRange = (weeks) => {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + (weeks * 7));

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
      
      // Check if range includes future dates
      const today = new Date();
      const endDateObj = new Date(filters.endDate);
      const isFuture = endDateObj > today;
      
      return `${start} - ${end}${isFuture ? ' (включає майбутні дати)' : ''}`;
    }
    return 'Всі дати';
  };

  return (
    <>
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <div className="d-flex align-items-center gap-2">
            <Filter size={20} />
            <h5 className="mb-0">Фільтри звітів та планування</h5>
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            {/* Historical Data Quick Buttons */}
            <Col lg={12}>
              <Form.Label className="fw-bold">Історичні дані:</Form.Label>
              <div className="d-flex gap-2 flex-wrap mb-2">
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
            </Col>

            {/* Planning Quick Buttons */}
            <Col lg={12}>
              <Form.Label className="fw-bold">
                <TrendingUp size={16} className="me-1" />
                Планування доставки:
              </Form.Label>
              <div className="d-flex gap-2 flex-wrap">
                <ButtonGroup size="sm">
                  <Button 
                    variant="outline-success"
                    onClick={() => handlePlanningRange(1)}
                  >
                    Наступний тиждень
                  </Button>
                  <Button 
                    variant="outline-success"
                    onClick={() => handlePlanningRange(2)}
                  >
                    2 тижні
                  </Button>
                  <Button 
                    variant="outline-success"
                    onClick={() => handlePlanningRange(4)}
                  >
                    Місяць вперед
                  </Button>
                  <Button 
                    variant="outline-success"
                    onClick={() => handlePlanningRange(8)}
                  >
                    2 місяці вперед
                  </Button>
                </ButtonGroup>
              </div>
              <small className="text-muted">
                Поточний період: {getDateRangeLabel()}
              </small>
            </Col>

            {/* Custom Date Range - No restrictions on future dates */}
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
                  max={filters.endDate || undefined} // Only limit by end date if set
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
                  min={filters.startDate} // Only limit by start date
                  // Removed max restriction to allow future dates for planning
                />
                <Form.Text className="text-muted">
                  Можна вибирати майбутні дати для планування
                </Form.Text>
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
                  <option value="PENDING">Нові</option>
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
              <div className="d-flex gap-2 align-items-center">
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

                <Button 
                  variant="outline-info"
                  onClick={() => setShowPlanningHelp(true)}
                  className="d-flex align-items-center gap-2"
                  title="Як користуватися функціями планування"
                >
                  <HelpCircle size={16} />
                  Довідка по плануванню
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Planning Help Modal */}
      <PlanningHelpModal 
        show={showPlanningHelp}
        onHide={() => setShowPlanningHelp(false)}
      />
    </>
  );
};

export default ReportsFilters;