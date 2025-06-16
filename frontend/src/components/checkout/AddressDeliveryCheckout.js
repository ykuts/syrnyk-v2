// src/components/checkout/AddressDeliveryCheckout.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Form, Alert, Spinner, Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../../context/CartContext';
import { apiClient } from '../../utils/api';
import ImprovedDeliveryScheduler from './ImprovedDeliveryScheduler';

/**
 * Component for handling address delivery checkout
 * Features:
 * - Canton selection with buttons instead of select dropdown
 * - Conditional delivery messages based on selected canton
 * - Vaud (VD) is active by default
 * - Fixed delivery cost calculation to prevent infinite loops
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
  
  // Track previous postal code to prevent duplicate API calls
  const previousPostalCodeRef = useRef(formData.postalCode);
  // Track if we've already updated the parent's delivery cost
  const costUpdatedRef = useRef(false);

  // Set default canton to VD (Vaud) if not already set
  useEffect(() => {
  if (!formData.canton) {
    handleChange({
      target: {
        name: 'canton',
        value: 'VD' // Default to Vaud
      }
    });
  }
}, []);

  // Calculate delivery cost based on total price and thresholds
  const calculateDeliveryCost = (total, threshold) => {
    // Default delivery cost is 10 CHF
    // Free delivery if total is above threshold
    return total >= threshold ? 0 : 10;
  };

  // Handle canton change
  const handleCantonChange = (canton) => {
    // Update canton in parent form
    handleChange({
      target: {
        name: 'canton',
        value: canton
      }
    });
    
    // Reset delivery date when canton changes (as delivery days differ by canton)
    handleChange({
      target: {
        name: 'deliveryDate',
        value: ''
      }
    });
  };

  // Get delivery message for the selected canton
  const getCantonDeliveryMessage = () => {
    const selectedCanton = formData.canton || 'VD';
    
    if (selectedCanton === 'VD') {
      return t('address.delivery_message_VD', { amount: 100, cost: 10, freeAbove: 200 });
    } else if (selectedCanton === 'GE') {
      return t('address.delivery_message_GE', { amount: 100, cost: 10, freeAbove: 200 });
    }
    return '';
  };

  // Handle delivery cost calculation based on canton selection
  useEffect(() => {
    const selectedCanton = formData.canton || 'VD';
    
    // For Geneva (GE): immediate calculation without postal code validation
    if (selectedCanton === 'GE') {
      setLoading(false);
      setPostalCodeChecked(true);
      setPostalCodeValid(null); // No validation needed for Geneva
      setCityInfo(null);
      
      // Geneva: standard delivery rules (10 CHF fee, free above 200 CHF)
      const threshold = 200;
      setFreeDeliveryThreshold(threshold);
      
      const cost = calculateDeliveryCost(totalPrice, threshold);
      setDeliveryCost(cost);
      
      // Update parent's delivery cost
      handleChange({
        target: {
          name: 'deliveryCost',
          value: cost
        }
      });
      
      return;
    }
    
    // For Vaud (VD): check postal code only if it's provided and valid length
    if (selectedCanton === 'VD') {
      // Reset state when switching to VD
      setPostalCodeChecked(false);
      setPostalCodeValid(null);
      
      // Skip if postal code is not provided or too short
      if (!formData.postalCode || formData.postalCode.length < 4) {
        setLoading(false);
        return;
      }
      
      // Skip if postal code hasn't changed
      if (formData.postalCode === previousPostalCodeRef.current) {
        return;
      }
      
      // Update previous postal code reference
      previousPostalCodeRef.current = formData.postalCode;
      
      const fetchCityByPostalCode = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const response = await apiClient.get(`/delivery/cities/${formData.postalCode}`);
          
          if (response) {
            // City found in our database - free delivery for these postal codes
            setPostalCodeValid(true);
            setCityInfo(response);
            
            // Update city field
            handleChange({
              target: {
                name: 'city',
                value: response.name
              }
            });
            
            // Free delivery for postal codes in our list
            setFreeDeliveryThreshold(0); // Always free for listed postal codes
            const cost = 0; // Free delivery
            setDeliveryCost(cost);
            
            // Update parent's delivery cost
            handleChange({
              target: {
                name: 'deliveryCost',
                value: cost
              }
            });
          } else {
            throw new Error('Postal code not found');
          }
        } catch (err) {
          console.error('Error fetching city by postal code:', err);
          // Postal code not in our list - apply standard delivery rules
          setPostalCodeValid(false);
          setCityInfo(null);
          
          // Standard delivery rules for unlisted postal codes (10 CHF fee, free above 200 CHF)
          const threshold = 200;
          setFreeDeliveryThreshold(threshold);
          
          const cost = calculateDeliveryCost(totalPrice, threshold);
          setDeliveryCost(cost);
          
          // Update parent's delivery cost
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
    }
  }, [formData.postalCode, formData.canton, totalPrice]);

  // Reset cost update flag when postal code or canton changes
  useEffect(() => {
    costUpdatedRef.current = false;
  }, [formData.postalCode, formData.canton]);

  // Recalculate delivery cost when total price changes (for non-free delivery cases)
  useEffect(() => {
    if (postalCodeChecked && freeDeliveryThreshold > 0) {
      const cost = calculateDeliveryCost(totalPrice, freeDeliveryThreshold);
      setDeliveryCost(cost);
      
      // Update delivery cost in parent form - only if cost has changed
      if (cost !== formData.deliveryCost) {
        handleChange({
          target: {
            name: 'deliveryCost',
            value: cost
          }
        });
      }
    }
  }, [totalPrice, freeDeliveryThreshold, postalCodeChecked]);

  return (
    <div className="address-delivery-checkout">
      <h5 className="mb-3">{t('delivery.address.title')}</h5>

      {/* Delivery Cost Information */}
      {/* {((formData.canton === 'GE' && postalCodeChecked) || 
        (formData.canton === 'VD' && postalCodeChecked && formData.postalCode && formData.postalCode.length >= 4)) && (
        <Alert variant={deliveryCost === 0 ? "success" : "info"} className="mb-3">
          {deliveryCost === 0 ? (
            <>{formData.canton === 'VD' && postalCodeValid ? 
              'Бесплатная доставка для вашего региона!' : 
              t('checkout.free_delivery')}</>
          ) : (
            <>
              {t('address.delivery_fee')}: {deliveryCost} CHF
              <div className="mt-1 small">
                {t('checkout.free_delivery_above')} {freeDeliveryThreshold} CHF
              </div>
            </>
          )}
        </Alert>
      )} */}
      
      {/* Canton Selection - Separate Buttons */}
