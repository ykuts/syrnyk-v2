import React, { useState, useEffect, useContext } from 'react';
import { Form, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../utils/api';
import DeliveryMethodSelector from '../DeliveryMethodSelector';
import StationSelector from '../StationSelector';
import { CartContext } from '../../context/CartContext';
import './DeliveryOptions.css';

/**
 * DeliveryOptions component for selecting delivery method and details
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data from parent component
 * @param {Function} props.handleChange - Handler for form changes
 */
const DeliveryOptions = ({ formData, handleChange }) => {
  const { t } = useTranslation(['checkout', 'common']);
  const { totalPrice } = useContext(CartContext);
  
  // State for API data
  const [railwayStations, setRailwayStations] = useState([]);
  const [pickupLocations, setPickupLocations] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [cities, setCities] = useState([]);
  const [deliveryCost, setDeliveryCost] = useState(0);
  
  // Loading and error states
  const [loading, setLoading] = useState({
    stations: false,
    pickupLocations: false,
    dates: false,
    timeSlots: false,
    deliveryCost: false
  });
  const [error, setError] = useState(null);
  
  // Current delivery method
  const deliveryMethod = formData.deliveryType;

  // Fetch railway stations
  useEffect(() => {
    const fetchStations = async () => {
      if (deliveryMethod !== 'RAILWAY_STATION') return;
      
      setLoading(prev => ({ ...prev, stations: true }));
      try {
        const response = await apiClient.get('/railway-stations');
        setRailwayStations(response.data || []);
      } catch (err) {
        console.error('Error fetching stations:', err);
        setError('Failed to load railway stations');
      } finally {
        setLoading(prev => ({ ...prev, stations: false }));
      }
    };

    fetchStations();
  }, [deliveryMethod]);

  // Fetch pickup locations
  useEffect(() => {
    const fetchPickupLocations = async () => {
      if (deliveryMethod !== 'PICKUP') return;
      
      setLoading(prev => ({ ...prev, pickupLocations: true }));
      try {
        const response = await apiClient.get('/delivery/pickup-locations');
        setPickupLocations(response || []);
      } catch (err) {
        console.error('Error fetching pickup locations:', err);
        setError('Failed to load pickup locations');
      } finally {
        setLoading(prev => ({ ...prev, pickupLocations: false }));
      }
    };

    fetchPickupLocations();
  }, [deliveryMethod]);

  // Calculate delivery cost when method or postal code changes
  useEffect(() => {
    const calculateDeliveryCost = async () => {
      if (!deliveryMethod) return;
      
      setLoading(prev => ({ ...prev, deliveryCost: true }));
      try {
        const response = await apiClient.post('/delivery/calculate-cost', {
          deliveryMethod,
          postalCode: formData.postalCode,
          canton: 'GE', // Default canton, could be dynamic
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
        
        // If delivery is not valid (e.g., minimum order not met), show an error
        if (!response.isValid) {
          setError(response.message);
        } else {
          setError(null);
        }
      } catch (err) {
        console.error('Error calculating delivery cost:', err);
        setError('Failed to calculate delivery cost');
      } finally {
        setLoading(prev => ({ ...prev, deliveryCost: false }));
      }
    };

    calculateDeliveryCost();
  }, [deliveryMethod, formData.postalCode, totalPrice, handleChange]);

  // Fetch available dates when delivery method changes
  useEffect(() => {
    const fetchAvailableDates = async () => {
      if (!deliveryMethod) return;
      
      setLoading(prev => ({ ...prev, dates: true }));
      try {
        const params = {
          deliveryMethod,
          canton: 'GE' // Default canton, could be dynamic
        };
        
        // Add zoneId if we have one from city lookup
        if (formData.zoneId) {
          params.zoneId = formData.zoneId;
        }
        
        const response = await apiClient.get('/delivery/available-dates', { params });
        
        if (response.availableDates && response.availableDates.length > 0) {
          setAvailableDates(response.availableDates);
          
          // Auto-select first date if none is selected
          if (!formData.deliveryDate && response.availableDates.length > 0) {
            handleChange({
              target: {
                name: 'deliveryDate',
                value: response.availableDates[0].date
              }
            });
          }
        } else {
          setAvailableDates([]);
        }
      } catch (err) {
        console.error('Error fetching available dates:', err);
        setError('Failed to load available delivery dates');
      } finally {
        setLoading(prev => ({ ...prev, dates: false }));
      }
    };

    fetchAvailableDates();
  }, [deliveryMethod, formData.zoneId, formData.deliveryDate, handleChange]);

  // Fetch time slots when delivery date changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!deliveryMethod || !formData.deliveryDate) return;
      
      setLoading(prev => ({ ...prev, timeSlots: true }));
      try {
        // Get day of week from selected date
        const selectedDate = new Date(formData.deliveryDate);
        const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        const params = { dayOfWeek };
        
        // Add zoneId if we have one from city lookup
        if (formData.zoneId) {
          params.zoneId = formData.zoneId;
        }
        
        const response = await apiClient.get('/delivery/time-slots', { params });
        
        if (response && response.length > 0) {
          setTimeSlots(response);
          
          // Auto-select first time slot if none is selected
          if (!formData.deliveryTimeSlot && response.length > 0) {
            handleChange({
              target: {
                name: 'deliveryTimeSlot',
                value: response[0].id.toString()
              }
            });
          }
        } else {
          setTimeSlots([]);
        }
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setError('Failed to load delivery time slots');
      } finally {
        setLoading(prev => ({ ...prev, timeSlots: false }));
      }
    };

    fetchTimeSlots();
  }, [deliveryMethod, formData.deliveryDate, formData.zoneId, formData.deliveryTimeSlot, handleChange]);

  // Fetch city details when postal code changes
  useEffect(() => {
    const fetchCityByPostalCode = async () => {
      if (!formData.postalCode || deliveryMethod !== 'ADDRESS' || formData.postalCode.length < 4) return;
      
      try {
        const response = await apiClient.get(`/delivery/cities/${formData.postalCode}`);
        
        if (response) {
          // Update zone ID in parent form for use in other API calls
          handleChange({
            target: {
              name: 'zoneId',
              value: response.zoneId.toString()
            }
          });
          
          // Store city info for display
          setCities([response]);
        } else {
          setCities([]);
          handleChange({
            target: {
              name: 'zoneId',
              value: ''
            }
          });
        }
      } catch (err) {
        console.error('Error fetching city by postal code:', err);
        setCities([]);
        handleChange({
          target: {
            name: 'zoneId',
            value: ''
          }
        });
      }
    };

    fetchCityByPostalCode();
  }, [formData.postalCode, deliveryMethod, handleChange]);

  // Render different sections based on delivery method
  const renderDeliverySection = () => {
    const isLoading = Object.values(loading).some(status => status);
    
    if (isLoading) {
      return (
        <div className="text-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">{t('checkout.loading_delivery')}</p>
        </div>
      );
    }

    switch (deliveryMethod) {
      case 'ADDRESS':
        return renderAddressDelivery();
      case 'RAILWAY_STATION':
        return renderRailwayStationDelivery();
      case 'PICKUP':
        return renderPickupDelivery();
      default:
        return null;
    }
  };

  // Render address delivery form
  const renderAddressDelivery = () => (
    <div>
      <h5 className="mb-3">{t('checkout.address_delivery')}</h5>
      
      {error && (
        <Alert variant="warning" className="mb-3">
          {error}
        </Alert>
      )}
      
      {deliveryCost > 0 && (
        <Alert variant="info" className="mb-3">
          {t('checkout.delivery_fee')}: {deliveryCost} CHF
        </Alert>
      )}
      
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
            <Form.Control
              type="text"
              name="postalCode"
              placeholder={t('checkout.postal_code')}
              value={formData.postalCode || ''}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>
      
      {renderDeliveryDate()}
      {renderTimeSlot()}
    </div>
  );

  // Render railway station delivery form
  const renderRailwayStationDelivery = () => (
    <div>
      <h5 className="mb-3">{t('checkout.railway_delivery')}</h5>
      
      <StationSelector
        stations={railwayStations}
        selectedStation={formData.stationId || ''}
        meetingTime={formData.meetingTime || ''}
        onChange={handleChange}
      />
    </div>
  );

  // Render pickup delivery form
  const renderPickupDelivery = () => (
    <div>
      <h5 className="mb-3">{t('checkout.pickup')}</h5>
      
      {pickupLocations.length > 0 ? (
        <Form.Group className="mb-3">
          <Form.Label>{t('checkout.pickup_location')}</Form.Label>
          <Form.Select
            name="storeId"
            value={formData.storeId || ''}
            onChange={handleChange}
            required
          >
            <option value="">{t('checkout.select_pickup')}</option>
            {pickupLocations.map(location => (
              <option key={location.id} value={location.id.toString()}>
                {location.name} - {location.address}, {location.city}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      ) : (
        <Alert variant="warning">
          {t('checkout.no_pickup_locations')}
        </Alert>
      )}
      
      {renderDeliveryDate()}
      {renderTimeSlot()}
    </div>
  );

  // Render delivery date selection
  const renderDeliveryDate = () => (
    <Form.Group className="mb-3">
      <Form.Label>{t('checkout.delivery_date')}</Form.Label>
      {availableDates.length > 0 ? (
        <Form.Select
          name="deliveryDate"
          value={formData.deliveryDate || ''}
          onChange={handleChange}
          required
        >
          <option value="">{t('checkout.select_date')}</option>
          {availableDates.map(date => (
            <option key={date.date} value={date.date}>
              {date.date} ({date.dayName})
            </option>
          ))}
        </Form.Select>
      ) : (
        <Alert variant="warning">
          {t('checkout.no_delivery_dates')}
        </Alert>
      )}
    </Form.Group>
  );

  // Render time slot selection
  const renderTimeSlot = () => (
    <Form.Group className="mb-3">
      <Form.Label>{t('checkout.time_slot')}</Form.Label>
      {timeSlots.length > 0 ? (
        <Form.Select
          name="deliveryTimeSlot"
          value={formData.deliveryTimeSlot || ''}
          onChange={handleChange}
          required
        >
          <option value="">{t('checkout.select_time')}</option>
          {timeSlots.map(slot => (
            <option key={slot.id} value={slot.id.toString()}>
              {slot.name} ({slot.startTime} - {slot.endTime})
            </option>
          ))}
        </Form.Select>
      ) : (
        <Alert variant="warning">
          {t('checkout.no_time_slots')}
        </Alert>
      )}
    </Form.Group>
  );

  return (
    <section className="mb-5">
      <h4 className="mb-3">{t('checkout.delivery_method')}</h4>
      
      {/* Delivery Method Selection */}
      <DeliveryMethodSelector
        selectedMethod={deliveryMethod || ''}
        onChange={handleChange}
      />
      
      {/* Render delivery details section */}
      {deliveryMethod && (
        <Card className="mt-4">
          <Card.Body>
            {renderDeliverySection()}
          </Card.Body>
        </Card>
      )}
    </section>
  );
};

export default DeliveryOptions;