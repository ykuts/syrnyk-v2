// src/components/DeliveryCostCalculator.js
import { useState, useEffect, useContext, useRef } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { apiClient } from '../utils/api';
import { CartContext } from '../context/CartContext';
import { useTranslation } from 'react-i18next';

/**
 * Component that calculates and displays delivery cost information
 * Enhanced with loop prevention mechanism
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
  
  // Add a flag to prevent multiple calculations in the same render cycle
  const calculationInProgress = useRef(false);
  
  // Track previous values to avoid unnecessary calculations
  const prevValues = useRef({
    deliveryType,
    postalCode,
    canton,
    totalPrice
  });
  
  // Add a counter to limit the number of calculations
  const calculationCount = useRef(0);
  const MAX_CALCULATIONS = 5; // Maximum number of calculations allowed

  // Calculate delivery cost when inputs change
  useEffect(() => {
    // Skip if calculation is already in progress
    if (calculationInProgress.current) {
      return;
    }
    
    // Check if any values have changed since last calculation
    const valuesChanged = 
      prevValues.current.deliveryType !== deliveryType ||
      prevValues.current.postalCode !== postalCode ||
      prevValues.current.canton !== canton ||
      prevValues.current.totalPrice !== totalPrice;
    
    // Skip if nothing has changed
    if (!valuesChanged) {
      return;
    }
    
    // Prevent too many calculations
    if (calculationCount.current >= MAX_CALCULATIONS) {
      console.warn('Maximum delivery cost calculations reached - stopping to prevent infinite loop');
      return;
    }
    
    // Skip if no delivery type is selected or if postal code is invalid for address delivery
    if (!deliveryType || (deliveryType === 'ADDRESS' && (!postalCode || postalCode.length < 4))) {
      // Use default values when postal code is not provided for address delivery
      if (deliveryType === 'ADDRESS') {
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
      return;
    }
    
    const calculateCost = async () => {
      calculationInProgress.current = true;
      calculationCount.current++;
      setLoading(true);
      setError(null);
      
      try {
        // Local calculation for non-ADDRESS delivery methods
        if (deliveryType !== 'ADDRESS') {
          setDeliveryCost(0);
          setMessage(t('delivery.free_delivery'));
          setIsValid(true);
          
          onCostCalculated({
            cost: 0,
            isValid: true,
            message: t('delivery.free_delivery')
          });
          
          calculationInProgress.current = false;
          return;
        }
        
        // Local calculation for ADDRESS with invalid postal code
        if (deliveryType === 'ADDRESS' && (!postalCode || postalCode.length < 4)) {
          setDeliveryCost(0);
          setMessage(t('delivery.postal_code_required'));
          setIsValid(false);
          
          onCostCalculated({
            cost: 0,
            isValid: false,
            message: t('delivery.postal_code_required')
          });
          
          calculationInProgress.current = false;
          return;
        }
        
        // For ADDRESS delivery with valid postal code, calculate based on total
        const defaultThreshold = 200; // Default free threshold
        const minimumOrder = 100; // Minimum order value
        
        // Calculate cost locally instead of API call
        let cost = 0;
        let resultMessage = '';
        let valid = true;
        
        if (totalPrice < minimumOrder) {
          valid = false;
          resultMessage = t('delivery.minimum_order_required', { minimum: minimumOrder });
        } else if (totalPrice >= defaultThreshold) {
          cost = 0;
          resultMessage = t('delivery.free_delivery_threshold', { threshold: defaultThreshold });
        } else {
          cost = 10;
          resultMessage = t('delivery.default_fee', { cost });
        }
        
        // Update states
        setDeliveryCost(cost);
        setMessage(resultMessage);
        setIsValid(valid);
        setMinimumOrderAmount(minimumOrder);
        
        // Call the callback with the calculated data
        onCostCalculated({
          cost,
          isValid: valid,
          message: resultMessage,
          minimumOrderAmount: minimumOrder
        });
        
        // Update previous values
        prevValues.current = {
          deliveryType,
          postalCode,
          canton,
          totalPrice
        };
      } catch (err) {
        console.error('Error calculating delivery cost:', err);
        setError(t('delivery.errors.cost_calculation_error'));
        
        // Fallback logic in case of error
        if (deliveryType === 'ADDRESS') {
          // Use default cost for address delivery
          const defaultCost = 10;
          const isValid = totalPrice >= 100;
          
          // Pass fallback data to parent
          onCostCalculated({
            cost: defaultCost,
            isValid,
            message: isValid 
              ? t('delivery.default_fee', { cost: defaultCost }) 
              : t('delivery.minimum_order_required', { minimum: 100 })
          });
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
        calculationInProgress.current = false;
      }
    };

    calculateCost();
  }, [deliveryType, postalCode, canton, totalPrice, t, onCostCalculated]);

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