import React, { useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { MapPin } from 'lucide-react';
import './StationSelector.css';
import { getImageUrl } from '../config';

const StationSelector = ({ stations, selectedStation, onChange, meetingTime }) => {
  const [imageError, setImageError] = useState({});
  
  const handleSelect = (stationId) => {
    onChange({ target: { name: 'stationId', value: stationId.toString() } });
  };

  const selectedStationData = stations.find(s => s.id === parseInt(selectedStation));

  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const getStationImage = (photo) => {
    if (imageError[photo]) return getImageUrl(null, 'station');
    return getImageUrl(photo, 'station');
  };

  return (
    <>
      <Row className="g-3 mb-4">
        {stations.map((station) => (
          <Col md={3} key={station.id}>
            <button
              type="button"
              onClick={() => handleSelect(station.id)}
              className={`station-option ${selectedStation === station.id.toString() ? 'selected' : ''}`}
            >
              <MapPin 
                size={24} 
                className={selectedStation === station.id.toString() ? 'text-white mb-2' : 'text-primary mb-2'} 
              />
              <div className="fw-medium">{station.city}</div>
              <small>{station.name}</small>
            </button>
          </Col>
        ))}
      </Row>

      {selectedStation && (
        <Card className="bg-light">
          <Card.Body>
            <Row>
              {selectedStationData?.photo && (
                <Col md={4}>
                  <img
                    src={getStationImage(selectedStationData.photo)}
                    alt="Meeting Point"
                    onError={() => {
                      setImageError(prev => ({
                        ...prev,
                        [selectedStationData.photo]: true
                      }));
                    }}
                    className="img-fluid rounded w-100 mb-3 mb-md-0"
                  />
                </Col>
              )}
              <Col md={selectedStationData?.photo ? 8 : 12}>
                <h5 className="mb-2">{selectedStationData.city} - {selectedStationData.name}</h5>
                <div className="mb-3">
                  <h6 className="mb-2">Місце зустрічі:</h6>
                  <p className="mb-3">{selectedStationData?.meetingPoint}</p>
                </div>

                <div>
                  <label className="form-label fw-medium">Оберіть дату</label>
                  <input
                    type="datetime-local"
                    name="meetingTime"
                    className="form-control"
                    value={meetingTime || ''}
                    onChange={onChange}
                    min={minDate}
                    required
                  />
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default StationSelector;