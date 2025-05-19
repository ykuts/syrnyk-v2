import React, { useState, useEffect, useContext, useRef } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { apiClient } from '../utils/api';
import { CartContext } from '../context/CartContext';
import { useTranslation } from 'react-i18next';

/**
 * Component that calculates and displays delivery cost information
 * Enhanced with fallback mechanism in case of API errors
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
  const [calculationAttempted, setCalculationAttempted] = useState(false);
  
  // Create a ref to track previous values and avoid unnecessary recalculations
  const prevValuesRef = useRef({ deliveryType, postalCode, canton, totalPrice });
  
  // Calculate delivery cost when inputs change
  useEffect(() => {
    // Skip recalculation if inputs haven't meaningfully changed
    const prevValues = prevValuesRef.current;
    const inputsUnchanged = 
      prevValues.deliveryType === deliveryType &&
      prevValues.postalCode === postalCode &&
      prevValues.canton === canton &&
      prevValues.totalPrice === totalPrice;
      
    if (inputsUnchanged && calculationAttempted) {
      return;
    }
    
    // Update ref with current values
    prevValuesRef.current = { deliveryType, postalCode, canton, totalPrice };
    
    // Skip if no delivery type is selected or if postal code is invalid for address delivery
    if (!deliveryType || (deliveryType === 'ADDRESS' && (!postalCode || postalCode.length < 4))) {
      // Use default values when postal code is not provided for address delivery
      if (deliveryType === 'ADDRESS') {
        // Set a high minimum order amount to prevent checkout until postal code is valid
        onCostCalculated({
          cost: 0,
          isValid: false, 
          message: t('delivery.postal_code_required')
        });
      } else {
        // For non-address delivery methods, always valid with no cost
        onCostCalculated({
          cost: 0,
          isValid: true,
          message: t('delivery.free_delivery')
        });
      }
      setCalculationAttempted(true);
      return;
    }
    
    const calculateCost = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Calculating delivery cost:', {
          deliveryMethod: deliveryType,
          postalCode,
          cartTotal: totalPrice
        });
        
        // Try API call
        const response = await apiClient.post('/delivery/calculate-cost', {
          deliveryMethod: deliveryType,
          postalCode,
          canton: canton || 'GE',
          cartTotal: totalPrice
        });

        // Update state with response data
        setDeliveryCost(response.deliveryCost || 0);
        setMessage(response.message || '');
        setIsValid(response.isValid !== undefined ? response.isValid : true);
        setMinimumOrderAmount(response.minimumOrderAmount || 0);
        setCalculationAttempted(true);
        
        // Call the callback with the calculated data
        // Create a local copy of the data to avoid reference issues
        const resultData = {
          cost: response.deliveryCost || 0,
          isValid: response.isValid !== undefined ? response.isValid : true,
          message: response.message || ''
        };
        
        onCostCalculated(resultData);
      } catch (err) {
        console.error('Error calculating delivery cost:', err);
        setError(t('delivery.errors.cost_calculation_error'));
        setCalculationAttempted(true);
        
        // Fallback logic in case of API error
        if (deliveryType === 'ADDRESS') {
          // Use default cost for address delivery
          const defaultCost = 10;
          const isValid = totalPrice >= 100;
          
          // Pass fallback data to parent with a local copy
          const fallbackData = {
            cost: defaultCost,
            isValid,
            message: isValid 
              ? t('delivery.default_fee', { cost: defaultCost }) 
              : t('delivery.minimum_order_required', { minimum: 100 })
          };
          
          onCostCalculated(fallbackData);
        } else {
          // For non-address delivery methods, always valid with no cost
          onCostCalculated({
            cost: 0,
            isValid: true,
            message: t('delivery.free_delivery')
          });
        }
      } finally {
        setLoading(false);
      }
    };

    calculateCost();
    
    // Adding t to the dependency array can cause issues if translation keys change
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  if (error && calculationAttempted) {
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

  // Show message if calculation was successful
  if (calculationAttempted) {
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
  }
  
  // Default state - empty
  return null;
};

export default DeliveryCostCalculator;