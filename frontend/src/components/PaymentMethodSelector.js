import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, Banknote } from 'lucide-react';
import { Row, Col, Button, Card, Form, Image } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const PaymentMethodSelector = ({ selectedMethod, onChange, onTwintConfirmationChange }) => {
  const { t } = useTranslation('checkout');
  const [twintPaymentConfirmed, setTwintPaymentConfirmed] = useState(false);

  // Effect to set default payment method to CASH on component mount
  useEffect(() => {
    // Only set default if no method is currently selected
    if (!selectedMethod) {
      onChange({ target: { name: 'paymentMethod', value: 'CASH' } });
    }
  }, [selectedMethod, onChange]);

  // Handle TWINT payment confirmation change
  const handleTwintConfirmationChange = (e) => {
    const isConfirmed = e.target.checked;
    setTwintPaymentConfirmed(isConfirmed);
    
    // Notify parent component about TWINT confirmation status
    if (onTwintConfirmationChange) {
      onTwintConfirmationChange(isConfirmed);
    }
  };

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
      disabled: false, // Now enabled
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
    
    // Reset TWINT confirmation if switching away from TWINT
    if (methodId !== 'TWINT' && twintPaymentConfirmed) {
      setTwintPaymentConfirmed(false);
      if (onTwintConfirmationChange) {
        onTwintConfirmationChange(false);
      }
    }
  };

  return (
    <div>
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

      {/* TWINT QR Code Section */}
      {selectedMethod === 'TWINT' && (
        <Card className="mt-4">
          <Card.Body className="text-center">
            <h5 className="mb-3">{t('payment.twint.qr_title', 'TWINT QR Code Payment')}</h5>
            
            {/* QR Code Image Placeholder */}
            <div className="mb-4">
              <div 
                className="mx-auto bg-light border rounded d-flex align-items-center justify-content-center"
                style={{ 
                  width: '200px', 
                  height: '200px',
                  border: '2px solid #dee2e6'
                }}
              >
                {/* Replace this div with actual QR code image */}
                {/* <div className="text-center">
                  
                  <Wallet size={48} className="text-muted mb-2" />
                  <div className="small text-muted">

                    {t('payment.twint.qr_placeholder', 'QR Code will appear here')}
                  </div>
                </div> */}
                
                {/* Uncomment and use this when you have actual QR code */}
                
                <Image 
                  src="/assets/images/qr-twint.jpg" 
                  alt="TWINT QR Code"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
               
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="mb-4">
              <p className="mb-2">
                {t('payment.twint.instructions_1', 'Scan the QR code with your TWINT app')}
              </p>
              <p className="mb-0 small text-muted">
                {t('payment.twint.instructions_2', 'Complete the payment and confirm below')}
              </p>
            </div>

            {/* Payment Confirmation Checkbox */}
            <Form.Check
              type="checkbox"
              id="twint-payment-confirmation"
              checked={twintPaymentConfirmed}
              onChange={handleTwintConfirmationChange}
              label={t('payment.twint.confirmation', 'Замовлення мною сплачено')}
              className="d-flex justify-content-center gap-2"
            />
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default PaymentMethodSelector;