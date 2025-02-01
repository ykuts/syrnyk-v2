import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Tab, Nav, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import OrderHistory from './OrderHistory';
import DeliveryMethodSelector from './DeliveryMethodSelector';
import StationSelector from './StationSelector';
import { apiClient } from '../utils/api';
import ChangePassword from './ChangePassword';
import './UserProfile.css';

// Store address constant
const STORE_ADDRESS = {
  id: 1,
  name: "Магазин у Ньоні",
  address: "Chemin de Pre-Fleuri, 5",
  city: "Nyon",
  workingHours: "Щоденно 9:00-20:00"
};



const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [railwayStations, setRailwayStations] = useState([]);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    preferredDeliveryType: user?.preferredDeliveryType || 'PICKUP',
    street: user?.deliveryAddress?.street || '',
    house: user?.deliveryAddress?.house || '',
    apartment: user?.deliveryAddress?.apartment || '',
    city: user?.deliveryAddress?.city || '',
    postalCode: user?.deliveryAddress?.postalCode || '',
    stationId: user?.preferredStation?.id?.toString() || '',
    storeId: '1'
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Load delivery preferences
        const prefsResponse = await apiClient.get('/users/delivery-preferences', {
          'Authorization': `Bearer ${token}`
        });
        
        if (prefsResponse.preferences) {
          setFormData(prev => ({
            ...prev,
            preferredDeliveryType: prefsResponse.preferences.type || 'PICKUP',
            street: prefsResponse.preferences.address?.street || '',
            house: prefsResponse.preferences.address?.house || '',
            apartment: prefsResponse.preferences.address?.apartment || '',
            city: prefsResponse.preferences.address?.city || '',
            postalCode: prefsResponse.preferences.postalCode || '',
            stationId: prefsResponse.preferences.stationId?.toString() || '',
          }));
        }

        // Load stations
        const stationsResponse = await apiClient.get('/railway-stations', {
          'Authorization': `Bearer ${token}`
        });
        setRailwayStations(stationsResponse.data || []);

      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Failed to load user preferences');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('handleChange:', { name, value }); // Debug

    if (name === 'preferredDeliveryType') {
      setFormData(prev => ({
        ...prev,
        preferredDeliveryType: value,
        // Reset other delivery fields based on type
        ...(value === 'ADDRESS' && {
          stationId: '',
          storeId: '',
        }),
        ...(value === 'RAILWAY_STATION' && {
          street: '',
          house: '',
          apartment: '',
          city: '',
          postalCode: '',
          storeId: '',
        }),
        ...(value === 'PICKUP' && {
          street: '',
          house: '',
          apartment: '',
          city: '',
          postalCode: '',
          stationId: '',
        })
      }));
    } else {
      setFormData(prev => {
        const newState = {
          ...prev,
          [name]: value
        };
        console.log('New form state:', newState); 
        return newState;
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('Submitting form data:', formData);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Prepare delivery preferences based on type
      const deliveryPreferences = {
        type: formData.preferredDeliveryType,
        address: formData.preferredDeliveryType === 'ADDRESS' ? {
          street: formData.street,
          house: formData.house,
          apartment: formData.apartment,
          city: formData.city,
          postalCode: formData.postalCode,
        } : null,
        stationId: formData.preferredDeliveryType === 'RAILWAY_STATION' ? 
          parseInt(formData.stationId) : null,
        storeId: formData.preferredDeliveryType === 'PICKUP' ? 
          parseInt(formData.storeId) : null,
      };

      console.log('Prepared delivery preferences:', deliveryPreferences);

      // Send request to update profile
  const result = await updateProfile({
    firstName: formData.firstName,
    lastName: formData.lastName,
    phone: formData.phone,
    deliveryPreferences
  });

  console.log('Update result:', result);

  if (result.success) {
    try {
    const token = localStorage.getItem('token');
        const prefsResponse = await apiClient.get('/users/delivery-preferences', {
          'Authorization': `Bearer ${token}`
        });

        if (prefsResponse.preferences) {
          setFormData(prev => ({
            ...prev,
            preferredDeliveryType: prefsResponse.preferences.type || 'PICKUP',
            stationId: prefsResponse.preferences.stationId?.toString() || '',
            street: prefsResponse.preferences.address?.street || '',
            house: prefsResponse.preferences.address?.house || '',
            apartment: prefsResponse.preferences.address?.apartment || '',
            city: prefsResponse.preferences.address?.city || '',
            postalCode: prefsResponse.preferences.address?.postalCode || '',
            
          }));
        }
      } catch (error) {
        console.error('Error reloading preferences:', error);
      }

    setSuccess('Profile successfully updated');
    setTimeout(() => setSuccess(''), 3000);
  } else {
    setError(result.error || 'Error updating profile');
  }

} catch (err) {
  console.error('Update error:', err);
  setError(err.message || 'Error updating profile');
} finally {
  setLoading(false);
}
};

  // Render delivery preferences section based on type
  const renderDeliveryPreferences = () => {
    switch (formData.preferredDeliveryType) {
      case 'ADDRESS':
        return (
          <Card className="mt-3">
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Вулиця</Form.Label>
                <Form.Control
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Будинок</Form.Label>
                    <Form.Control
                      type="text"
                      name="house"
                      value={formData.house}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Квартира (не обов'язково)</Form.Label>
                    <Form.Control
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Місто</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Індекс</Form.Label>
                    <Form.Control
                      type="text"
                      name="postalCode"
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
          <Card className="mt-3">
            <Card.Body>
              <StationSelector
                stations={railwayStations}
                selectedStation={formData.stationId}
                onChange={handleChange}
                showMeetingTime={false}
              />
            </Card.Body>
          </Card>
        );

      case 'PICKUP':
        return (
          <Card className="mt-3">
            <Card.Body>
              <div className="bg-light p-3 rounded">
                <h6 className="mb-2">{STORE_ADDRESS.name}</h6>
                <p className="mb-2">{STORE_ADDRESS.address}, {STORE_ADDRESS.city}</p>
                <p className="mb-0"><strong>Часи роботи:</strong> {STORE_ADDRESS.workingHours}</p>
              </div>
            </Card.Body>
          </Card>
        );

      default:
        return null;
    }
  };

  // Main render
  return (
    <Container className="py-5">
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Row>
          <Col md={3}>
            <Nav className="flex-column custom-nav">
              <Nav.Item>
                <Nav.Link eventKey="profile">Профіль</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="delivery">Доставка за замовчанням</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="password">Змінити пароль</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="orders">Історія замовлень</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          
          <Col md={9}>
            {loading && <Alert variant="info">Завантаження...</Alert>}
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
            
            <Tab.Content>
              {/* Profile Tab */}
              <Tab.Pane eventKey="profile">
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
                          required
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
                          required
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
                    <Form.Label>Телефон (WhatsApp)</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="+XXX XXXXXXXX"
                      required
                    />
                    <Form.Text className="text-muted">
                      Будь ласка, вкажіть телефон з WhatsApp для спілкування з вами
                    </Form.Text>
                  </Form.Group>

                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? 'Зберігаємо...' : 'Зберегти'}
                  </Button>
                </Form>
              </Tab.Pane>

              {/* Delivery Preferences Tab */}
              <Tab.Pane eventKey="delivery">
                <h4 className="mb-4">Доставка за замовчанням</h4>
                
                <DeliveryMethodSelector
                  selectedMethod={formData.preferredDeliveryType}
                  onChange={handleChange}
                />

                {renderDeliveryPreferences()}
                
                <Button 
                  onClick={handleSubmit}
                  variant="primary"
                  className="mt-3"
                  disabled={loading}
                >
                  {loading ? 'Зберігаємо...' : 'Зберегти'}
                </Button>
              </Tab.Pane>

              {/* Password Tab */}
              <Tab.Pane eventKey="password">
                <ChangePassword />
              </Tab.Pane>

              {/* Orders Tab */}
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

export default UserProfile;