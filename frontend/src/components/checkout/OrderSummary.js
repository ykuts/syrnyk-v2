// src/components/checkout/OrderSummary.js
import React from 'react';
import { Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

/**
 * Order summary component for checkout
 * Displays subtotal, delivery cost, and final price
 */
const OrderSummary = ({ subtotal, deliveryCost, finalPrice }) => {
  const { t } = useTranslation('checkout');

  return (
    <Card className="mb-4 mt-4">
      <Card.Header>
        <h5 className="mb-0">{t('checkout.order_summary')}</h5>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between mb-2">
          <span>{t('checkout.subtotal')}:</span>
          <span>{subtotal.toFixed(2)} CHF</span>
        </div>
        
        {deliveryCost >= 0 && (
          <div className="d-flex justify-content-between mb-2">
            <span>{t('checkout.delivery_cost')}:</span>
            <span>{deliveryCost.toFixed(2)} CHF</span>
          </div>
        )}
        
        <div className="d-flex justify-content-between fw-bold fs-5 mt-3">
          <span>{t('checkout.total')}:</span>
          <span>{finalPrice.toFixed(2)} CHF</span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default OrderSummary;