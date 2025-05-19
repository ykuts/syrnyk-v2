import React, { useState, useEffect, useContext, useRef } from 'react';
import { Form, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../utils/api';
import DeliveryMethodSelector from '../DeliveryMethodSelector';
import PickupCheckout from './PickupCheckout';
import RailwayStationCheckout from './RailwayStationCheckout';
import AddressDeliveryCheckout from './AddressDeliveryCheckout';
import { CartContext } from '../../context/CartContext';
import './DeliveryOptions.css';

/**
 * DeliveryOptions component for selecting delivery method and details
 * Updated to use canton-based delivery days with no time slots
 */
const DeliveryOptions = ({ formData, handleChange }) => {
  const { t } = useTranslation(['checkout', 'common']);
  const { totalPrice } = useContext(CartContext);
  
  // State for delivery cost
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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
    
    // Clear time slot as it's no longer needed
    handleChange({
      target: {
        name: 'deliveryTimeSlot',
        value: ''
      }
    });
  };
  
  // Calculate delivery cost when method, postal code, or total price changes
  useEffect(() => {
    // Skip if no delivery method, or if address delivery without postal code
    if (!formData.deliveryType || (formData.deliveryType === 'ADDRESS' && 
        (!formData.postalCode || formData.postalCode.length < 4))) {
      return;
    }
    
    const calculateDeliveryCost = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.post('/delivery/calculate-cost', {
          deliveryMethod: formData.deliveryType,
          postalCode: formData.postalCode,
          canton: formData.canton || 'GE', // Default to Geneva
          cartTotal: totalPrice
        });
        
        setDeliveryCost(response.deliveryCost || 0);
        
        // Update parent form with delivery cost
        handleChange({
          target: {
            name: 'deliveryCost',
            value: response.deliveryCost
          }
        });
        
        // If delivery is not valid, show an error
        if (!response.isValid) {
          setError(response.message);
        } else {
          setError(null);
        }
      } catch (err) {
        console.error('Error calculating delivery cost:', err);
        setError(t('delivery.errors.cost_calculation_error'));
      } finally {
        setLoading(false);
      }
    };

    calculateDeliveryCost();
  }, [formData.deliveryType, formData.postalCode, formData.canton, totalPrice, handleChange, t]);

  // Render different delivery forms based on selected method
  const renderDeliveryForm = () => {
    switch (formData.deliveryType) {
      case 'ADDRESS':
        return (
          <AddressDeliveryCheckout
            formData={formData}
            handleChange={handleChange}
            deliveryCost={deliveryCost}
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