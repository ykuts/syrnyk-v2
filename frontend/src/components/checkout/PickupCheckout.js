import React, { useState, useEffect } from 'react';
import { Card, Form, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import PickupScheduler from './PickupScheduler';
import { apiClient } from '../../utils/api';

/**
 * PickupCheckout component - A complete component for handling pickup options in the checkout flow
 * Combines store selection and pickup scheduling
 */
const PickupCheckout = ({ formData, handleChange }) => {
  const { t } = useTranslation(['checkout', 'common']);
  const [pickupLocations, setPickupLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch pickup locations on component mount
  useEffect(() => {
    const fetchPickupLocations = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/delivery/pickup-locations');
        console.log('Fetched pickup locations:', response);
        if (response && Array.isArray(response)) {
          setPickupLocations(response);
          
          // Auto-select first location if none is selected
          if (response.length > 0 && !formData.storeId) {
            handleChange({
              target: {
                name: 'storeId',
                value: response[0].id.toString()
              }
            });
          }
        } else {
          setPickupLocations([]);
        }
      } catch (err) {
        console.error('Error fetching pickup locations:', err);
        setError(t('pickup.errors.locations_fetch_error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchPickupLocations();
  }, []);

  // If loading, show loading spinner
  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{t('general.loading', { ns: 'common' })}</span>
        </Spinner>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }

  // If no pickup locations, show warning
  if (pickupLocations.length === 0) {
    return (
      <Alert variant="warning">
        {t('pickup.no_locations')}
      </Alert>
    );
  }

  return (
    <div className="pickup-checkout">
      <h5 className="mb-3">{t('delivery.pickup.title')}</h5>

      {/* Pickup Location Selection */}
      <Card className="mb-4">
        <Card.Body>
          <Form.Group className="mb-3">
            {/* Hidden input to store the selected store ID */}
            <input
              type="hidden"
              name="storeId"
              value={formData.storeId || ''}
              onChange={handleChange}
            />
            
            {/* Display store details directly without dropdown */}
            <div>
              <h6>{t('pickup.store_details')}</h6>
              {pickupLocations.map(location => (
                <div key={location.id} className="store-details p-3 bg-light rounded">
                  <p className="mb-1"><strong>{location.name}</strong></p>
                  <p className="mb-1">{location.address}, {location.city} {location.postalCode}</p>
                  {location.phone && <p className="mb-1">{t('pickup.phone')}: {location.phone}</p>}
                  {/* {location.openingHours && <p className="mb-0">{t('pickup.hours')}: {location.openingHours}</p>} */}
                  <p className="mt-3 text-muted small">{t('pickup.note')}</p>
                </div>
              ))}
            </div>
          </Form.Group>
        </Card.Body>
      </Card>
      
      {/* Pickup Schedule */}
      {formData.storeId && (
        <Card>
          <Card.Body>
            <PickupScheduler
              selectedDate={formData.deliveryDate}
              selectedTimeSlot={formData.deliveryTimeSlot}
              onDateChange={handleChange}
              onTimeSlotChange={handleChange}
            />
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default PickupCheckout;