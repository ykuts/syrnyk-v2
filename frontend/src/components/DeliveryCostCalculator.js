// src/components/DeliveryCostCalculator.js
import { useState, useEffect, useContext, useRef } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { CartContext } from '../context/CartContext';
import { useTranslation } from 'react-i18next';

/**
 * Component that calculates and displays delivery cost information
 * Fixed version that prevents infinite loops
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
  
  // Track previous values to avoid unnecessary recalculations
  const prevValuesRef = useRef({
    deliveryType,
    postalCode,
    canton,
    totalPrice
  });
  
  // Reference to track if we already called the callback for this render
  const callbackCalledRef = useRef(false);

  // Calculate delivery cost when inputs change
  useEffect(() => {
    // Only recalculate if inputs have changed
    const hasInputChanged = 
      prevValuesRef.current.deliveryType !== deliveryType ||
      prevValuesRef.current.postalCode !== postalCode ||
      prevValuesRef.current.canton !== canton ||
      prevValuesRef.current.totalPrice !== totalPrice;
      
    // Skip if nothing has changed to prevent infinite loops
    if (!hasInputChanged && callbackCalledRef.current) {
      return;
    }
    
    // Update our tracking of previous values
    prevValuesRef.current = {
      deliveryType,
      postalCode,
      canton,
      totalPrice
    };
    
    // Start calculation
    setLoading(true);
    setError(null);
    
    try {
      // Non-address delivery is always free
      if (deliveryType !== 'ADDRESS') {
        setDeliveryCost(0);
        setMessage(t('delivery.free_delivery'));
        setIsValid(true);
        
        if (!callbackCalledRef.current) {
          onCostCalculated({
            cost: 0,
            isValid: true,
            message: t('delivery.free_delivery')
          });
          callbackCalledRef.current = true;
        }
        
        setLoading(false);
        return;
      }
      
      // Missing postal code for address delivery
      if (!postalCode || postalCode.length < 4) {
        setDeliveryCost(0);
        setMessage(t('delivery.postal_code_required'));
        setIsValid(false);
        
        if (!callbackCalledRef.current) {
          onCostCalculated({
            cost: 0,
            isValid: false,
            message: t('delivery.postal_code_required')
          });
          callbackCalledRef.current = true;
        }
        
        setLoading(false);
        return;
      }
      
      // ===== Core delivery cost calculation =====
      const minimumOrder = 100; // Minimum order for address delivery
      const freeThreshold = 200;  // Free delivery threshold
      let cost = 0;
      let calculationMessage = '';
      let valid = true;
      
      // Check if order meets minimum amount
      if (totalPrice < minimumOrder) {
        valid = false;
        calculationMessage = t('delivery.minimum_order_required', { minimum: minimumOrder });
      } 
      // Check if order qualifies for free delivery
      else if (totalPrice >= freeThreshold) {
        cost = 0;
        calculationMessage = t('delivery.free_delivery_threshold', { threshold: freeThreshold });
      } 
      // Otherwise apply standard delivery fee
      else {
        cost = 10;
        calculationMessage = t('delivery.default_fee', { cost });
      }
      
      // Update component state
      setDeliveryCost(cost);
      setMessage(calculationMessage);
      setIsValid(valid);
      setMinimumOrderAmount(minimumOrder);
      
      // Call the callback with results (only once)
      if (!callbackCalledRef.current) {
        onCostCalculated({
          cost,
          isValid: valid,
          message: calculationMessage,
          minimumOrderAmount: minimumOrder
        });
        callbackCalledRef.current = true;
      }
      
    } catch (err) {
      console.error('Error calculating delivery cost:', err);
      setError(t('delivery.errors.cost_calculation_error'));
      
      // If we haven't called the callback yet, do it now with error defaults
      if (!callbackCalledRef.current) {
        onCostCalculated({
          cost: deliveryType === 'ADDRESS' ? 10 : 0,
          isValid: deliveryType !== 'ADDRESS' || totalPrice >= 100,
          message: deliveryType !== 'ADDRESS' 
            ? t('delivery.free_delivery')
            : (totalPrice >= 100 
                ? t('delivery.default_fee', { cost: 10 }) 
                : t('delivery.minimum_order_required', { minimum: 100 }))
        });
        callbackCalledRef.current = true;
      }
    } finally {
      setLoading(false);
    }
  }, [deliveryType, postalCode, canton, totalPrice, t, onCostCalculated]);

  // Reset callback tracking when inputs change
  useEffect(() => {
    callbackCalledRef.current = false;
  }, [deliveryType, postalCode, canton, totalPrice]);

  // Skip rendering for non-address delivery
  if (deliveryType !== 'ADDRESS') return null;
  
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
      <Alert variant="warning" className="my-3">
        {error}
        {deliveryCost > 0 && (
          <div className="mt-2">
            <strong>{t('delivery.default_fee', { cost: deliveryCost })}</strong>
          </div>
        )}
      </Alert>
    );
  }

  // Show delivery cost information
  return (
    <div className="delivery-cost-container my-3">
      {!isValid && minimumOrderAmount > 0 && (
        <Alert variant="warning">
          {t('delivery.minimum_order_warning', { amount: minimumOrderAmount })}
        </Alert>
      )}
      
      <div className={`delivery-cost-message ${deliveryCost > 0 ? 'text-primary' : 'text-success'}`}>
        {message || (deliveryCost > 0 
          ? t('delivery.cost_applied', { cost: deliveryCost }) 
          : t('delivery.free_delivery'))}
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