import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, Banknote, CheckCircle, Clock } from 'lucide-react';
import { Row, Col, Button, Card, Form, Image } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const PaymentMethodSelector = ({ 
  selectedMethod, 
  onChange, 
  onTwintConfirmationChange, 
  onTwintCommentChange,
  onTwintPaymentOptionChange
 }) => {
  const { t } = useTranslation('checkout');
  const [twintPaymentOption, setTwintPaymentOption] = useState('');

  // Effect to set default payment method to CASH on component mount
  useEffect(() => {
    // Only set default if no method is currently selected
    if (!selectedMethod) {
      onChange({ target: { name: 'paymentMethod', value: 'CASH' } });
    }
  }, [selectedMethod, onChange]);

  // Handle TWINT payment option change
  const handleTwintOptionChange = (selectedOption) => {
    setTwintPaymentOption(selectedOption);
    
    // Notify parent component about the selected option
    if (onTwintPaymentOptionChange) {
      onTwintPaymentOptionChange(selectedOption);
    }
    
    // Notify parent component about TWINT confirmation status
    // 'paid' means payment is confirmed, 'pay_on_delivery' means not confirmed yet
    if (onTwintConfirmationChange) {
      onTwintConfirmationChange(selectedOption === 'paid');
    }

    // Send TWINT status for admin notes only (not visible to client)
    if (onTwintCommentChange) {
      let twintStatusText = '';

      if (selectedOption === 'paid') {
        twintStatusText = t('payment.twint.confirmation', 'Замовлення мною сплачено');
      } else if (selectedOption === 'pay_on_delivery') {
        twintStatusText = t('payment.twint.pay_on_delivery', 'Оплачу по факту отримання замовлення');
      }
      
      // Send just the TWINT status text (will be combined with client notes in parent)
      onTwintCommentChange(twintStatusText);
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
      disabled: false, 
      title: t('payment.twint.title'),
      description: t('payment.twint.description')
    },
    {
      id: 'CARD',
      icon: <CreditCard size={24} />,
      disabled: true, // Now enabled
      title: t('payment.card.title'),
      description: t('payment.card.description')
    }
  ];

  // Define TWINT payment options similar to payment methods
  const twintOptions = [
    {
      id: 'paid',
      icon: <CheckCircle size={20} />,
      title: t('payment.twint.confirmation', 'Замовлення мною сплачено'),
      description: t('payment.twint.paid_description', 'Payment completed via TWINT')
    },
    {
      id: 'pay_on_delivery',
      icon: <Clock size={20} />,
      title: t('payment.twint.pay_on_delivery', 'Оплачу по факту отримання замовлення'),
      description: t('payment.twint.later_description', 'Pay when receiving order')
    }
  ];

  const handleSelect = (methodId) => {
    onChange({ target: { name: 'paymentMethod', value: methodId } });
    
    // Reset TWINT confirmation if switching away from TWINT
    if (methodId !== 'TWINT') {
      setTwintPaymentOption('');
      if (onTwintPaymentOptionChange) {
        onTwintPaymentOptionChange('');
      }
      if (onTwintConfirmationChange) {
        onTwintConfirmationChange(false);
      }
      // Clear TWINT comment when switching away from TWINT
      if (onTwintCommentChange) {
        onTwintCommentChange('');
      }
    } else {
      // When selecting TWINT, notify parent with current option status
      if (onTwintPaymentOptionChange) {
        onTwintPaymentOptionChange(twintPaymentOption);
      }
      if (onTwintConfirmationChange) {
        onTwintConfirmationChange(twintPaymentOption === 'paid');
      }
      // Add TWINT status to admin comment when selecting TWINT (if option is already selected)
      if (onTwintCommentChange && twintPaymentOption) {
        let twintStatusText = '';
        
        if (twintPaymentOption === 'paid') {
          twintStatusText = t('payment.twint.confirmation', 'Замовлення мною сплачено');
        } else if (twintPaymentOption === 'pay_on_delivery') {
          twintStatusText = t('payment.twint.pay_on_delivery', 'Оплачу по факту отримання замовлення');
        }
        
        onTwintCommentChange(twintStatusText);
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
                <Image
                  src="/assets/images/qr-twint.jpg"
                  alt="TWINT QR Code"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="mb-4">
              {/* <p className="mb-2">
                {t('payment.twint.instructions_1', 'Scan the QR code with your TWINT app')}
              </p> */}
              <p className="mb-0 small text-muted">
                {t('payment.twint.instructions_2', 'Complete the payment and confirm below')}
              </p>
            </div>

            {/* Payment Options - Button Style (same as delivery methods/cantons) */}
            <div className="mb-3">
              <Row className="g-2">
                {twintOptions.map((option) => (
                  <Col md={6} key={option.id}>
                    <Button
                      variant={twintPaymentOption === option.id ? "primary" : "outline-primary"}
                      onClick={() => handleTwintOptionChange(option.id)}
                      className="w-100 h-100 d-flex flex-column align-items-center p-3 gap-2"
                    >
                      <div className="icon-wrapper">
                        {option.icon}
                      </div>
                      <div className="fw-medium text-center">{option.title}</div>
                      {/* <small className={twintPaymentOption === option.id ? "text-light" : "text-muted"}>
                        {option.description}
                      </small> */}
                    </Button>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Note about payment confirmation */}
            {/* <div className="small text-muted">
              <p className="mb-0">
                {twintPaymentOption === 'paid' 
                  ? t('payment.twint.note_paid', 'Підтвердіть, що оплата пройшла успішно')
                  : t('payment.twint.note_later', 'Ви зможете оплатити при отриманні замовлення')
                }
              </p>
            </div> */}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default PaymentMethodSelector;