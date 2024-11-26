import React from 'react';
import { Wallet, CreditCard, Banknote } from 'lucide-react';
import { Row, Col, Button } from 'react-bootstrap';

const PaymentMethodSelector = ({ selectedMethod, onChange }) => {
  const paymentMethods = [
    {
      id: 'TWINT',
      icon: <Wallet size={24} />,
      title: 'TWINT',
      description: 'Швидка оплата через додаток'
    },
    {
      id: 'CARD',
      icon: <CreditCard size={24} />,
      title: 'Карта',
      description: 'Дебетова або кредитна карта'
    },
    {
      id: 'CASH',
      icon: <Banknote size={24} />,
      title: 'Готівка',
      description: 'Оплата при отриманні'
    }
  ];

  const handleSelect = (methodId) => {
    onChange({ target: { name: 'paymentMethod', value: methodId } });
  };

  return (
    <Row className="g-3">
      {paymentMethods.map((method) => (
        <Col md={4} key={method.id}>
          <Button
            variant={selectedMethod === method.id ? "primary" : "outline-primary"}
            onClick={() => handleSelect(method.id)}
            className="w-100 h-100 d-flex flex-column align-items-center p-3 gap-2"
          >
            <div className="icon-wrapper">
              {method.icon}
            </div>
            <div className="fw-medium">{method.title}</div>
            <small className={selectedMethod === method.id ? "text-light" : "text-muted"}>
              {method.description}
            </small>
          </Button>
        </Col>
      ))}
    </Row>
  );
};

export default PaymentMethodSelector;