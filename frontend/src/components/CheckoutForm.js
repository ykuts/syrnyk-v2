import React from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
import DeliveryMethodSelector from './DeliveryMethodSelector';
import PaymentMethodSelector from './PaymentMethodSelector';
import StationSelector from './StationSelector';

const CheckoutForm = ({ formData, handleChange, deliveryType, railwayStations, stores, isAuthenticated }) => {
  const renderDeliveryFields = () => {
    switch (deliveryType) {
      case 'ADDRESS':
        return (
          <div className="delivery-details mt-4">
            <Card>
              <Card.Body>
                <h5 className="mb-3">Адреса доставки</h5>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    name="street"
                    placeholder="Вулиця"
                    value={formData.street}
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
                        placeholder="Будинок"
                        value={formData.house}
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
                        placeholder="Квартира (необов'язково)"
                        value={formData.apartment}
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
                        placeholder="Місто"
                        value={formData.city}
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
                        placeholder="Індекс"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </div>
        );

        case 'RAILWAY_STATION':
      return (
        <div className="delivery-details mt-4">
          <Card>
            <Card.Body>
              <h5 className="mb-3">Виберіть станцію</h5>
              <Form.Group className="mb-4">
                <Form.Select
                  name="stationId"
                  value={formData.stationId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Оберіть станцію</option>
                  {railwayStations.map(station => (
                    <option key={station.id} value={station.id}>
                      {station.city} - {station.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {formData.stationId && (
                <div className="mt-4">
                  <Card className="bg-light">
                    <Card.Body>
                      {railwayStations.find(s => s.id === parseInt(formData.stationId))?.photo && (
                        <img
                          src={`http://localhost:3001${railwayStations.find(s => s.id === parseInt(formData.stationId)).photo}`}
                          alt="Місце зустрічі"
                          className="img-fluid rounded mb-3 w-100"
                        />
                      )}
                      <div className="mb-3">
                        <strong>Місце зустрічі:</strong>
                        <p className="mb-0 mt-1">
                          {railwayStations.find(s => s.id === parseInt(formData.stationId))?.meetingPoint}
                        </p>
                      </div>

                      <Form.Group>
                        <Form.Label className="fw-medium">Оберіть час зустрічі</Form.Label>
                        <Form.Control
                          type="datetime-local"
                          name="meetingTime"
                          value={formData.meetingTime}
                          onChange={handleChange}
                          min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                          required
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      );

      /* case 'RAILWAY_STATION':
        return (
          <div className="delivery-details mt-4">
            <Card>
              <Card.Body>
                <h5 className="mb-3">Виберіть станцію</h5>
                <StationSelector
                  stations={railwayStations}
                  selectedStation={formData.stationId}
                  onChange={handleChange}
                />

                {formData.stationId && (
                  <div className="mt-4">
                    <Card className="bg-light">
                      <Card.Body>
                        {railwayStations.find(s => s.id === parseInt(formData.stationId))?.photo && (
                          <img
                            src={`http://localhost:3001${railwayStations.find(s => s.id === parseInt(formData.stationId)).photo}`}
                            alt="Місце зустрічі"
                            className="img-fluid rounded mb-3 w-100"
                          />
                        )}
                        <div className="mb-3">
                          <strong>Місце зустрічі:</strong>
                          <p className="mb-0 mt-1">
                            {railwayStations.find(s => s.id === parseInt(formData.stationId))?.meetingPoint}
                          </p>
                        </div>

                        <Form.Group>
                          <Form.Label className="fw-medium">Оберіть час зустрічі</Form.Label>
                          <Form.Control
                            type="datetime-local"
                            name="meetingTime"
                            value={formData.meetingTime}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Card.Body>
                    </Card>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        ); */

      case 'PICKUP':
        return (
          <div className="delivery-details mt-4">
            <Card>
              <Card.Body>
                <h5 className="mb-3">Деталі самовивозу</h5>
                <div className="bg-light p-3 rounded mb-4">
                  <h6 className="mb-2">{stores[0].name}</h6>
                  <p className="mb-2">{stores[0].address}, {stores[0].city}</p>
                  <p className="mb-2"><strong>Графік роботи:</strong> {stores[0].workingHours}</p>
                  {stores[0].phone && (
                    <p className="mb-0"><strong>Телефон:</strong> {stores[0].phone}</p>
                  )}
                </div>

                <Form.Group>
                  <Form.Label className="fw-medium">Оберіть час самовивозу</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="pickupTime"
                    value={formData.pickupTime}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="checkout-form">
      <section className="mb-5">
        <h4 className="mb-3">Особисті дані</h4>
        <Card>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    name="firstName"
                    placeholder="Ім'я"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    readOnly={isAuthenticated}
                    className={isAuthenticated ? 'bg-light' : ''}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    name="lastName"
                    placeholder="Прізвище"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    readOnly={isAuthenticated}
                    className={isAuthenticated ? 'bg-light' : ''}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Control
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                readOnly={isAuthenticated}
                className={isAuthenticated ? 'bg-light' : ''}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="tel"
                name="phone"
                placeholder="Телефон"
                value={formData.phone}
                onChange={handleChange}
                required
                readOnly={isAuthenticated}
                className={isAuthenticated ? 'bg-light' : ''}
              />
            </Form.Group>
          </Card.Body>
        </Card>
      </section>
      {isAuthenticated && (
                <Form.Text className="text-muted">
                  Для зміни особистих даних перейдіть до налаштувань профілю
                </Form.Text>
              )}

      <section className="mb-5">
        <h4 className="mb-3">Спосіб доставки</h4>
        <DeliveryMethodSelector
          selectedMethod={formData.deliveryType}
          onChange={handleChange}
        />
        {renderDeliveryFields()}
      </section>

      <section className="mb-5">
        <h4 className="mb-3">Спосіб оплати</h4>
        <PaymentMethodSelector
          selectedMethod={formData.paymentMethod}
          onChange={handleChange}
        />
      </section>

      <section className="mb-5">
        <h4 className="mb-3">Коментар до замовлення</h4>
        <Card>
          <Card.Body>
            <Form.Control
              as="textarea"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Додаткова інформація до замовлення"
            />
          </Card.Body>
        </Card>
      </section>
    </div>
  );
};

export default CheckoutForm;