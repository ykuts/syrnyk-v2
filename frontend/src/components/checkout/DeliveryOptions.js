// src/components/checkout/DeliveryOptions.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Form, Card, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../../context/CartContext';
import DeliveryMethodSelector from '../DeliveryMethodSelector';
import PickupCheckout from './PickupCheckout';
import RailwayStationCheckout from './RailwayStationCheckout';
import AddressDeliveryCheckout from './AddressDeliveryCheckout';
import './DeliveryOptions.css';

/**
 * DeliveryOptions component for selecting delivery method and details
 * Fixed to improve handling of delivery cost calculation
 */
const DeliveryOptions = ({ formData, handleChange, onAddressValidation }) => {
  const { t } = useTranslation(['checkout', 'common']);
  const { totalPrice } = useContext(CartContext);
  
  const [error, setError] = useState(null);
  const deliveryCostRef = useRef(null);
  
  // Handle delivery method change
  const handleDeliveryMethodChange = (e) => {
    const { value } = e.target;
    
    // Reset delivery date and time slot when changing method
    handleChange({
      target: {
        name: 'preferredDeliveryType',
        value
      }
    });
    
    handleChange({
      target: {
        name: 'deliveryType',
        value
      }
    });
    
    handleChange({
      target: {
        name: 'deliveryDate',
        value: ''
      }
    });
    
    // Clear time slot
    handleChange({
      target: {
        name: 'deliveryTimeSlot',
        value: ''
      }
    });
    
    // Reset delivery cost for non-address methods
    if (value !== 'ADDRESS') {
      handleChange({
        target: {
          name: 'deliveryCost',
          value: 0
        }
      });
      // For non-address methods, notify parent that delivery is valid
      if (onAddressValidation) {
        const message = value === 'PICKUP' 
          ? 'Free pickup - no minimum order required'
          : 'Free railway station delivery';
          
        onAddressValidation({
          isValid: true,
          minimumOrderAmount: 0,
          message,
          deliveryType: value
        });
      }
    }
  };
  
  // Handle delivery cost calculation result
  const handleDeliveryCostCalculated = (result) => {
    // Store result in ref to avoid unnecessary updates
    if (
      !deliveryCostRef.current || 
      deliveryCostRef.current.cost !== result.cost ||
      deliveryCostRef.current.isValid !== result.isValid
    ) {
      deliveryCostRef.current = result;
      
      // Update error message if delivery is not valid
      setError(result.isValid ? null : result.message);
      
      // Update form data with delivery cost
      handleChange({
        target: {
          name: 'deliveryCost',
          value: result.cost
        }
      });
    }
  };

  // Handle address delivery validation
  const handleAddressValidation = (validationResult) => {
    console.log('Address validation result:', validationResult);
    
    // Pass validation result to parent (CheckoutPage)
    if (onAddressValidation) {
      onAddressValidation(validationResult);
    }
  };

  // Render different delivery forms based on selected method
  const renderDeliveryForm = () => {
    switch (formData.deliveryType) {
      case 'ADDRESS':
        return (
          <AddressDeliveryCheckout
            formData={formData}
            handleChange={handleChange}
            onValidationChange={handleAddressValidation}
          />
        );
      case 'RAILWAY_STATION':
        return (
          <RailwayStationCheckout
            formData={formData}
            handleChange={handleChange}
          />
        );
      case 'PICKUP':
        return (
          <PickupCheckout
            formData={formData}
            handleChange={handleChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <section className="mb-5">
      <h4 className="mb-3">{t('checkout.delivery_method')}</h4>
      
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      {/* Delivery Method Selection */}
      <DeliveryMethodSelector
        selectedMethod={formData.deliveryType || ''}
        onChange={handleDeliveryMethodChange}
      />
      
      {/* Render delivery form based on selected method */}
      {formData.deliveryType && (
        <Card className="mt-4">
          <Card.Body>
            {renderDeliveryForm()}
          </Card.Body>
        </Card>
      )}
    </section>
  );
};

export default DeliveryOptions;