import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Card, InputGroup, Row, Col, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Mail, Lock, User, AlertCircle, FileText, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('auth');
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
  const [termsLanguage, setTermsLanguage] = useState('uk'); // Default to Ukrainian
  
  // Get UI texts based on selected language
  const getUIText = (key) => {
    return uiTexts[termsLanguage]?.[key] || uiTexts.uk[key];
  };

  // Validation patterns
  const patterns = {
    phone: /^\+[1-9]\d{6,14}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Real-time validation
    validateField(name, type === 'checkbox' ? checked : value);
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
          message = 'Має бути не менше 2 символів';
        }
        break;

      case 'email':
        if (!patterns.email.test(value)) {
          isValid = false;
          message = 'Будь ласка, введіть дійсну електронну адресу';
        }
        break;

      case 'phone':
        if (value && !patterns.phone.test(value)) {
          isValid = false;
          message = 'Будь ласка, введіть дійсний номер телефону (наприклад, +380501234567)';
        }
        break;

      case 'password':
        const hasLength = value.length >= 8;
        const hasLetter = /[A-Za-z]/.test(value);
        const hasNumber = /\d/.test(value);

        setPasswordStrength({
          hasLength,
          hasLetter,
          hasNumber
        });

        if (!patterns.password.test(value)) {
          isValid = false;
          message = 'Пароль повинен містити мінімум 8 символів, літери та цифри';
        }
        break;

      case 'confirmPassword':
        if (value !== formData.password) {
          isValid = false;
          message = 'Паролі не співпадають';
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
    let isValid = true;
    Object.keys(formData).forEach(field => {
      // Skip confirmPassword as it's not sent to the API
      if (field !== 'confirmPassword' && field !== 'marketingConsent') {
        if (!validateField(field, formData[field])) {
          isValid = false;
        }
      }
    });
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Будь ласка, виправте помилки у формі');
      return;
    }

    try {
      setError('');
      setLoading(true);
      // Remove confirmPassword before sending
      const { confirmPassword, ...registrationData } = formData;
      const result = await register(formData);

      if (result.success) {
        navigate('/client');
      } else {
        setError(result.error || 'Помилка реєстрації');
      }
    } catch (error) {
      setError('Не вдалося створити обліковий запис');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTerms = () => {
    setShowTerms(true);
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
      <Card className="mx-auto shadow-sm" style={{ maxWidth: '550px' }}>
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">{t('register.title')}</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit} noValidate>
            <Row className="mb-3">
              <Col sm={6}>
                <Form.Group>
                  <InputGroup>
                    <InputGroup.Text>
                      <User size={18} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder={t('register.first_name')}
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
                  <InputGroup>
                    <InputGroup.Text>
                      <User size={18} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder={t('register.last_name')}
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
              <InputGroup>
                <InputGroup.Text>
                  <Mail size={18} />
                </InputGroup.Text>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('register.email')}
                  isInvalid={!validation.email.isValid}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {validation.email.message}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text>
                  <Phone size={18} />
                </InputGroup.Text>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+XXX XXXXXXXX"
                  isInvalid={!validation.phone.isValid}
                />
                <Form.Control.Feedback type="invalid">
                  {validation.phone.message}
                </Form.Control.Feedback>
              </InputGroup>
              <Form.Text className="text-muted">
                {t('register.phone_hint')}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text>
                  <Lock size={18} />
                </InputGroup.Text>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Пароль"
                  isInvalid={!validation.password.isValid}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {validation.password.message}
                </Form.Control.Feedback>
              </InputGroup>
              <PasswordStrengthIndicator />
            </Form.Group>

            <Form.Group className="mb-4">
              <InputGroup>
                <InputGroup.Text>
                  <Lock size={18} />
                </InputGroup.Text>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Підтвердження пароля"
                  isInvalid={!validation.confirmPassword.isValid}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {validation.confirmPassword.message}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            {/* Consent section */}
            <Card className="mb-4 bg-light border">
              <Card.Body className="py-3">
                <h6 className="d-flex align-items-center mb-3">
                  <FileText size={18} className="me-2" />
                  {getUIText('privacyTitle')}
                </h6>
                
                <Form.Group className="mb-3">
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
                
                <Form.Group className="mb-2">
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
            </Card>

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2"
              disabled={loading}
            >
              {loading ? t('register.loading') : t('register.submit')}
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
              onChange={e => setTermsLanguage(e.target.value)}
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