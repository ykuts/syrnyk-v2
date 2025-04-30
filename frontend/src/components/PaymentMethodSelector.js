import React, { useEffect } from 'react';
import { Wallet, CreditCard, Banknote } from 'lucide-react';
import { Row, Col, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const PaymentMethodSelector = ({ selectedMethod, onChange }) => {
  const { t } = useTranslation('checkout');

  // Effect to set default payment method to CASH on component mount
  useEffect(() => {
    // Only set default if no method is currently selected
    if (selectedMethod) {
      onChange({ target: { name: 'paymentMethod', value: 'CASH' } });
    }
  }, []);

  const paymentMethods = [
    {
      id: 'CASH',
      icon: <Banknote size={24} />,
      disabled: false,
      title: t('payment.cash.title'),
      description: t('payment.cash.description')
    },
    {
      id: 'TWINT',
      icon: <Wallet size={24} />,
      disabled: true,
      title: t('payment.twint.title'),
      description: t('payment.twint.description')
    },
    {
      id: 'CARD',
      icon: <CreditCard size={24} />,
      disabled: true,
      title: t('payment.card.title'),
      description: t('payment.card.description')
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
            disabled={method.disabled}
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