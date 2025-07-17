import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Card, InputGroup, Row, Col, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, FileText, Check, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import SimplePhoneInput, { useSimplePhoneValidation, cleanPhoneNumber } from './common/SimplePhoneInput';
import './Register.css';
import { apiClient } from '../utils/api';
import { useScrollToTop } from '../hooks/useScrollToTop';


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
    marketingConsent: false,
    preferredLanguage: i18n.language || 'uk'
  });

  const [registeredEmail, setRegisteredEmail] = useState('');

  const [countdown, setCountdown] = useState(30); // Начальный отсчет 30 секунд
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [savedFormData, setSavedFormData] = useState(null);

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
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  // Автопрокрутка при показе верификации или ошибок
  useScrollToTop(showVerificationMessage);
  useScrollToTop(!!error);

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

  useEffect(() => {
    let interval = null;

    if (isCountingDown && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown => countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCountingDown(false);
      setShowResendOption(true);
      setCountdown(30); // Сброс на 30 секунд для следующего раза
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCountingDown, countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!validateForm()) {
      setError(t('register.validation.fix_errors'));
      return;
    }

    try {
      setError('');
      setSuccess('');
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
        // Check if email verification is required
        if (result.requiresVerification) {
          setRegisteredEmail(formData.email);
          // СОХРАНЯЕМ ВСЕ данные формы (кроме паролей для безопасности)
          
          setSavedFormData({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            dataConsentAccepted: formData.dataConsentAccepted,
            marketingConsent: formData.marketingConsent,
            preferredLanguage: formData.preferredLanguage
          });

          setSuccess(t('register.verification.emailSent'));
          setShowVerificationMessage(true);

          setIsCountingDown(true);
          setShowResendOption(false);

          // Clear form after successful registration
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            dataConsentAccepted: false,
            marketingConsent: false,
            preferredLanguage: i18n.language || 'uk'
          });
          // Show resend option after some time
          //setTimeout(() => setShowResendOption(true), 30000); // 30 seconds
        } else {
          // Old flow - direct login (if email verification is disabled)
          navigate('/client');
        }
      } else {
        setError(result.error || t('register.error'));
      }
    } catch (error) {
      console.error('Помилка реєстрації:', error);
      setError(error.message || t('register.error_generic'));
    } finally {
      setLoading(false);
    }
  };

  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!registeredEmail) { // ← ИСПОЛЬЗУЕМ registeredEmail
      setError(t('register.verification.emailRequired'));
      return;
    }

    try {
      setError('');
      setLoading(true);

      // Используем apiClient вместо fetch
      const data = await apiClient.post('/users/resend-verification', {
        email: registeredEmail
      });

      setSuccess(data.message || t('register.verification.resendSuccess'));
      // Перезапускаем таймер после успешной отправки
      setShowResendOption(false);
      setCountdown(120); // 2 минуты для следующей отправки
      setIsCountingDown(true);

    } catch (error) {
      console.error('Resend verification error:', error);
      setError(error.message || t('register.verification.resendError'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewTerms = () => {
    setShowTerms(true);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0
      ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
      : `${remainingSeconds}`;
  };

  // Handle language change in the modal
  const handleTermsLanguageChange = (e) => {
    const newLang = e.target.value;
    setTermsLanguage(newLang);
  };

  // Show verification success message
  if (showVerificationMessage) {
    return (
      <Container className="py-5">
        <Card className="mx-auto shadow-sm" style={{ maxWidth: '600px' }}>
          <Card.Body className="p-5 text-center">
            <CheckCircle size={64} className="text-success mb-4" />
            <h3 className="text-success mb-3">
              {t('register.verification.title')}
            </h3>

            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <div className="mb-4">
              <p className="mb-3">
                {t('register.verification.checkEmail')}
              </p>

              {/* Показываем email, на который отправлено письмо */}
              {registeredEmail && (
                <Alert variant="info" className="small mb-3">
                  <strong>{registeredEmail}</strong>
                </Alert>
              )}

              <p className="text-muted small">
                {t('register.verification.emailInstructions')}
              </p>
            </div>

            {/* Секция повторной отправки с таймером */}
          <div className="mb-4">
            {isCountingDown ? (
              <div className="text-center">
                <p className="text-muted mb-2">
                  {t('register.verification.canResendIn')}
                </p>
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <div className="bg-light border rounded px-3 py-2" style={{fontFamily: 'monospace'}}>
                    <strong className="text-primary fs-5">
                      {formatTime(countdown)}
                    </strong>
                  </div>
                </div>
                <small className="text-muted">
                  {t('register.verification.waitingMessage')}
                </small>
              </div>
            ) : showResendOption ? (
              <div>
                <p className="text-muted mb-3">
                  {t('register.verification.notReceived')}
                </p>
                <Button
                  variant="primary"
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="px-4"
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      {t('register.loading')}
                    </>
                  ) : (
                    <>
                      {t('register.verification.resendButton')}
                    </>
                  )}
                </Button>
              </div>
            ) : null}
          </div>

          {/* Уведомление о сохранении данных */}
          {/* <Alert variant="warning" className="small mb-4">
            💡 <strong>Совет:</strong> Если нужно исправить email, нажмите "Исправить email" - 
            все ваши данные сохранены и будут восстановлены (кроме пароля).
          </Alert> */}

          {/* Секция с возможностью исправить email */}
          <hr className="my-4" />
          
          <div className="mb-3">
            <p className="text-muted small mb-3">
              {t('register.verification.wrongEmail')}
            </p>
            
            <Button
              variant="danger"
              onClick={() => {
                // Очищаем состояния верификации
                setShowVerificationMessage(false);
                setShowResendOption(false);
                setIsCountingDown(false);
                setCountdown(30);
                setError('');
                setSuccess('');
                
                // Восстанавливаем ВСЕ сохраненные данные
                if (savedFormData) {
                  setFormData({
                    ...savedFormData,
                    password: '', // Пароли не восстанавливаем для безопасности
                    confirmPassword: ''
                  });
                }
                
                // Сбрасываем сохраненные данные
                setSavedFormData(null);
                setRegisteredEmail('');
              }}
              className="me-2"
            >
              {t('register.verification.editEmail')}
            </Button>
            
            {/* <Button
              variant="outline-secondary"
              onClick={() => navigate('/login')}
              className="text-decoration-none"
            >
              {t('register.verification.goToLogin')}
            </Button> */}
          </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Password strength indicator component
  /* const PasswordStrengthIndicator = () => (
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
  ); */

  return (
    <Container className="py-5">
      <Card className="mx-auto shadow-sm register-form-labels" style={{ maxWidth: '550px' }}>
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">{t('register.title')}</h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

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