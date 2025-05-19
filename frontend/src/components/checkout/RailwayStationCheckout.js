import { useState, useEffect } from 'react';
import { Card, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import ImprovedDeliveryScheduler from './ImprovedDeliveryScheduler';
import { apiClient } from '../../utils/api';
import StationSelector from '../StationSelector';

/**
 * Component for handling railway station delivery checkout
 * Uses StationSelector for an improved station selection experience
 */
const RailwayStationCheckout = ({ formData, handleChange }) => {
  const { t } = useTranslation(['checkout', 'common']);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch railway stations on component mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/railway-stations');
        
        if (response && response.data) {
          setStations(response.data);
          
          // Auto-select first station if none is selected
          if (response.data.length > 0 && !formData.stationId) {
            handleChange({
              target: {
                name: 'stationId',
                value: response.data[0].id.toString()
              }
            });
          }
        } else {
          setStations([]);
        }
      } catch (err) {
        console.error('Error fetching railway stations:', err);
        setError(t('railway.errors.stations_fetch_error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchStations();
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

  // If no stations, show warning
  if (stations.length === 0) {
    return (
      <Alert variant="warning">
        {t('railway.no_stations')}
      </Alert>
    );
  }

  return (
    <div className="railway-checkout">
      <h5 className="mb-3">{t('checkout.railway_delivery')}</h5>
      
      {/* Integrated StationSelector component */}
      <StationSelector
        stations={stations}
        selectedStation={formData.stationId}
        onChange={handleChange}
        showMeetingTime={false} // Hide meeting time input as we'll use ImprovedDeliveryScheduler
      />
      
      {/* Delivery Date Selector - Mondays only */}
      {formData.stationId && (
        <Card className="mt-4">
          <Card.Body>
            <ImprovedDeliveryScheduler
              deliveryType="RAILWAY_STATION"
              selectedDate={formData.deliveryDate}
              onDateChange={handleChange}
            />
          </Card.Body>
        </Card>
      )}
      
      {/* Free delivery badge */}
      <div className="mt-3">
        <Alert variant="success">
          <strong>{t('railway.free_delivery')}</strong> - {t('railway.free_delivery_note')}
        </Alert>
      </div>
    </div>
  );
};

export default RailwayStationCheckout;