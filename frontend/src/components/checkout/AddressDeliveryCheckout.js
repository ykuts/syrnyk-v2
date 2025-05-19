// src/components/checkout/AddressDeliveryCheckout.js
import React, { useState, useEffect, useContext } from 'react';
import { Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../../context/CartContext';
import { apiClient } from '../../utils/api';
import ImprovedDeliveryScheduler from './ImprovedDeliveryScheduler';

/**
 * Component for handling address delivery checkout
 * Includes postal code validation and delivery cost calculation
 */
const AddressDeliveryCheckout = ({ formData, handleChange }) => {
  const { t } = useTranslation(['checkout', 'common']);
  const { totalPrice } = useContext(CartContext);
  
  const [loading, setLoading] = useState(false);
  const [postalCodeValid, setPostalCodeValid] = useState(null);
  const [cityInfo, setCityInfo] = useState(null);
  const [postalCodeChecked, setPostalCodeChecked] = useState(false);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(200); // Default threshold
  const [error, setError] = useState(null);

  // Calculate delivery cost based on total price and thresholds
  const calculateDeliveryCost = (total, threshold) => {
    // Default delivery cost is 10 CHF
    // Free delivery if total is above threshold
    return total >= threshold ? 0 : 10;
  };

  // Fetch city info when postal code changes
  useEffect(() => {
    // Skip if postal code is empty or too short
    if (!formData.postalCode || formData.postalCode.length < 4) {
      setPostalCodeValid(null);
      setCityInfo(null);
      setPostalCodeChecked(false);
      return;
    }

    const fetchCityByPostalCode = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.get(`/delivery/cities/${formData.postalCode}`);
        
        if (response) {
          // City found in database
          setPostalCodeValid(true);
          setCityInfo(response);
          
          // Update city field
          handleChange({
            target: {
              name: 'city',
              value: response.name
            }
          });
          
          // Set free delivery threshold from city info
          setFreeDeliveryThreshold(response.freeThreshold || 200);
          
          // Calculate delivery cost based on city's threshold
          const cost = calculateDeliveryCost(totalPrice, response.freeThreshold || 200);
          setDeliveryCost(cost);
          
          // Update delivery cost in parent form
          handleChange({
            target: {
              name: 'deliveryCost',
              value: cost
            }
          });
        }
      } catch (err) {
        console.error('Error fetching city by postal code:', err);
        // Handle postal code not found - set default delivery rules
        setPostalCodeValid(false);
        setCityInfo(null);
        
        // Apply default delivery rules (10 CHF fee, free above 200 CHF)
        const defaultThreshold = 200;
        setFreeDeliveryThreshold(defaultThreshold);
        
        // Calculate delivery cost based on default threshold
        const cost = calculateDeliveryCost(totalPrice, defaultThreshold);
        setDeliveryCost(cost);
        
        // Update delivery cost in parent form
        handleChange({
          target: {
            name: 'deliveryCost',
            value: cost
          }
        });
      } finally {
        setLoading(false);
        setPostalCodeChecked(true);
      }
    };

    fetchCityByPostalCode();
  }, [formData.postalCode, totalPrice]);

  // Recalculate delivery cost when total price changes
  useEffect(() => {
    if (postalCodeChecked) {
      const cost = calculateDeliveryCost(totalPrice, freeDeliveryThreshold);
      setDeliveryCost(cost);
      
      // Update delivery cost in parent form
      handleChange({
        target: {
          name: 'deliveryCost',
          value: cost
        }
      });
    }
  }, [totalPrice, freeDeliveryThreshold, postalCodeChecked]);

  return (
    <div className="address-delivery-checkout">
      <h5 className="mb-3">{t('checkout.address_delivery')}</h5>
      
      {/* Delivery Cost Information */}
      {postalCodeChecked && (
        <Alert variant={deliveryCost === 0 ? "success" : "info"} className="mb-3">
          {deliveryCost === 0 ? (
            <>{t('checkout.free_delivery')}</>
          ) : (
            <>
              {t('checkout.delivery_fee')}: {deliveryCost} CHF
              <div className="mt-1 small">
                {t('checkout.free_delivery_above')} {freeDeliveryThreshold} CHF
              </div>
            </>
          )}
        </Alert>
      )}
      
      {/* Address Form */}
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          name="street"
          placeholder={t('checkout.street')}
          value={formData.street || ''}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              name="house"
              placeholder={t('checkout.house')}
              value={formData.house || ''}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              name="apartment"
              placeholder={t('checkout.apartment')}
              value={formData.apartment || ''}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              name="city"
              placeholder={t('checkout.city')}
              value={formData.city || ''}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <div className="input-group">
              <Form.Control
                type="text"
                name="postalCode"
                placeholder={t('checkout.postal_code')}
                value={formData.postalCode || ''}
                onChange={handleChange}
                required
                maxLength={4}
                isValid={postalCodeValid === true}
                isInvalid={postalCodeValid === false}
              />
              {loading && (
                <div className="input-group-append">
                  <span className="input-group-text bg-transparent border-0">
                    <Spinner size="sm" animation="border" />
                  </span>
                </div>
              )}
            </div>
            {postalCodeValid === false && (
              <Form.Text className="text-muted">
                {t('checkout.postal_code_not_found')} <br/>
                {t('checkout.standard_delivery_applied')}
              </Form.Text>
            )}
          </Form.Group>
        </Col>
      </Row>
      
      {/* Delivery Schedule */}
      <ImprovedDeliveryScheduler
        deliveryType="ADDRESS"
        selectedDate={formData.deliveryDate}
        onDateChange={handleChange}
        canton={cityInfo?.zone?.canton || 'GE'} // Default to Geneva if no city info
      />
      
      {/* Minimum Order Warning */}
      {totalPrice < 100 && (
        <Alert variant="warning" className="mt-3">
          {t('checkout.minimum_order_warning', { amount: 100 })}
        </Alert>
      )}
    </div>
  );
};

export default AddressDeliveryCheckout;