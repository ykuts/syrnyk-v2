// StationSelector.js
import { useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { MapPin } from 'lucide-react';
import './StationSelector.css';
import { getImageUrl } from '../config';

const StationSelector = ({ 
  stations, 
  selectedStation, 
  onChange, 
  meetingTime,
  showMeetingTime = true
}) => {
  const [imageError, setImageError] = useState({});
  
  console.log('StationSelector render:', { selectedStation, stations });
  
  const handleSelect = (stationId) => {
    onChange({ 
      target: { 
        name: 'stationId', 
        value: stationId.toString() 
      } 
    });
  };

  const selectedStationData = stations.find(s => s.id === parseInt(selectedStation));

  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const getStationImage = (photo) => {
    if (imageError[photo]) return getImageUrl(null, 'station');
    return getImageUrl(photo, 'station');
  };

  console.log('StationSelector props:', { selectedStation, stations });

  return (
    <>
      {/* Station selection grid - responsive layout */}
      <Row className="station-selector-row g-2 mb-4">
        {stations.map((station) => (
          <Col xs={6} md={3} key={station.id}> {/* xs=6 for 2 columns on mobile, md=3 for 4 columns on desktop */}
            <button
              type="button"
              onClick={() => handleSelect(station.id)}
              className={`station-option ${selectedStation === station.id.toString() ? 'selected' : ''}`}
            >
              <div className="station-icon-wrapper">
                <MapPin 
                  size={20} // Reduced from 24 for better mobile scaling
                  className={selectedStation === station.id.toString() ? 'text-white' : 'text-primary'} 
                />
              </div>
              <div className="station-city fw-medium">{station.city}</div>
              <small className="station-name">{station.name}</small>
            </button>
          </Col>
        ))}
      </Row>

      {/* Selected station details card */}
      {selectedStation && (
        <Card className="station-details-card bg-light">
          <Card.Body>
            <Row>
              <Col md={selectedStationData?.photo ? 8 : 12}>
                <h5 className="station-title mb-2">
                  {selectedStationData?.city} - {selectedStationData?.name}
                </h5>
                <div className="mb-3">
                  <h6 className="meeting-point-label mb-2">Місце зустрічі:</h6>
                  <p className="meeting-point-text mb-3">{selectedStationData?.meetingPoint}</p>
                </div>

                {showMeetingTime && (
                  <div className="meeting-time-container">
                    <label className="form-label fw-medium">Оберіть дату та час</label>
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
                )}
              </Col>
              
              {selectedStationData?.photo && (
                <Col md={4}>
                  <div className="station-photo-container">
                    <img
                      src={getStationImage(selectedStationData.photo)}
                      alt="Meeting Point"
                      onError={() => {
                        setImageError(prev => ({
                          ...prev,
                          [selectedStationData.photo]: true
                        }));
                      }}
                      className="station-photo img-fluid rounded w-100"
                    />
                  </div>
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default StationSelector;