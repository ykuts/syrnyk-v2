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
  // Password validation helper
  const isPasswordValid = (password) => {
    return password && password.length >= 8 && /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  };

  // Render password field
  const renderPasswordField = () => {
    if (!isGuest || !createAccount) return null;

    const isPasswordInvalid = formData.password && !isPasswordValid(formData.password);
  const isConfirmPasswordInvalid = formData.confirmPassword && formData.password !== formData.confirmPassword;

    return (
      <>
      <Form.Group className="mb-3">
        <Form.Label>Пароль</Form.Label>
        <Form.Control
          type="password"
          name="password"
          placeholder="Пароль (мінімум 8 символів)"
          value={formData.password || ''}
          onChange={handleChange}
          required={createAccount}
          minLength={8}
          isInvalid={isPasswordInvalid}
        />
        <Form.Control.Feedback type="invalid">
          Пароль повинен містити мінімум 8 символів та включати літери і цифри
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          Пароль повинен містити мінімум 8 символів та включати літери і цифри
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Підтвердження пароля</Form.Label>
        <Form.Control
          type="password"
          name="confirmPassword"
          placeholder="Повторіть пароль"
          value={formData.confirmPassword || ''}
          onChange={handleChange}
          required={createAccount}
          isInvalid={isConfirmPasswordInvalid}
        />
        <Form.Control.Feedback type="invalid">
          Паролі не співпадають
        </Form.Control.Feedback>
      </Form.Group>
    </>
  );
};

  // Render customer information section
  const renderCustomerInfo = () => (
    <section className="mb-5">
      <h4 className="mb-3">Інформація про покупця</h4>
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
    placeholder="+XXX XXXXXXXX"
    value={formData.phone}
    onChange={handleChange}
    required
    readOnly={isAuthenticated}
    className={isAuthenticated ? 'bg-light' : ''}
  />
  {!isAuthenticated && (
    <Form.Text className="text-muted">
      Будь ласка, вкажіть номер телефону, який прив'язаний до WhatsApp
    </Form.Text>
  )}
</Form.Group>

          {isGuest && (
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="create-account"
                name="createAccount"
                style={{
        
        '--bs-border-color': '#495057',
        textAlign: 'left',
      }}
      
                label="Створити обліковий запис для швидшого оформлення замовлення в майбутньому"
                checked={createAccount}
                onChange={(e) => {
                  onCreateAccountChange(e.target.checked);
                  if (!e.target.checked) {
                    handleChange({ target: { name: 'password', value: '' } });
                  }
                }}
              />
            </Form.Group>
          )}

          {renderPasswordField()}
        </Card.Body>
      </Card>
      {isAuthenticated && (
        <Form.Text className="text-muted">
          Щоб оновити особисту інформацію, перейдіть до налаштувань профілю
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
              <h5 className="mb-3">Самовивіз з магазину</h5>
              <div className="bg-light p-3 rounded mb-4">
                <h6 className="mb-2">{stores[0].name}</h6>
                <p className="mb-2">{stores[0].address}, {stores[0].city}</p>
                <p className="mb-0"><strong>Години роботи:</strong> {stores[0].workingHours}</p>
              </div>

              <Form.Group>
                <Form.Label className="fw-medium">Виберіть час отримання</Form.Label>
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
        <h4 className="mb-3">Коментар до замовлення</h4>
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