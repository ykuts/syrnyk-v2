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
      <h4 className="mb-3">Customer Information</h4>
      <Card>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  name="firstName"
                  placeholder="First Name"
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
                  placeholder="Last Name"
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
              placeholder="Phone"
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
                label="Create an account for faster checkout next time"
                checked={createAccount}
                onChange={(e) => onCreateAccountChange(e.target.checked)}
              />
            </Form.Group>
          )}

          {isGuest && createAccount && (
            <Form.Group className="mb-3">
              <Form.Label>Create Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Password (min. 8 characters)"
                value={formData.password || ''}
                onChange={handleChange}
                required={createAccount}
                minLength={8}
              />
              <Form.Text className="text-muted">
                Password must be at least 8 characters long
              </Form.Text>
            </Form.Group>
          )}
        </Card.Body>
      </Card>
      {isAuthenticated && (
        <Form.Text className="text-muted">
          To update your personal information, please visit your profile settings
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
              <h5 className="mb-3">Delivery Address</h5>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  name="street"
                  placeholder="Street"
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
                      placeholder="House Number"
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
                      placeholder="Apartment (optional)"
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
                      placeholder="City"
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
                      placeholder="Postal Code"
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
              <h5 className="mb-3">Railway Station Delivery</h5>
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
              <h5 className="mb-3">Store Pickup</h5>
              <div className="bg-light p-3 rounded mb-4">
                <h6 className="mb-2">{stores[0].name}</h6>
                <p className="mb-2">{stores[0].address}, {stores[0].city}</p>
                <p className="mb-0"><strong>Working Hours:</strong> {stores[0].workingHours}</p>
              </div>

              <Form.Group>
                <Form.Label className="fw-medium">Select Pickup Time</Form.Label>
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
        <h4 className="mb-3">Delivery Method</h4>
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
        <h4 className="mb-3">Payment Method</h4>
        <PaymentMethodSelector
          selectedMethod={formData.paymentMethod}
          onChange={handleChange}
        />
      </section>

      {/* Order Notes */}
      <section className="mb-5">
        <h4 className="mb-3">Order Notes</h4>
        <Card>
          <Card.Body>
            <Form.Control
              as="textarea"
              rows={3}
              name="notesClient"
              value={formData.notesClient}
              onChange={handleChange}
              placeholder="Additional information about your order"
            />
          </Card.Body>
        </Card>
      </section>
    </div>
  );
};

export default CheckoutForm;