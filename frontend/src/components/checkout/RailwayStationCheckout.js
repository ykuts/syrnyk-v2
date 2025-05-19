// src/components/checkout/RailwayStationCheckout.js
import React, { useState, useEffect } from 'react';
import { Card, Form, Alert, Spinner, Row, Col, Image } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import RailwayStationScheduler from './RailwayStationScheduler';
import { apiClient } from '../../utils/api';
import { getImageUrl } from '../../config';

/**
 * RailwayStationCheckout component - A complete component for handling railway station delivery
 * Combines station selection and delivery scheduling
 */
const RailwayStationCheckout = ({ formData, handleChange }) => {
  const { t } = useTranslation(['checkout', 'common']);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState({});

  // Fetch stations on component mount
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

  // Function to get station image URL
  const getStationImage = (photo) => {
    if (imageError[photo]) return getImageUrl(null, 'station');
    return getImageUrl(photo, 'station');
  };

  // Handler for image load errors
  const handleImageError = (photo) => {
    setImageError(prev => ({
      ...prev,
      [photo]: true
    }));
  };

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

  // Get selected station data
  const selectedStationData = stations.find(s => s.id === parseInt(formData.stationId));

  return (
    <div className="railway-checkout">
      <h5 className="mb-3">{t('checkout.railway_delivery')}</h5>
      
      {/* Station Selection */}
      <Card className="mb-4">
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>{t('railway.station')}</Form.Label>
            <Form.Select
              name="stationId"
              value={formData.stationId || ''}
              onChange={handleChange}
              required
            >
              <option value="">{t('railway.select_station')}</option>
              {stations.map(station => (
                <option key={station.id} value={station.id.toString()}>
                  {station.city} - {station.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          
          {/* Display selected station details */}
          {selectedStationData && (
            <div className="mt-3">
              <Card className="bg-light">
                <Card.Body>
                  <Row>
                    {selectedStationData?.photo && (
                      <Col md={4}>
                        <Image
                          src={getStationImage(selectedStationData.photo)}
                          alt="Meeting Point"
                          onError={() => handleImageError(selectedStationData.photo)}
                          className="img-fluid rounded w-100 mb-3 mb-md-0"
                        />
                      </Col>
                    )}
                    <Col md={selectedStationData?.photo ? 8 : 12}>
                      <h5 className="mb-2">{selectedStationData?.city} - {selectedStationData?.name}</h5>
                      <div className="mb-3">
                        <h6 className="mb-2">{t('railway.meeting_point')}:</h6>
                        <p className="mb-0">{selectedStationData?.meetingPoint}</p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Delivery Schedule */}
      {formData.stationId && (
        <Card>
          <Card.Body>
            <RailwayStationScheduler
              selectedDate={formData.deliveryDate}
              selectedTimeSlot={formData.deliveryTimeSlot}
              onDateChange={handleChange}
              onTimeSlotChange={handleChange}
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