import React, { useState } from 'react';
import { Form, Button, Container, Alert, Card, InputGroup, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Mail, Lock, User, AlertCircle } from 'lucide-react';

const Register = () => {
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Validation state
  const [validation, setValidation] = useState({
    firstName: { isValid: true, message: '' },
    lastName: { isValid: true, message: '' },
    email: { isValid: true, message: '' },
    phone: { isValid: true, message: '' },
    password: { isValid: true, message: '' },
    confirmPassword: { isValid: true, message: '' }
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

  // Validation patterns
  const patterns = {
    phone: /^\+[1-9]\d{6,14}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    validateField(name, value);
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
      if (!validateField(field, formData[field])) {
        isValid = false;
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

  // Password strength indicator component
  const PasswordStrengthIndicator = () => (
    <div className="mt-2">
      <div className="d-flex gap-2 align-items-center small">
        <AlertCircle size={14} />
        <span>Пароль повинен містити:</span>
      </div>
      <ul className="list-unstyled small ps-4 mt-1 mb-0">
        <li className={passwordStrength.hasLength ? 'text-success' : 'text-muted'}>
          • Мінімум 8 символів
        </li>
        <li className={passwordStrength.hasLetter ? 'text-success' : 'text-muted'}>
          • Хоча б одну літеру
        </li>
        <li className={passwordStrength.hasNumber ? 'text-success' : 'text-muted'}>
          • Хоча б одну цифру
        </li>
      </ul>
    </div>
  );

  return (
    <Container className="py-5">
      <Card className="mx-auto shadow-sm" style={{ maxWidth: '550px' }}>
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Реєстрація</h2>
          
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
                      placeholder="Ім'я"
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
                      placeholder="Прізвище"
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
                  placeholder="Електронна пошта"
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
                Будь ласка, вкажіть номер телефону, який прив'язаний до WhatsApp
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

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2"
              disabled={loading}
            >
              {loading ? 'Реєстрація...' : 'Зареєструватися'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;