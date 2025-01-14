import React from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
import DeliveryMethodSelector from './DeliveryMethodSelector';
import PaymentMethodSelector from './PaymentMethodSelector';
import StationSelector from './StationSelector';

const CheckoutForm = ({ 
  formData, 
  handleChange, 
  deliveryType, 
  railwayStations, 
  stores, 
  isAuthenticated,
  isGuest,
  createAccount,
  onCreateAccountChange 
}) => {
  // Render customer information section
  const renderCustomerInfo = () => (
    <section className="mb-5">
      <h4 className="mb-3">Інформація про користувача</h4>
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

          {isGuest && (
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="create-account"
                name="createAccount"
                label="Створіть обліковий запис для швидкого оформлення наступного разу"
                checked={createAccount}
                onChange={(e) => onCreateAccountChange(e.target.checked)}
              />
            </Form.Group>
          )}

          {isGuest && createAccount && (
            <Form.Group className="mb-3">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Пароль (мін. 8 символів)"
                value={formData.password || ''}
                onChange={handleChange}
                required={createAccount}
                minLength={8}
              />
              <Form.Text className="text-muted">
              Пароль має бути не менше 8 символів
              </Form.Text>
            </Form.Group>
          )}
        </Card.Body>
      </Card>
      {isAuthenticated && (
        <Form.Text className="text-muted">
          Щоб оновити особисту інформацію, перейдіть до налаштувань свого профілю
        </Form.Text>
      )}
    </section>
  );

  // Render delivery section based on selected type
  const renderDeliverySection = () => {
    switch (deliveryType) {
      case 'ADDRESS':
        return (
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
                      placeholder="Номер будинку"
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
                      placeholder="Квартира (за бажанням)"
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
        );

      case 'RAILWAY_STATION':
        return (
          <Card>
            <Card.Body>
              <h5 className="mb-3">Доставка на залізничну станцію</h5>
              <StationSelector
                stations={railwayStations}
                selectedStation={formData.stationId}
                meetingTime={formData.meetingTime}
                onChange={handleChange}
              />
            </Card.Body>
          </Card>
        );

      case 'PICKUP':
        return (
          <Card>
            <Card.Body>
              <h5 className="mb-3">Забрати в магазині</h5>
              <div className="bg-light p-3 rounded mb-4">
                <h6 className="mb-2">{stores[0].name}</h6>
                <p className="mb-2">{stores[0].address}, {stores[0].city}</p>
                <p className="mb-0"><strong>Часи роботи:</strong> {stores[0].workingHours}</p>
              </div>

              <Form.Group>
                <Form.Label className="fw-medium">Оберіть час</Form.Label>
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
        );

      default:
        return null;
    }
  };

  return (
    <div className="checkout-form">
      {/* Customer Information */}
      {renderCustomerInfo()}

      {/* Delivery Method */}
      <section className="mb-5">
        <h4 className="mb-3">Спосіб доставки</h4>
        <DeliveryMethodSelector
          selectedMethod={deliveryType}
          onChange={handleChange}
        />
        <div className="mt-4">
          {renderDeliverySection()}
        </div>
      </section>

      {/* Payment Method */}
      <section className="mb-5">
        <h4 className="mb-3">Спосіб оплати</h4>
        <PaymentMethodSelector
          selectedMethod={formData.paymentMethod}
          onChange={handleChange}
        />
      </section>

      {/* Order Notes */}
      <section className="mb-5">
        <h4 className="mb-3">Коментар</h4>
        <Card>
          <Card.Body>
            <Form.Control
              as="textarea"
              rows={3}
              name="notesClient"
              value={formData.notesClient}
              onChange={handleChange}
              placeholder="Додаткова інформація про ваше замовлення"
            />
          </Card.Body>
        </Card>
      </section>
    </div>
  );
};

export default CheckoutForm;