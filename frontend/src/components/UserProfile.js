// components/UserProfile.js
import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Tab, Nav } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import OrderHistory from './OrderHistory';

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    preferredDeliveryLocation: user?.preferredDeliveryLocation || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      const result = await updateProfile(formData);
      
      if (result.success) {
        setSuccess('Профіль успішно оновлено');
      } else {
        setError(result.error || 'Помилка оновлення профілю');
      }
    } catch (err) {
      setError('Помилка оновлення профілю');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Row>
          <Col md={3}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="profile">Профіль</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="delivery">Адреса доставки</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="password">Зміна паролю</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="orders">Історія замовлень</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          
          <Col md={9}>
            <Tab.Content>
              <Tab.Pane eventKey="profile">
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Ім'я</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Прізвище</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      disabled
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Телефон</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Form.Group>

                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? 'Збереження...' : 'Зберегти зміни'}
                  </Button>
                </Form>
              </Tab.Pane>

              <Tab.Pane eventKey="delivery">
                <Form.Group className="mb-3">
                  <Form.Label>Адреса доставки за замовчуванням</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="preferredDeliveryLocation"
                    value={formData.preferredDeliveryLocation}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Form.Group>
                
                <Button 
                  onClick={handleSubmit}
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'Збереження...' : 'Зберегти адресу'}
                </Button>
              </Tab.Pane>

              {/* Добавить компонент изменения пароля */}
              <Tab.Pane eventKey="password">
                <ChangePassword />
              </Tab.Pane>
              <Tab.Pane eventKey="orders">
                <OrderHistory />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

// Компонент изменения пароля
const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Добавить логику изменения пароля
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>Поточний пароль</Form.Label>
        <Form.Control
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          disabled={loading}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Новий пароль</Form.Label>
        <Form.Control
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          disabled={loading}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Підтвердження нового пароля</Form.Label>
        <Form.Control
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={loading}
        />
      </Form.Group>

      <Button 
        type="submit" 
        variant="primary"
        disabled={loading}
      >
        {loading ? 'Зміна паролю...' : 'Змінити пароль'}
      </Button>
    </Form>
  );
};

export default UserProfile;