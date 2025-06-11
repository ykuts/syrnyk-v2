// src/components/checkout/AddressDeliveryCheckout.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../../context/CartContext';
import { apiClient } from '../../utils/api';
import ImprovedDeliveryScheduler from './ImprovedDeliveryScheduler';

/**
 * Component for handling address delivery checkout
 * Fixed to prevent infinite loops in delivery cost calculation
 * Added canton selection for delivery days
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

  // Calculate delivery cost based on total price and thresholds
  const calculateDeliveryCost = (total, threshold) => {
    // Default delivery cost is 10 CHF
    // Free delivery if total is above threshold
    return total >= threshold ? 0 : 10;
  };

  // Handle canton change
  const handleCantonChange = (e) => {
    // Update canton in parent form
    handleChange(e);
    
    // Reset delivery date when canton changes (as delivery days differ by canton)
    handleChange({
      target: {
        name: 'deliveryDate',
        value: ''
      }
    });
  };

  // Fetch city info when postal code changes and is valid
  useEffect(() => {
    // Skip if postal code hasn't changed or is too short
    if (
      !formData.postalCode || 
      formData.postalCode.length < 4 ||
      formData.postalCode === previousPostalCodeRef.current
    ) {
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
          
          // If the city has a canton, update the canton field
          if (response.zone?.canton) {
            handleChange({
              target: {
                name: 'canton',
                value: response.zone.canton
              }
            });
          }
          
          // Set free delivery threshold from city info
          const threshold = response.freeThreshold || 200;
          setFreeDeliveryThreshold(threshold);
          
          // Calculate delivery cost based on city's threshold
          const cost = calculateDeliveryCost(totalPrice, threshold);
          setDeliveryCost(cost);
          
          // Only update parent's delivery cost once per postal code change
          if (!costUpdatedRef.current) {
            handleChange({
              target: {
                name: 'deliveryCost',
                value: cost
              }
            });
            costUpdatedRef.current = true;
          }
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
        
        // Only update parent's delivery cost once per postal code change
        if (!costUpdatedRef.current) {
          handleChange({
            target: {
              name: 'deliveryCost',
              value: cost
            }
          });
          costUpdatedRef.current = true;
        }
      } finally {
        setLoading(false);
        setPostalCodeChecked(true);
      }
    };

    fetchCityByPostalCode();
  }, [formData.postalCode]);

  // Reset cost update flag when postal code changes
  useEffect(() => {
    costUpdatedRef.current = false;
  }, [formData.postalCode]);

  // Recalculate delivery cost when total price changes
  useEffect(() => {
    if (postalCodeChecked) {
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
      
      {/* Canton Selection */}
      <Form.Group className="mb-3">
        <Form.Label>{t('address.canton')}</Form.Label>
        <Form.Select
          name="canton"
          value={formData.canton || 'GE'}
          onChange={handleCantonChange}
          required
        >
          <option value="GE">Geneva (Monday delivery)</option>
          <option value="VD">Vaud (Saturday delivery)</option>
        </Form.Select>
        <Form.Text className="text-muted">
          {formData.canton === 'VD' 
            ? t('address.vaud_delivery_days', { defaultValue: 'Delivery in Vaud is available on Saturdays' })
            : t('address.geneva_delivery_days', { defaultValue: 'Delivery in Geneva is available on Mondays' })}
        </Form.Text>
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
                {t('address.postal_code_not_found')} <br/>
                {t('address.standard_delivery_applied')}
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
        canton={formData.canton || 'GE'} // Use selected canton
      />
      
      {/* Minimum Order Warning */}
      {totalPrice < 100 && (
        <Alert variant="warning" className="mt-3">
          {t('checkout.minimum_order_warning', { amount: 100 })} 100 CHF
        </Alert>
      )}
    </div>
  );
};

export default AddressDeliveryCheckout;