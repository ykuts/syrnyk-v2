// src/components/checkout/AddressDeliveryCheckout.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Form, Alert, Spinner, Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import { useTranslation, Trans } from 'react-i18next';
import { CartContext } from '../../context/CartContext';
import { apiClient } from '../../utils/api';
import ImprovedDeliveryScheduler from './ImprovedDeliveryScheduler';

/**
 * Component for handling address delivery checkout
 * Updated logic:
 * - All delivery is FREE
 * - Coppet to Lausanne region: NO minimum order
 * - Geneva and other Vaud regions: 200 CHF minimum order
 */
const AddressDeliveryCheckout = ({ formData, handleChange, onValidationChange }) => {
  const { t } = useTranslation(['checkout', 'common']);
  const { totalPrice } = useContext(CartContext);

  const [loading, setLoading] = useState(false);
  const [postalCodeValid, setPostalCodeValid] = useState(null);
  const [cityInfo, setCityInfo] = useState(null);
  const [postalCodeChecked, setPostalCodeChecked] = useState(false);
  const [deliveryCost, setDeliveryCost] = useState(0); // Always free delivery
  const [minOrderRequired, setMinOrderRequired] = useState(0); // Minimum order requirement
  const [isValidOrder, setIsValidOrder] = useState(true); // Whether order meets requirements
  const [error, setError] = useState(null);

  // Track previous postal code to prevent duplicate API calls
  const previousPostalCodeRef = useRef(formData.postalCode);

  // Function to notify parent about validation status
  const notifyValidationChange = (isValid, minOrder, message) => {
    if (onValidationChange) {
      onValidationChange({
        isValid,
        minimumOrderAmount: minOrder,
        message,
        deliveryType: 'ADDRESS'
      });
    }
  };

  // Add this useEffect to the AddressDeliveryCheckout component to validate postal code on initial load
  useEffect(() => {
    // Validate postal code when component mounts if we have all required data
    if (formData.postalCode &&
      formData.canton &&
      formData.postalCode.length === 4 &&
      ['VD', 'GE'].includes(formData.canton)) {

      console.log('🏠 AddressDeliveryCheckout: Validating initial postal code:', {
        postalCode: formData.postalCode,
        canton: formData.canton
      });

      // Trigger validation for the loaded postal code
      // This will be handled by the existing useEffect that watches postalCode changes

      // Mark that we should check this postal code
      setPostalCodeChecked(false);

      // The existing useEffect will pick this up and validate
    }
  }, []); // Run only on mount

  // Set default canton to VD (Vaud) if not already set
  useEffect(() => {
    if (!formData.canton) {
      handleChange({
        target: {
          name: 'canton',
          value: 'VD', // Default to Vaud
          dataset: { automatic: 'true' }
        }
      });
    }
  }, []);

  // Handle canton change
  const handleCantonChange = (canton) => {
    // Update canton in parent form
    handleChange({
      target: {
        name: 'canton',
        value: canton,
        dataset: { automatic: 'true' }
      }
    });

    // Reset delivery date when canton changes (as delivery days differ by canton)
    handleChange({
      target: {
        name: 'deliveryDate',
        value: '',
        dataset: { automatic: 'true' }
      }
    });

    // Reset postal code validation when switching cantons
    setPostalCodeChecked(false);
    setPostalCodeValid(null);
    setCityInfo(null);
  };

  // Get delivery message for the selected canton with Trans component
  const getCantonDeliveryMessage = () => {
    const selectedCanton = formData.canton || 'VD';

    if (selectedCanton === 'VD') {
      return (
        <div className="delivery-message-formatted" >
          <div className="mb-2" style={{ textAlign: 'left' }}>
            <Trans
              i18nKey="delivery.vaud.coppet_lausanne_free"
              ns="checkout"
              components={{
                strong: <strong />,
              }}
            />
          </div>
          <div>
            <div className="mb-1" style={{ textAlign: 'left' }}>
              <Trans
                i18nKey="delivery.vaud.other_regions_title"
                ns="checkout"
                components={{
                  strong: <strong />,
                }}
              />
            </div>
            <ul className="ms-3" style={{ listStyle: 'none', paddingLeft: 0, textAlign: 'left' }}>
              <li>
                <Trans
                  i18nKey="delivery.vaud.rule_200_chf"
                  ns="checkout"
                  components={{
                    strong: <strong />,
                  }}
                />
              </li>
            </ul>
          </div>
        </div>
      );
    } else if (selectedCanton === 'GE') {
      return (
        <div className="delivery-message-formatted">
          <div className="mb-2" style={{ textAlign: 'left' }}>
            <Trans
              i18nKey="delivery.geneva.title"
              ns="checkout"
              components={{
                strong: <strong />,
              }}
            />
          </div>
          <div>
            <ul className="ms-3" style={{ listStyle: 'none', paddingLeft: 0, textAlign: 'left' }}>
              <li>
                <Trans
                  i18nKey="delivery.geneva.rule_200_chf"
                  ns="checkout"
                  components={{
                    strong: <strong />,
                  }}
                />
              </li>
            </ul>
          </div>
        </div>
      );
    }
    return '';
  };

  // Handle delivery validation and cost calculation based on canton selection
  useEffect(() => {
    const selectedCanton = formData.canton || 'VD';

    // Skip validation if no postal code
    if (!formData.postalCode || formData.postalCode.length < 4) {
      setLoading(false);
      // Default logic for missing postal code
      const minOrder = selectedCanton === 'GE' ? 200 : 200; // Both cantons have 200 CHF minimum by default
      setMinOrderRequired(minOrder);
      const orderValid = totalPrice >= minOrder;
      setIsValidOrder(orderValid);
      setDeliveryCost(0);

      const message = orderValid
        ? 'Free delivery for orders over 200 CHF'
        : `Minimum order is ${minOrder} CHF. Add ${(minOrder - totalPrice).toFixed(2)} CHF more.`;

      notifyValidationChange(orderValid, minOrder, message);

      handleChange({
        target: {
          name: 'deliveryCost',
          value: 0,
          dataset: { automatic: 'true' }
        }
      });
      return;
    }

    // Geneva canton logic (always 200 CHF minimum)
    if (selectedCanton === 'GE') {
      setLoading(false);
      const minOrder = 200;
      setMinOrderRequired(minOrder);
      const orderValid = totalPrice >= minOrder;
      setIsValidOrder(orderValid);
      setDeliveryCost(0);

      const message = orderValid
        ? 'Free delivery for orders over 200 CHF'
        : `Minimum order for Geneva delivery is 200 CHF. Add ${(minOrder - totalPrice).toFixed(2)} CHF more.`;

      notifyValidationChange(orderValid, minOrder, message);

      handleChange({
        target: {
          name: 'deliveryCost',
          value: 0,
          dataset: { automatic: 'true' }
        }
      });
      return;
    }

    // For Vaud (VD): check postal code to determine if it's Coppet-Lausanne region
    if (selectedCanton === 'VD') {
      // Skip if postal code hasn't changed and we already checked it
      if (formData.postalCode === previousPostalCodeRef.current && postalCodeChecked) {
        return;
      }

      // Update previous postal code reference
      previousPostalCodeRef.current = formData.postalCode;

      const fetchCityByPostalCode = async () => {
        setLoading(true);
        setError(null);

        try {
          console.log('🔍 Checking postal code:', formData.postalCode);
          const response = await apiClient.get(`/delivery/cities/${formData.postalCode}`);

          if (response) {
            // City found in our database - this is Coppet-Lausanne region
            console.log('✅ Postal code found in Coppet-Lausanne region:', response);
            setPostalCodeValid(true);
            setCityInfo(response);

            // Update city field with the found city name
            handleChange({
              target: {
                name: 'city',
                value: response.name,
                dataset: { automatic: 'true' }
              }
            });

            // Coppet-Lausanne region: NO minimum order, always free delivery
            setMinOrderRequired(0);
            setIsValidOrder(true); // Always valid for this region
            setDeliveryCost(0);

            // Notify parent: always valid for Coppet-Lausanne region
            notifyValidationChange(true, 0, 'Free delivery - no minimum order required for Coppet-Lausanne region');

            // Update parent's delivery cost
            handleChange({
              target: {
                name: 'deliveryCost',
                value: 0,
                dataset: { automatic: 'true' }
              }
            });
          } else {
            throw new Error('Postal code not found');
          }
        } catch (err) {
          console.log('❌ Postal code not in Coppet-Lausanne region, applying other Vaud rules');

          // Postal code not in our list - this is "other Vaud regions"
          setPostalCodeValid(false);
          setCityInfo(null);

          // Other Vaud regions: 200 CHF minimum order, free delivery
          const minOrder = 200;
          setMinOrderRequired(minOrder);
          const orderValid = totalPrice >= minOrder;
          setIsValidOrder(orderValid);
          setDeliveryCost(0);

          const message = orderValid
            ? 'Free delivery for orders over 200 CHF'
            : `Minimum order for other Vaud regions is 200 CHF. Add ${(minOrder - totalPrice).toFixed(2)} CHF more.`;

          notifyValidationChange(orderValid, minOrder, message);

          // Update parent's delivery cost
          handleChange({
            target: {
              name: 'deliveryCost',
              value: 0,
              dataset: { automatic: 'true' }
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

  // Recalculate order validity when total price changes
  useEffect(() => {
    if (minOrderRequired > 0) {
      const orderValid = totalPrice >= minOrderRequired;
      setIsValidOrder(orderValid);

      // Notify parent about validation status change
      const message = orderValid
        ? 'Free delivery for orders over 200 CHF'
        : `Minimum order is ${minOrderRequired} CHF. Add ${(minOrderRequired - totalPrice).toFixed(2)} CHF more.`;

      notifyValidationChange(orderValid, minOrderRequired, message);
    } else {
      // For Coppet-Lausanne region (no minimum)
      setIsValidOrder(true);
      notifyValidationChange(true, 0, 'Free delivery - no minimum order required');
    }
  }, [totalPrice, minOrderRequired]);


  return (
    <div className="address-delivery-checkout">
      <h5 className="mb-3">{t('delivery.address.title')}</h5>

      {/* Canton Selection - Responsive Buttons */}
      <Form.Group className="mb-3">
        <Form.Label>{t('address.canton')}</Form.Label>
        <Row className="canton-selector-row g-2" >
          <Col xs={6} md={6} > {/* xs=6 ensures 2 columns on mobile, md=6 keeps it same on desktop */}
            <Button
              variant={formData.canton === 'VD' ? 'primary' : 'outline-primary'}
              onClick={() => handleCantonChange('VD')}
              className="canton-btn w-100 text-center d-flex flex-column align-items-center justify-content-center"
            >
              <div className="canton-title fw-medium">{t('address.canton_VD')}</div>
              <small className={`canton-description ${formData.canton === 'VD' ? 'text-light' : 'text-muted'}`}>
                Vaud
              </small>
            </Button>
          </Col>
          <Col xs={6} md={6}>
            <Button
              variant={formData.canton === 'GE' ? 'primary' : 'outline-primary'}
              onClick={() => handleCantonChange('GE')}
              className="canton-btn w-100 text-center d-flex flex-column align-items-center justify-content-center"
            >
              <div className="canton-title fw-medium">{t('address.canton_GE')}</div>
              <small className={`canton-description ${formData.canton === 'GE' ? 'text-light' : 'text-muted'}`}>
                Geneva
              </small>
            </Button>
          </Col>
        </Row>

        {/* Conditional delivery message based on selected canton */}
        {(formData.canton === 'VD' || formData.canton === 'GE') && (
          <Alert variant="info" className="delivery-info-alert mt-2 mb-0" style={{ backgroundColor: '#e9e6e3', borderColor: '#e9e6e3', color: '#333' }}>
            <div className="small" >
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
                style={{
                  borderColor: formData.canton === 'VD' && postalCodeValid === false ? '#007bff' : undefined,
                  boxShadow: formData.canton === 'VD' && postalCodeValid === false ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' : undefined
                }}
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
                {t('address.postal_code_not_found')}
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

      {/* Minimum Order Warning - show when order doesn't meet minimum requirements */}
      {!isValidOrder && minOrderRequired > 0 && (
        <Alert variant="danger" className="mt-3">
          {t('checkout.minimum_order_warning_free', { amount: 200 - totalPrice.toFixed(2) })}
        </Alert>
      )}
    </div>
  );
};

export default AddressDeliveryCheckout;