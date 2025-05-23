import React from 'react';
import { Package, Truck, Train } from 'lucide-react';
import { Row, Col, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const DeliveryMethodSelector = ({ selectedMethod, onChange }) => {
  const { t } = useTranslation('checkout');
  const deliveryMethods = [
    {
      id: 'PICKUP',
      icon: <Package size={24} />,
      title: t('delivery.pickup.title'),
      description: t('delivery.pickup.description')
    },
    {
      id: 'ADDRESS',
      icon: <Truck size={24} />,
      title: t('delivery.address.title'),
      description: t('delivery.address.description')
    },
    {
      id: 'RAILWAY_STATION',
      icon: <Train size={24} />,
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
    <Row className="g-3">
      {deliveryMethods.map((method) => (
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

export default DeliveryMethodSelector;