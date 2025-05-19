import React, { useState, useEffect, useContext, useRef } from 'react';
import { Form, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../utils/api';
import DeliveryMethodSelector from '../DeliveryMethodSelector';
import PickupCheckout from './PickupCheckout';
import RailwayStationCheckout from './RailwayStationCheckout';
import StationSelector from '../StationSelector';
import { CartContext } from '../../context/CartContext';
import './DeliveryOptions.css';

/**
 * DeliveryOptions component for selecting delivery method and details
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
  
  // Refs to track previous values and prevent unnecessary API calls
  const prevDeliveryMethod = useRef(deliveryMethod);
  const prevPostalCode = useRef(formData.postalCode);
  const prevZoneId = useRef(formData.zoneId);
  const prevDeliveryDate = useRef(formData.deliveryDate);
  const prevTotalPrice = useRef(totalPrice);
  
  // Refs to track API call states
  const fetchingStations = useRef(false);
  const fetchingPickupLocations = useRef(false);
  const fetchingDates = useRef(false);
  const fetchingTimeSlots = useRef(false);
  const calculatingDeliveryCost = useRef(false);

  // Debug logging
  console.log('DeliveryOptions render:', { 
    deliveryMethod, 
    postalCode: formData.postalCode,
    zoneId: formData.zoneId,
    deliveryDate: formData.deliveryDate
  });

  // Fetch railway stations
  useEffect(() => {
    // Skip if already loading or if delivery method hasn't changed
    if (fetchingStations.current || deliveryMethod !== 'RAILWAY_STATION' || 
        prevDeliveryMethod.current === deliveryMethod) {
      return;
    }
    
    const fetchStations = async () => {
      fetchingStations.current = true;
      setLoading(prev => ({ ...prev, stations: true }));
      
      try {
        console.log('Fetching railway stations');
        const response = await apiClient.get('/railway-stations');
        setRailwayStations(response.data || []);
      } catch (err) {
        console.error('Error fetching stations:', err);
        setError('Failed to load railway stations');
      } finally {
        setLoading(prev => ({ ...prev, stations: false }));
        fetchingStations.current = false;
      }
    };

    fetchStations();
    prevDeliveryMethod.current = deliveryMethod;
  }, [deliveryMethod]);

  // Fetch pickup locations
  useEffect(() => {
    // Skip if already loading or if delivery method hasn't changed
    if (fetchingPickupLocations.current || deliveryMethod !== 'PICKUP' || 
        prevDeliveryMethod.current === deliveryMethod) {
      return;
    }
    
    const fetchPickupLocations = async () => {
      fetchingPickupLocations.current = true;
      setLoading(prev => ({ ...prev, pickupLocations: true }));
      
      try {
        console.log('Fetching pickup locations');
        const response = await apiClient.get('/delivery/pickup-locations');
        setPickupLocations(response || []);
      } catch (err) {
        console.error('Error fetching pickup locations:', err);
        setError('Failed to load pickup locations');
      } finally {
        setLoading(prev => ({ ...prev, pickupLocations: false }));
        fetchingPickupLocations.current = false;
      }
    };

    fetchPickupLocations();
    prevDeliveryMethod.current = deliveryMethod;
  }, [deliveryMethod]);

  // Calculate delivery cost when method, postal code, or total price changes
  useEffect(() => {
    // Skip if already calculating or if relevant values haven't changed
    if (calculatingDeliveryCost.current || 
        (prevDeliveryMethod.current === deliveryMethod && 
         prevPostalCode.current === formData.postalCode &&
         prevTotalPrice.current === totalPrice)) {
      return;
    }
    
    // Skip if no delivery method, or if address delivery without postal code
    if (!deliveryMethod || (deliveryMethod === 'ADDRESS' && 
        (!formData.postalCode || formData.postalCode.length < 4))) {
      return;
    }
    
    const calculateDeliveryCost = async () => {
      calculatingDeliveryCost.current = true;
      setLoading(prev => ({ ...prev, deliveryCost: true }));
      
      try {
        console.log('Calculating delivery cost:', {
          deliveryMethod,
          postalCode: formData.postalCode,
          cartTotal: totalPrice
        });
        
        const response = await apiClient.post('/delivery/calculate-cost', {
          deliveryMethod,
          postalCode: formData.postalCode,
          canton: 'GE', // Default canton
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
        setError('Failed to calculate delivery cost');
      } finally {
        setLoading(prev => ({ ...prev, deliveryCost: false }));
        calculatingDeliveryCost.current = false;
      }
    };

    calculateDeliveryCost();
    
    // Update previous values
    prevDeliveryMethod.current = deliveryMethod;
    prevPostalCode.current = formData.postalCode;
    prevTotalPrice.current = totalPrice;
  }, [deliveryMethod, formData.postalCode, totalPrice, handleChange]);

  // Fetch available dates when delivery method or zone ID changes
  useEffect(() => {
    // Skip if already fetching or if relevant values haven't changed
    if (fetchingDates.current || !deliveryMethod || 
        (prevDeliveryMethod.current === deliveryMethod && 
         prevZoneId.current === formData.zoneId)) {
      return;
    }
    
    const fetchAvailableDates = async () => {
      fetchingDates.current = true;
      setLoading(prev => ({ ...prev, dates: true }));
      
      try {
        console.log('Fetching available dates:', {
          deliveryMethod,
          zoneId: formData.zoneId
        });
        
        // Build query string manually to avoid CORS issues
        let endpoint = '/delivery/available-dates?deliveryMethod=' + deliveryMethod;
        endpoint += '&canton=GE'; // Default canton
        
        if (formData.zoneId) {
          endpoint += '&zoneId=' + formData.zoneId;
        }
        
        const response = await apiClient.get(endpoint);
        
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
        fetchingDates.current = false;
      }
    };

    fetchAvailableDates();
    
    // Update previous values
    prevDeliveryMethod.current = deliveryMethod;
    prevZoneId.current = formData.zoneId;
  }, [deliveryMethod, formData.zoneId, formData.deliveryDate, handleChange]);

  // Fetch time slots when delivery date changes
  useEffect(() => {
    // Skip if already fetching or if no delivery date or if delivery date hasn't changed
    if (fetchingTimeSlots.current || !deliveryMethod || !formData.deliveryDate || 
        prevDeliveryDate.current === formData.deliveryDate) {
      return;
    }
    
    const fetchTimeSlots = async () => {
      fetchingTimeSlots.current = true;
      setLoading(prev => ({ ...prev, timeSlots: true }));
      
      try {
        console.log('Fetching time slots:', {
          deliveryDate: formData.deliveryDate,
          zoneId: formData.zoneId
        });
        
        // Get day of week from selected date
        const selectedDate = new Date(formData.deliveryDate);
        const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Build query string manually
        let endpoint = '/delivery/time-slots?dayOfWeek=' + dayOfWeek;
        
        if (formData.zoneId) {
          endpoint += '&zoneId=' + formData.zoneId;
        }
        
        const response = await apiClient.get(endpoint);
        
        if (response && response.length > 0) {
          setTimeSlots(response);
          
          // Auto-select first time slot if none is selected
          if (!formData.deliveryTimeSlot && response.length > 0) {
            // Create a time slot string in the format "HH:MM-HH:MM"
            const timeSlotValue = `${response[0].startTime}-${response[0].endTime}`;
            
            handleChange({
              target: {
                name: 'deliveryTimeSlot',
                value: timeSlotValue
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
        fetchingTimeSlots.current = false;
      }
    };

    fetchTimeSlots();
    prevDeliveryDate.current = formData.deliveryDate;
  }, [deliveryMethod, formData.deliveryDate, formData.zoneId, formData.deliveryTimeSlot, handleChange]);

  // Fetch city details when postal code changes
  useEffect(() => {
    // Skip if postal code is not valid or hasn't changed
    if (!formData.postalCode || formData.postalCode.length < 4 || 
        deliveryMethod !== 'ADDRESS' || 
        prevPostalCode.current === formData.postalCode) {
      return;
    }
    
    const fetchCityByPostalCode = async () => {
      try {
        console.log('Fetching city for postal code:', formData.postalCode);
        
        const response = await apiClient.get(`/delivery/cities/${formData.postalCode}`);
        
        if (response) {
          // Update zone ID in parent form
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
    prevPostalCode.current = formData.postalCode;
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
        return <RailwayStationCheckout formData={formData} handleChange={handleChange} />;
      case 'PICKUP':
        return <PickupCheckout formData={formData} handleChange={handleChange} />;
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
              maxLength={4}
            />
          </Form.Group>
        </Col>
      </Row>
      
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
          {timeSlots.map(slot => {
            const timeSlotValue = `${slot.startTime}-${slot.endTime}`;
            return (
              <option key={timeSlotValue} value={timeSlotValue}>
                {slot.name} ({slot.startTime} - {slot.endTime})
              </option>
            );
          })}
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