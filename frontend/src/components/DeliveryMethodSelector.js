import React from 'react';
import { Package, Truck, Train } from 'lucide-react';
import { Row, Col, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import './DeliveryMethodSelector.css'; // Importing custom CSS for mobile styles

const DeliveryMethodSelector = ({ selectedMethod, onChange }) => {
  const { t } = useTranslation('checkout');
  
  const deliveryMethods = [
    {
      id: 'PICKUP',
      icon: <Package size={20} />, // Reduced icon size for mobile
      title: t('delivery.pickup.title'),
      description: t('delivery.pickup.description')
    },
    {
      id: 'ADDRESS',
      icon: <Truck size={20} />, // Reduced icon size for mobile
      title: t('delivery.address.title'),
      description: t('delivery.address.description')
    },
    {
      id: 'RAILWAY_STATION',
      icon: <Train size={20} />, // Reduced icon size for mobile
      title: t('delivery.railway.title'),
      description: t('delivery.railway.description')
    }
  ];

  const handleSelect = (methodId) => {
    onChange({
      target: {
        name: 'preferredDeliveryType',
        value: methodId
      }
    });
  };

  return (
    <Row className="delivery-methods-row g-2">
      {deliveryMethods.map((method) => (
        <Col xs={4} md={4} key={method.id}> {/* xs=4 ensures 3 columns on mobile */}
          <Button
            variant={selectedMethod === method.id ? "primary" : "outline-primary"}
            onClick={() => handleSelect(method.id)}
            className="delivery-method-btn w-100 h-100 d-flex flex-column align-items-center justify-content-center"
          >
            <div className="delivery-icon-wrapper mb-1">
              {method.icon}
            </div>
            <div className="delivery-title fw-medium text-center">{method.title}</div>
            <small className={`delivery-description text-center ${selectedMethod === method.id ? "text-light" : "text-muted"}`}>
              {method.description}
            </small>
          </Button>
        </Col>
      ))}
    </Row>
  );
};

export default DeliveryMethodSelector;