<Form.Group className="mb-3">
  <Form.Label>{t('address.canton')}</Form.Label>
  <Row className="g-2">
    <Col md={6}>
      <Button
        variant={formData.canton === 'VD' ? 'primary' : 'outline-primary'}
        onClick={() => handleCantonChange('VD')}
        className="w-100 text-center p-3"
      >
        {t('address.canton_VD')}
      </Button>
    </Col>
    <Col md={6}>
      <Button
        variant={formData.canton === 'GE' ? 'primary' : 'outline-primary'}
        onClick={() => handleCantonChange('GE')}
        className="w-100 text-center p-3"
      >
        {t('address.canton_GE')}
      </Button>
    </Col>
  </Row>
  
  {/* Conditional delivery message based on selected canton */}
  {(formData.canton === 'VD' || formData.canton === 'GE') && (
    <Alert variant="info" className="mt-2 mb-0">
      <div className="small">
        {getCantonDeliveryMessage()}
      </div>
    </Alert>
  )}
</Form.Group>
      
      {/* Address Form */}
      <Form.Group className="mb-3">
        <Form.Label>{t('address.street')}</Form.Label>
        <Form.Control
          type="text"
          name="street"
          placeholder={t('address.street')}
          value={formData.street || ''}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>{t('address.house')}</Form.Label>
            <Form.Control
              type="text"
              name="house"
              placeholder={t('address.house')}
              value={formData.house || ''}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>{t('address.apartment')}</Form.Label>
            <Form.Control
              type="text"
              name="apartment"
              placeholder={t('address.apartment')}
              value={formData.apartment || ''}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Form.Group className="mb-3">
            <Form.Label>{t('address.city')}</Form.Label>
            <Form.Control
              type="text"
              name="city"
              placeholder={t('address.city')}
              value={formData.city || ''}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>{t('address.postal_code')}</Form.Label>
            <div className="input-group">
              <Form.Control
                type="text"
                name="postalCode"
                placeholder={t('address.postal_code')}
                value={formData.postalCode || ''}
                onChange={handleChange}
                required={formData.canton === 'VD'} // Required only for Vaud canton
                maxLength={4}
                isValid={formData.canton === 'VD' ? postalCodeValid === true : undefined}
                isInvalid={undefined}
                style={{
                  borderColor: formData.canton === 'VD' && postalCodeValid === false ? '#007bff' : undefined,
                  boxShadow: formData.canton === 'VD' && postalCodeValid === false ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' : undefined
                }}
                /* isInvalid={formData.canton === 'VD' ? postalCodeValid === false : undefined} */
              />
              {loading && (
                <div className="input-group-append">
                  <span className="input-group-text bg-transparent border-0">
                    <Spinner size="sm" animation="border" />
                  </span>
                </div>
              )}
            </div>
            {formData.canton === 'VD' && postalCodeValid === false && (
              <Form.Text className="text-muted">
                {t('address.postal_code_not_found')} <br/>
                {t('address.standard_delivery_applied')}
              </Form.Text>
            )}
            {formData.canton === 'GE' && (
              <Form.Text className="text-muted">
                {/* Для Женевы проверка индекса не требуется */}
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
        canton={formData.canton || 'VD'} // Use selected canton, default to VD
      />
      
      {/* Minimum Order Warning */}
      {totalPrice < 100 && (
        <Alert variant="warning" className="mt-3 ">
          <span style={{ color: 'red' }}>
            {t('checkout.minimum_order_warning', { amount: 100 -totalPrice })}
          </span>
        </Alert>
      )}
      {totalPrice >= 100 && totalPrice < 200 && deliveryCost > 0 && (
        <Alert variant="info" className="mt-3 ">
            {t('checkout.minimum_order_warning_free', { amount: 200 - totalPrice })}
        </Alert>
      )}
    </div>
  );
};

export default AddressDeliveryCheckout;