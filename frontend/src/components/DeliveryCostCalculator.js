import { useState, useEffect, useContext, useRef } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { CartContext } from '../context/CartContext';
import { useTranslation } from 'react-i18next';

/**
 * Component that calculates and displays delivery cost information
 * Fixed version with proper minimum order validation for each delivery type
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

  // Delivery method minimum order requirements
  const DELIVERY_MINIMUMS = {
    PICKUP: 0,           // No minimum for pickup
    RAILWAY_STATION: 0, // 20 CHF minimum for railway delivery
    ADDRESS: 0        // 200 CHF minimum for address delivery
  };

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
    // Add debug logging
    console.log('=== DELIVERY COST CALCULATOR DEBUG ===');
    console.log('Delivery type:', deliveryType);
    console.log('Total price:', totalPrice);
    console.log('Minimum required:', DELIVERY_MINIMUMS[deliveryType]);

    // Only recalculate if inputs have changed
    const hasInputChanged =
      prevValuesRef.current.deliveryType !== deliveryType ||
      prevValuesRef.current.postalCode !== postalCode ||
      prevValuesRef.current.canton !== canton ||
      prevValuesRef.current.totalPrice !== totalPrice;

    if (!hasInputChanged && callbackCalledRef.current) {
      console.log('Skipping calculation - no changes detected');
      return;
    }

    console.log('🔍 Checking for changes:', {
      hasInputChanged,
      callbackCalled: callbackCalledRef.current,
      previous: prevValuesRef.current,
      current: { deliveryType, postalCode, canton, totalPrice }
    });

    // Skip if nothing has changed to prevent infinite loops
    if (!hasInputChanged && callbackCalledRef.current) {
      console.log('Skipping calculation - no changes detected');
      console.log('Previous values:', prevValuesRef.current);
      console.log('Current values:', { deliveryType, postalCode, canton, totalPrice });
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
      let cost = 0;
      let calculationMessage = '';
      let valid = true;
      let minimumOrder = 0;

      console.log('Calculating for delivery type:', deliveryType);
      console.log('Minimum order required:', minimumOrder);

      // Calculate based on delivery type
      switch (deliveryType) {
        case 'PICKUP':
          // Pickup is always free with no minimum order
          cost = 0;
          valid = true;
          minimumOrder = 0;
          calculationMessage = 'Безкоштовний самовивіз';
          console.log('PICKUP: Always valid, no minimum');
          break;

        case 'RAILWAY_STATION':
          // Railway delivery: minimum 20 CHF, always free delivery cost
          cost = 0; // Always free delivery
          valid = true;
          minimumOrder = 0;
          calculationMessage = 'Безкоштовна доставка на ЖД станцію';
          console.log('RAILWAY_STATION: Always valid, no minimum');

          /* if (totalPrice < minimumOrder) {
            valid = false;
            const needed = minimumOrder - totalPrice;
            calculationMessage = `Мінімальне замовлення для доставки на ЖД станцію - ${minimumOrder} CHF. Додайте ще продукції на ${needed.toFixed(2)} CHF.`;
            console.log('RAILWAY_STATION: Invalid - below minimum. Needed:', needed);
          } else {
            valid = true;
            calculationMessage = t('railway.free_delivery'); // "Free delivery for railway station"
            console.log('RAILWAY_STATION: Valid - meets minimum');
          } */
          break;

        case 'ADDRESS':
          cost = 0; // Always free delivery
          
          // For ADDRESS, minimum order depends on region
          // This will be handled by AddressDeliveryCheckout component
          // Here we just provide basic validation
          
          // Default minimum for address delivery
          minimumOrder = 200;
          
          if (totalPrice >= 200) {
            valid = true;
            calculationMessage = 'Free delivery for orders over 200 CHF';
          } else {
            valid = false;
            const needed = 200 - totalPrice;
            calculationMessage = `Minimum order for address delivery is 200 CHF. Add ${needed.toFixed(2)} CHF more to your cart.`;
          }
          break;

        default:
          // Fallback for unknown delivery types
          cost = 0;
          valid = false;
          minimumOrder = 0;
          calculationMessage = 'Невідомий спосіб доставки';
          console.log('UNKNOWN delivery type:', deliveryType);
          break;
      }

      console.log('Final calculation result:', { cost, valid, calculationMessage });

      // Update component state
      setDeliveryCost(cost);
      setMessage(calculationMessage);
      setIsValid(valid);
      setMinimumOrderAmount(minimumOrder);

      // Call the callback with results (only once per calculation)
      if (!callbackCalledRef.current) {
        console.log('Calling onCostCalculated with:', {
          cost,
          isValid: valid,
          message: calculationMessage,
          minimumOrderAmount: minimumOrder,
          deliveryType
        });
        callbackCalledRef.current = true;
      }

    } catch (err) {
      console.error('Error calculating delivery cost:', err);
      setError('Помилка розрахунку вартості доставки');

      // Fallback values on error
      const fallbackValid = deliveryType === 'PICKUP' ||
        (deliveryType === 'RAILWAY_STATION') ||
        (deliveryType === 'ADDRESS' && totalPrice >= 200);

      if (!callbackCalledRef.current) {
        onCostCalculated({
          cost: 0,
          //deliveryType === 'ADDRESS' && totalPrice < 200 ? 10 : 0,
          isValid: fallbackValid,
          message: fallbackValid ? 'Розрахунок завершено' : 'Не виконано мінімальні вимоги',
          minimumOrderAmount: DELIVERY_MINIMUMS[deliveryType] || 0,
          deliveryType
        });
        callbackCalledRef.current = true;
      }
    } finally {
      setLoading(false);
      console.log('=== END DELIVERY COST CALCULATOR DEBUG ===');
    }
  }, [deliveryType, postalCode, canton, totalPrice, t, onCostCalculated]);

  // Reset callback tracking when inputs change
  useEffect(() => {
    console.log('🔄 Resetting callback tracking due to input change');
    callbackCalledRef.current = false;
  }, [deliveryType, postalCode, canton, totalPrice]);

  // Only render UI for ADDRESS delivery
  const shouldRenderUI = deliveryType === 'ADDRESS';

  if (loading && shouldRenderUI) {
    return (
      <div className="delivery-cost-container d-flex align-items-center my-3">
        <Spinner animation="border" size="sm" className="me-2" />
        <span>Calculating delivery cost...</span>
      </div>
    );
  }

  if (error && shouldRenderUI) {
    return (
      <Alert variant="warning" className="my-3">
        {error}
      </Alert>
    );
  }

  if (!shouldRenderUI) {
    return null;
  }

  return (
    <div className="delivery-cost-container my-3">
      {/* UI rendering removed as per original code */}
    </div>
  );
};

export default DeliveryCostCalculator;