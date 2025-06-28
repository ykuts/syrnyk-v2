import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Card, InputGroup, Row, Col, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Mail, Lock, User, AlertCircle, FileText, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import SimplePhoneInput, { useSimplePhoneValidation, cleanPhoneNumber } from './common/SimplePhoneInput';
import './Register.css'; 

// Импортируем шаблоны из отдельного файла
import {
  dataProcessingTermsTemplates,
  consentCheckboxText,
  marketingConsentText,
  requiredConsentError,
  languageNames,
  uiTexts
} from '../templates/dataProcessingTemplates';

const Register = () => {
  const { t, i18n } = useTranslation('auth');

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dataConsentAccepted: false,
    marketingConsent: false
  });

  // Use phone validation hook
  const { isValid: isPhoneValid, message: phoneMessage, handleValidationChange } = useSimplePhoneValidation();

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

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasLetter: false,
    hasNumber: false
  });

  // Terms and language state
  const [showTerms, setShowTerms] = useState(false);
  const [termsLanguage, setTermsLanguage] = useState(i18n.language || 'uk');

  // Sync termsLanguage with i18n.language when it changes
  useEffect(() => {
    setTermsLanguage(i18n.language);
  }, [i18n.language]);

  // Get UI texts based on selected language
  const getUIText = (key) => {
    return uiTexts[termsLanguage]?.[key] || uiTexts.uk[key];
  };

  // Validation patterns
  const patterns = {
    phone: /^\+[1-9]\d{9,14}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    //password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Real-time validation (skip phone as it's handled by SimplePhoneInput)
    if (name !== 'phone') {
      validateField(name, type === 'checkbox' ? checked : value);
    }
  };

  // Validate individual field
  const validateField = (name, value) => {
    let isValid = true;
    let message = '';

    switch (name) {
      case 'firstName':
      case 'lastName':
        if (value.length < 2) {
          isValid = false;
          message = t('register.validation.name_length');
        }
        break;

      case 'email':
        if (!patterns.email.test(value)) {
          isValid = false;
          message = t('register.validation.email_invalid');
        }
        break;

      case 'phone':
        // Phone validation is handled by SimplePhoneInput component
        // But we can add a basic fallback check here
        if (!value || value === '+') {
          isValid = false;
          message = t('register.validation.phone_invalid');
        } else if (!patterns.phone.test(cleanPhoneNumber(value))) {
          isValid = false;
          message = t('register.validation.phone_invalid');
        }
        break;

      case 'password':
        //const hasLength = value.length >= 8;
        //const hasLetter = /[A-Za-z]/.test(value);
        //const hasNumber = /\d/.test(value);
        if (!value || value.length === 0) {
          isValid = false;
          message = t('register.validation.password_required');
        }

        setPasswordStrength({
          hasLength: true,    // Always true now
          hasLetter: true,    // Always true now
          hasNumber: true // Always true now
        });

        /* if (!patterns.password.test(value)) {
          isValid = false;
          message = t('register.validation.password_requirements');
        } */
        break;

      case 'confirmPassword':
        if (value !== formData.password) {
          isValid = false;
          message = t('register.validation.passwords_mismatch');
        }
        break;

      case 'dataConsentAccepted':
        if (!value) {
          isValid = false;
          message = requiredConsentError[termsLanguage] || requiredConsentError.uk;
        }
        break;

      default:
        break;
    }

    setValidation(prev => ({
      ...prev,
      [name]: { isValid, message }
    }));

    return isValid;
  };

  // Validate all fields
  const validateForm = () => {
    let isFormValid = true;

    // Validate regular fields
    ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'dataConsentAccepted'].forEach(field => {
      if (!validateField(field, formData[field])) {
        isFormValid = false;
      }
    });

    // Strict phone validation - check for complete valid phone number
    if (!formData.phone ||
      formData.phone === '+' ||
      !isPhoneValid ||
      phoneMessage) {
      isFormValid = false;
      // Ensure phone validation error is shown
      setValidation(prev => ({
        ...prev,
        phone: {
          isValid: false,
          message: 'Please enter a complete phone number'
        }
      }));
    }

    return isFormValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!validateForm()) {
      setError(t('register.validation.fix_errors'));
      return;
    }

    try {
      setError('');
      setLoading(true);

      // Clean phone number before sending - remove spaces and formatting
      const cleanedFormData = {
        ...formData,
        phone: cleanPhoneNumber(formData.phone)
      };

      // Remove confirmPassword before sending
      const { confirmPassword, ...registrationData } = cleanedFormData;

      // Add user's preferred language to registration data
      const registrationDataWithLanguage = {
        ...registrationData,
        preferredLanguage: i18n.language,
        dataConsentVersion: 'v1.0',
        dataConsentDate: new Date().toISOString()
      };

      console.log('Отправляем данные регистрации:', {
        ...registrationDataWithLanguage,
        password: '***' // Hide password in logs
      });

      const result = await register(registrationDataWithLanguage);

      if (result.success) {
        navigate('/client');
      } else {
        setError(result.error || t('register.error'));
      }
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      setError(error.message || t('register.error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewTerms = () => {
    setShowTerms(true);
  };

  // Handle language change in the modal
  const handleTermsLanguageChange = (e) => {
    const newLang = e.target.value;
    setTermsLanguage(newLang);
  };

  // Password strength indicator component
  const PasswordStrengthIndicator = () => (
    <div className="mt-2">
      <div className="d-flex gap-2 align-items-center small">
        <AlertCircle size={14} />
        <span>{t('register.password_requirements.title')}</span>
      </div>
      <ul className="list-unstyled small ps-4 mt-1 mb-0">
        <li className={passwordStrength.hasLength ? 'text-success' : 'text-muted'}>
          • {t('register.password_requirements.length')}
        </li>
        <li className={passwordStrength.hasLetter ? 'text-success' : 'text-muted'}>
          • {t('register.password_requirements.letter')}
        </li>
        <li className={passwordStrength.hasNumber ? 'text-success' : 'text-muted'}>
          • {t('register.password_requirements.number')}
        </li>
      </ul>
    </div>
  );

  return (
    <Container className="py-5">
      <Card className="mx-auto shadow-sm register-form-labels" style={{ maxWidth: '550px' }}>
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">{t('register.title')}</h2>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit} noValidate>
            <Row className="mb-3">
              <Col sm={6}>
                <Form.Group>
                  <Form.Label>
                    {t('register.first_name')}
                    <span className="required-asterisk">*</span>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <User size={18} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder={t('register.input_first_name')} 
                      isInvalid={!validation.firstName.isValid}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {validation.firstName.message}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col sm={6}>
                <Form.Group>
                  <Form.Label>
                {t('register.last_name')}
                <span className="required-asterisk">*</span>
              </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <User size={18} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder={t('register.input_last_name')}
                      isInvalid={!validation.lastName.isValid}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {validation.lastName.message}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>
                {t('register.email')}
                <span className="required-asterisk">*</span>
              </Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <Mail size={18} />
                </InputGroup.Text>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  isInvalid={!validation.email.isValid}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {validation.email.message}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            {/* Phone Field */}
            <Form.Group className="mb-3">
              <Form.Label>
                {t('register.phone')}
                <span className="required-asterisk">*</span>
              </Form.Label>
              <SimplePhoneInput
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onValidationChange={handleValidationChange}
                isInvalid={!isPhoneValid}
                required
                placeholder="+"
              />
              {/* {!isPhoneValid && phoneMessage && (
                <div className="invalid-feedback d-block">
                  {phoneMessage}
                </div>
              )} */}
              <Form.Text className="text-muted">
                {t('register.phone_hint', "Будь ласка, вкажіть номер телефону, який прив'язаний до WhatsApp")}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                {t('register.password')}
                <span className="required-asterisk">*</span>
              </Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <Lock size={18} />
                </InputGroup.Text>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('register.input_password')}
                  isInvalid={!validation.password.isValid}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {validation.password.message}
                </Form.Control.Feedback>
              </InputGroup>
              {/* <PasswordStrengthIndicator /> */}
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>
                {t('register.confirm_password')}
                <span className="required-asterisk">*</span>
              </Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <Lock size={18} />
                </InputGroup.Text>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t('register.input_confirm_password')}
                  isInvalid={!validation.confirmPassword.isValid}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {validation.confirmPassword.message}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            {/* Consent section */}
            {/* <Card className="mb-4 bg-light border">
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
                    checked={formData.dataConsentAccepted}
                    onChange={handleChange}
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
                </Form.Group>

                <Form.Group className="mb-2 text-start">
                  <Form.Check
                    type="checkbox"
                    id="marketingConsent"
                    name="marketingConsent"
                    checked={formData.marketingConsent}
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
            </Card> */}

            {/* Consent section */}
            <Card className="mb-4 consent-section border-0">
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
                    checked={formData.dataConsentAccepted}
                    onChange={handleChange}
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
                        </Button>
                        <span className="required-asterisk">*</span>
                      </>
                    }
                  />
                  {!validation.dataConsentAccepted.isValid && (
                    <div className="text-danger small mt-1">
                      {validation.dataConsentAccepted.message}
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3 text-start">
                  <Form.Check
                    type="checkbox"
                    id="marketingConsent"
                    name="marketingConsent"
                    checked={formData.marketingConsent}
                    onChange={handleChange}
                    label={marketingConsentText[termsLanguage] || marketingConsentText.uk}
                  />
                </Form.Group>

                <div className="privacy-note">
                  <p className="mb-0">
                    {getUIText('privacyNote')}
                  </p>
                </div>
              </Card.Body>
            </Card>

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  {t('register.loading')}
                </>
              ) : (
                t('register.submit')
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      
      
      
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
              setFormData({
                ...formData,
                dataConsentAccepted: true
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
    </Container>
  );
};

export default Register;