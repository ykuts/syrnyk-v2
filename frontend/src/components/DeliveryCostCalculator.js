// src/components/DeliveryCostCalculator.js
import React, { useState, useEffect, useContext } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { apiClient } from '../utils/api';
import { CartContext } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
/**

Component that calculates and displays delivery cost information
*/
const DeliveryCostCalculator = ({
deliveryType,
postalCode,
canton,
onCostCalculated
}) => {
const { t } = useTranslation('checkout');
const { totalPrice } = useContext(CartContext);

const [loading, setLoading] = useState(false);
const [deliveryCost, setDeliveryCost] = useState(0);
const [message, setMessage] = useState('');
const [error, setError] = useState(null);
const [isValid, setIsValid] = useState(true);
const [minimumOrderAmount, setMinimumOrderAmount] = useState(0);
// Calculate delivery cost when inputs change
useEffect(() => {
const calculateCost = async () => {
// Skip if no delivery type is selected
if (!deliveryType) return;
  setLoading(true);
  setError(null);

  try {
    const response = await apiClient.post('/delivery/calculate-cost', {
      deliveryMethod: deliveryType,
      postalCode,
      canton,
      cartTotal: totalPrice
    });

    // Update state with response data
    setDeliveryCost(response.deliveryCost || 0);
    setMessage(response.message || '');
    setIsValid(response.isValid !== undefined ? response.isValid : true);
    setMinimumOrderAmount(response.minimumOrderAmount || 0);
    
    // Call the callback with the calculated data
    onCostCalculated({
      cost: response.deliveryCost || 0,
      isValid: response.isValid !== undefined ? response.isValid : true,
      message: response.message || ''
    });
  } catch (err) {
    console.error('Error calculating delivery cost:', err);
    setError(t('delivery.errors.cost_calculation_error'));
    
    // Pass error state to parent
    onCostCalculated({
      cost: 0,
      isValid: false,
      message: t('delivery.errors.cost_calculation_error')
    });
  } finally {
    setLoading(false);
  }
};

calculateCost();
}, [deliveryType, postalCode, canton, totalPrice, onCostCalculated, t]);
// Skip rendering if no delivery type selected
if (!deliveryType) return null;
// Show loading state
if (loading) {
return (
<div className="delivery-cost-container d-flex align-items-center my-3">
<Spinner animation="border" size="sm" className="me-2" />
<span>{t('delivery.calculating')}</span>
</div>
);
}
// Show error state
if (error) {
return (
<Alert variant="danger" className="my-3">
{error}
</Alert>
);
}
// Show the delivery cost info
return (
<div className="delivery-cost-container my-3">
{!isValid && minimumOrderAmount > 0 && (
<Alert variant="warning">
{t('delivery.minimum_order_warning', { amount: minimumOrderAmount })}
</Alert>
)}
  <div className={`delivery-cost-message ${deliveryCost > 0 ? 'text-primary' : 'text-success'}`}>
    {message}
  </div>
  
  {deliveryCost > 0 && (
    <div className="delivery-cost-amount mt-2">
      <strong>{t('delivery.cost')}: </strong> {deliveryCost.toFixed(2)} CHF
    </div>
  )}
</div>
);
};
export default DeliveryCostCalculator;