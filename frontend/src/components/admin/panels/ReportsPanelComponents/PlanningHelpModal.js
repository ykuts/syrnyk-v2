// frontend/src/components/admin/panels/ReportsPanelComponents/PlanningHelpModal.js
import React from 'react';
import { Modal, Button, Card, Row, Col, Badge, Alert } from 'react-bootstrap';
import { TrendingUp, Calendar, BarChart3, Truck, Clock, HelpCircle } from 'lucide-react';

const PlanningHelpModal = ({ show, onHide }) => {
  const planningFeatures = [
    {
      icon: <Calendar className="text-success" size={24} />,
      title: 'Вибір майбутніх дат',
      description: 'Тепер ви можете вибирати дати в майбутньому для планування доставок та виробництва.',
      steps: [
        'Використовуйте кнопки "Планування доставки" у фільтрах',
        'Або вручну оберіть майбутні дати в полях "Дата початку" та "Дата кінця"',
        'Система автоматично підкаже, що включені майбутні дати'
      ]
    },
    {
      icon: <TrendingUp className="text-primary" size={24} />,
      title: 'Спеціальні конфігурації для планування',
      description: 'Нові готові звіти, оптимізовані для планування майбутніх доставок.',
      steps: [
        'Шукайте зелені кнопки конфігурацій - вони для планування',
        '"Планування майбутніх доставок" - розподіл по датах і типах',
        '"Тижневий план виробництва" - планування по тижнях',
        '"Щоденний розклад доставок" - детальний план по днях'
      ]
    },
    {
      icon: <BarChart3 className="text-warning" size={24} />,
      title: 'Аналіз даних планування',
      description: 'Комбінуйте історичні дані з майбутніми планами для кращого прогнозування.',
      steps: [
        'Порівнюйте минулі періоди з майбутніми планами',
        'Аналізуйте тенденції попиту на продукти',
        'Плануйте завантаження виробництва',
        'Оптимізуйте маршрути доставки'
      ]
    }
  ];

  const quickTips = [
    {
      icon: <Clock className="text-info" size={16} />,
      text: 'Використовуйте кнопку "Наступний тиждень" для швидкого планування'
    },
    {
      icon: <Truck className="text-secondary" size={16} />,
      text: 'Фільтруйте по типу доставки для специфічного планування'
    },
    {
      icon: <BarChart3 className="text-primary" size={16} />,
      text: 'Комбінуйте різні поля для створення власних звітів планування'
    }
  ];

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <HelpCircle className="me-2" size={24} />
          Як користуватися функціями планування
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div className="mb-4">
          <Alert variant="success" className="d-flex align-items-center">
            <TrendingUp className="me-2" size={20} />
            <div>
              <strong>Новинка!</strong> Тепер ви можете планувати майбутні доставки та аналізувати їх разом з історичними даними.
            </div>
          </Alert>
        </div>

        {/* Main Features */}
        <Row className="g-4">
          {planningFeatures.map((feature, index) => (
            <Col key={index} lg={12}>
              <Card className="h-100 border-light">
                <Card.Body>
                  <div className="d-flex align-items-start gap-3">
                    <div className="flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h5 className="card-title">{feature.title}</h5>
                      <p className="text-muted mb-3">{feature.description}</p>
                      <div className="ps-3">
                        {feature.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="d-flex align-items-start mb-2">
                            <Badge bg="light" text="dark" className="me-2 mt-1" style={{minWidth: '20px'}}>
                              {stepIndex + 1}
                            </Badge>
                            <small className="text-muted">{step}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Quick Tips */}
        <div className="mt-4">
          <h6 className="mb-3">💡 Швидкі поради:</h6>
          <div className="bg-light p-3 rounded">
            {quickTips.map((tip, index) => (
              <div key={index} className="d-flex align-items-center mb-2 last:mb-0">
                {tip.icon}
                <small className="ms-2 text-muted">{tip.text}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Example Usage */}
        <div className="mt-4">
          <h6 className="mb-3">📋 Приклад використання:</h6>
          <Card className="bg-light border-0">
            <Card.Body>
              <div className="d-flex align-items-start gap-2">
                <Badge bg="primary" className="mt-1">1</Badge>
                <div>
                  <strong>Планування на наступний тиждень:</strong>
                  <ul className="mb-2 mt-1">
                    <li><small>Натисніть "Наступний тиждень" у фільтрах</small></li>
                    <li><small>Виберіть конфігурацію "Тижневий план виробництва"</small></li>
                    <li><small>Аналізуйте потрібну кількість кожного продукту</small></li>
                  </ul>
                </div>
              </div>
              <div className="d-flex align-items-start gap-2">
                <Badge bg="success" className="mt-1">2</Badge>
                <div>
                  <strong>Планування доставок на станції:</strong>
                  <ul className="mb-2 mt-1">
                    <li><small>Встановіть фільтр "ЖД Станція" для типу доставки</small></li>
                    <li><small>Оберіть майбутні дати (наприклад, наступні 2 тижні)</small></li>
                    <li><small>Використайте конфігурацію "Доставка на станції"</small></li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Зрозуміло
        </Button>
        <Button variant="primary" onClick={onHide}>
          Почати планування
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PlanningHelpModal;