import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Modal, Card } from 'react-bootstrap';
import { FileText, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import DeliveryMethodSelector from './DeliveryMethodSelector';
import PaymentMethodSelector from './PaymentMethodSelector';
import StationSelector from './StationSelector';
import { useTranslation } from 'react-i18next';
// Import templates
import {
  dataProcessingTermsTemplates,
  consentCheckboxText,
  marketingConsentText,
  requiredConsentError,
  languageNames,
  uiTexts
} from '../templates/dataProcessingTemplates';

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
  const { t, i18n } = useTranslation(['checkout', 'auth']);

  // Password validation helper
  const isPasswordValid = (password) => {
    return password && password.length >= 8 && /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  };

  // Validation state
  const [validation, setValidation] = useState({
    firstName: { isValid: true, message: '' },
    lastName: { isValid: true, message: '' },
    email: { isValid: true, message: '' },
    phone: { isValid: true, message: '' },
    password: { isValid: true, message: '' },
    confirmPassword: { isValid: true, message: '' },
    dataConsentAccepted: { isValid: true, message: '' }
  });

  // Terms and language state
  const [showTerms, setShowTerms] = useState(false);
  const [termsLanguage, setTermsLanguage] = useState(i18n.language || 'uk');

  // Validate consent when createAccount changes
  useEffect(() => {
    if (createAccount) {
      setValidation(prev => ({
        ...prev,
        dataConsentAccepted: {
          isValid: !!formData.dataConsentAccepted,
          message: !formData.dataConsentAccepted
            ? (requiredConsentError[termsLanguage] || requiredConsentError.uk)
            : ''
        }
      }));
    }
  }, [createAccount, formData.dataConsentAccepted, termsLanguage]);

  // Sync termsLanguage with i18n.language when it changes
  useEffect(() => {
    setTermsLanguage(i18n.language);
  }, [i18n.language]);

  // Get UI texts based on selected language
  const getUIText = (key) => {
    return uiTexts[termsLanguage]?.[key] || uiTexts.uk[key];
  };

  // View terms handler
  const handleViewTerms = () => {
    setShowTerms(true);
  };

  // Handle language change in the modal
  const handleTermsLanguageChange = (e) => {
    const newLang = e.target.value;
    setTermsLanguage(newLang);
  };

  // Render password field
  const renderPasswordField = () => {
    if (!isGuest || !createAccount) return null;

    const isPasswordInvalid = formData.password && !isPasswordValid(formData.password);
    const isConfirmPasswordInvalid = formData.confirmPassword && formData.password !== formData.confirmPassword;

    return (
      <>
        <Form.Group className="mb-3">
          <Form.Label>{t('customer.password')}</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder={`${t('customer.password')} (${t('register.password_requirements.length', { ns: 'auth' })})`}
            value={formData.password || ''}
            onChange={handleChange}
            required={createAccount}
            minLength={8}
            isInvalid={isPasswordInvalid}
          />
          <Form.Control.Feedback type="invalid">
            {t('register.validation.password_requirements', { ns: 'auth' })}
          </Form.Control.Feedback>
          <Form.Text className="text-muted">
            {t('register.password_requirements.title', { ns: 'auth' })}
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('register.confirm_password', { ns: 'auth' })}</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            placeholder={t('register.confirm_password', { ns: 'auth' })}
            value={formData.confirmPassword || ''}
            onChange={handleChange}
            required={createAccount}
            isInvalid={isConfirmPasswordInvalid}
          />
          <Form.Control.Feedback type="invalid">
            {t('register.validation.passwords_mismatch', { ns: 'auth' })}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Consent section */}
        <Card className="mb-4 bg-light border">
          <Card.Body className="py-3">
            <h6 className="d-flex align-items-center mb-3">
              <FileText size={18} className="me-2" />
              {getUIText('privacyTitle')}
            </h6>

            <Form.Group className="mb-3 text-start">
              <Form.Check
                type="checkbox"
                id="dataConsentAccepted"
                name="dataConsentAccepted"
                checked={formData.dataConsentAccepted || false}
                onChange={handleChange}
                required={createAccount}
                isInvalid={!validation.dataConsentAccepted.isValid}
                label={
                  <>
                    {consentCheckboxText[termsLanguage] || consentCheckboxText.uk}{' '}
                    <Button
                      variant="link"
                      className="p-0 align-baseline text-decoration-underline"
                      onClick={handleViewTerms}
                    >
                      {getUIText('termsLinkText')}
                    </Button>*
                  </>
                }
              />
              {!validation.dataConsentAccepted.isValid && (
                <div className="text-danger small mt-1">
                  {validation.dataConsentAccepted.message}
                </div>
              )}
              <Form.Control.Feedback type="invalid">
                {requiredConsentError[formData.language] || requiredConsentError.uk}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-2 text-start">
              <Form.Check
                type="checkbox"
                id="marketingConsent"
                name="marketingConsent"
                checked={formData.marketingConsent || false}
                onChange={handleChange}
                label={marketingConsentText[termsLanguage] || marketingConsentText.uk}
              />
            </Form.Group>

            <div className="text-muted small">
              <p className="mb-0">
                {getUIText('privacyNote')}
              </p>
            </div>
          </Card.Body>
        </Card>
      </>
    );
  };

  // Render customer information section
  const renderCustomerInfo = () => (
    <section className="mb-5">
      <h4 className="mb-3">{t('checkout.customer_info')}</h4>
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
                    handleChange({ target: { name: 'confirmPassword', value: '' } });
                    handleChange({ target: { name: 'dataConsentAccepted', type: 'checkbox', checked: false } });
                    handleChange({ target: { name: 'marketingConsent', type: 'checkbox', checked: false } });
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
        <h4 className="mb-3">{t('checkout.delivery_method')}</h4>
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
        <h4 className="mb-3">{t('checkout.payment_method')}</h4>
        <PaymentMethodSelector
          selectedMethod={formData.paymentMethod}
          onChange={handleChange}
        />
      </section>

      {/* Order Notes */}
      <section className="mb-5">
        <h4 className="mb-3">{t('checkout.order_notes')}</h4>
        <Card>
          <Card.Body>
            <Form.Control
              as="textarea"
              rows={3}
              name="notesClient"
              value={formData.notesClient}
              onChange={handleChange}
              placeholder={t('checkout.order_notes')}
            />
          </Card.Body>
        </Card>
      </section>

      {/* Data Processing Terms Modal */}
      <Modal
        show={showTerms}
        onHide={() => setShowTerms(false)}
        size="lg"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>{getUIText('modalTitle')}</Modal.Title>
          <div className="ms-auto">
            <Form.Select
              size="sm"
              value={termsLanguage}
              onChange={handleTermsLanguageChange}
              style={{ width: 'auto' }}
            >
              {Object.keys(dataProcessingTermsTemplates).map(lang => (
                <option key={lang} value={lang}>
                  {languageNames[lang] || lang}
                </option>
              ))}
            </Form.Select>
          </div>
        </Modal.Header>
        <Modal.Body>
          <ReactMarkdown>
            {dataProcessingTermsTemplates[termsLanguage] || dataProcessingTermsTemplates.uk}
          </ReactMarkdown>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowTerms(false)}
          >
            {getUIText('closeButton')}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleChange({
                target: {
                  name: 'dataConsentAccepted',
                  type: 'checkbox',
                  checked: true
                }
              });
              setShowTerms(false);
            }}
            disabled={formData.dataConsentAccepted}
          >
            {formData.dataConsentAccepted ? (
              <span className="d-flex align-items-center">
                <Check size={16} className="me-1" /> {getUIText('alreadyAccepted')}
              </span>
            ) : getUIText('acceptButton')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CheckoutForm;