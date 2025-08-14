import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, Banknote, CheckCircle, Clock } from 'lucide-react';
import { Row, Col, Button, Card, Image } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import './PaymentMethodSelector.css'; // Importing custom CSS for mobile styles

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
      icon: <Banknote size={20} />, // Reduced size for mobile adaptation
      disabled: false,
      title: t('payment.cash.title'),
      description: t('payment.cash.description')
    },
    {
      id: 'TWINT',
      icon: <Wallet size={20} />, // Reduced size for mobile adaptation
      disabled: false, 
      title: t('payment.twint.title'),
      description: t('payment.twint.description')
    },
    {
      id: 'CARD',
      icon: <CreditCard size={20} />, // Reduced size for mobile adaptation
      disabled: true,
      title: t('payment.card.title'),
      description: t('payment.card.description')
    }
  ];

  // Define TWINT payment options similar to payment methods
  const twintOptions = [
    {
      id: 'paid',
      icon: <CheckCircle size={18} />, // Smaller icons for TWINT options
      title: t('payment.twint.confirmation', 'Замовлення мною сплачено'),
      description: t('payment.twint.paid_description', 'Payment completed via TWINT')
    },
    {
      id: 'pay_on_delivery',
      icon: <Clock size={18} />, // Smaller icons for TWINT options
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
      {/* Main payment methods selection */}
      <Row className="payment-methods-row g-2">
        {paymentMethods.map((method) => (
          <Col xs={4} md={4} key={method.id}> {/* xs=4 ensures 3 columns on mobile */}
            <Button
              variant={selectedMethod === method.id ? "primary" : "outline-primary"}
              onClick={() => handleSelect(method.id)}
              disabled={method.disabled}
              className="payment-method-btn w-100 h-100 d-flex flex-column align-items-center justify-content-center"
            >
              <div className="payment-icon-wrapper mb-1">
                {method.icon}
              </div>
              <div className="payment-title fw-medium text-center">{method.title}</div>
              <small className={`payment-description text-center ${selectedMethod === method.id ? "text-light" : "text-muted"}`}>
                {method.description}
              </small>
            </Button>
          </Col>
        ))}
      </Row>

      {/* TWINT QR Code Section */}
      {selectedMethod === 'TWINT' && (
        <Card className="mt-4 twint-card">
          <Card.Body className="text-center">
            <h5 className="mb-3 twint-title">{t('payment.twint.qr_title', 'TWINT QR Code Payment')}</h5>
            
            {/* QR Code Image */}
            <div className="mb-4 qr-code-container">
              <div className="qr-code-wrapper mx-auto bg-light border rounded d-flex align-items-center justify-content-center">
                <Image
                  src="/assets/images/qr-twint.jpg"
                  alt="TWINT QR Code"
                  className="qr-code-image"
                />
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="mb-4 payment-instructions">
              <p className="mb-0 small text-muted">
                {t('payment.twint.instructions_2', 'Complete the payment and confirm below')}
              </p>
            </div>

            {/* TWINT Payment Options - Responsive Button Style */}
            <div className="mb-3">
              <Row className="twint-options-row g-2">
                {twintOptions.map((option) => (
                  <Col xs={6} md={6} key={option.id}> {/* xs=6 for 2 columns on mobile */}
                    <Button
                      variant={twintPaymentOption === option.id ? "primary" : "outline-primary"}
                      onClick={() => handleTwintOptionChange(option.id)}
                      className="twint-option-btn w-100 h-100 d-flex flex-column align-items-center justify-content-center"
                    >
                      <div className="twint-option-icon-wrapper mb-1">
                        {option.icon}
                      </div>
                      <div className="twint-option-title fw-medium text-center">{option.title}</div>
                    </Button>
                  </Col>
                ))}
              </Row>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default PaymentMethodSelector;