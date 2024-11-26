import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { MapPin } from 'lucide-react';
import './StationSelector.css';

const StationSelector = ({ stations, selectedStation, onChange }) => {
  const handleSelect = (stationId) => {
    onChange({ target: { name: 'stationId', value: stationId.toString() } });
  };

  const selectedStationData = stations.find(s => s.id === parseInt(selectedStation));

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
                    src={`http://localhost:3001${selectedStationData.photo}`}
                    alt="Місце зустрічі"
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
                  <label className="form-label fw-medium">Оберіть час зустрічі</label>
                  <input
                    type="datetime-local"
                    name="meetingTime"
                    className="form-control"
                    value={selectedStationData?.meetingTime || ''}
                    onChange={(e) => onChange(e)}
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