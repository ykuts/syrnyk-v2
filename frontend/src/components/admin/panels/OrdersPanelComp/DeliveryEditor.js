// frontend/src/components/admin/panels/OrdersPanelComp/DeliveryEditor.js
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Spinner
} from 'react-bootstrap';
import { apiClient } from '../../../../utils/api';

const DeliveryEditor = ({ 
  show, 
  onHide, 
  order, 
  onDeliveryUpdate,
  getAuthHeaders 
}) => {
  const [formData, setFormData] = useState({
    deliveryType: 'RAILWAY_STATION',
    deliveryDate: '',
    deliveryTimeSlot: '',
    // Address fields
    street: '',
    house: '',
    apartment: '',
    city: '',
    postalCode: '',
    // Station fields
    deliveryStationId: '',
    meetingTime: '',
    // Pickup fields
    storeId: '',
    pickupTime: ''
  });
  
  const [deliveryOptions, setDeliveryOptions] = useState({
    stations: [],
    stores: []
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data when order changes
  useEffect(() => {
    if (order) {
      const deliveryDate = order.deliveryDate ? 
        new Date(order.deliveryDate).toISOString().slice(0, 16) : '';
      
      setFormData({
        deliveryType: order.deliveryType || 'RAILWAY_STATION',
        deliveryDate,
        deliveryTimeSlot: order.deliveryTimeSlot || '',
        // Address fields
        street: order.addressDelivery?.street || '',
        house: order.addressDelivery?.house || '',
        apartment: order.addressDelivery?.apartment || '',
        city: order.addressDelivery?.city || '',
        postalCode: order.addressDelivery?.postalCode || '',
        // Station fields
        deliveryStationId: order.deliveryStationId?.toString() || '',
        meetingTime: order.stationDelivery?.meetingTime ? 
          new Date(order.stationDelivery.meetingTime).toISOString().slice(0, 16) : '',
        // Pickup fields
        storeId: order.deliveryPickupLocationId?.toString() || '',
        pickupTime: order.pickupDelivery?.pickupTime ? 
          new Date(order.pickupDelivery.pickupTime).toISOString().slice(0, 16) : ''
      });
    }
  }, [order]);

  // Load delivery options when modal opens
  useEffect(() => {
    if (show) {
      loadDeliveryOptions();
    }
  }, [show]);

  const loadDeliveryOptions = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/delivery/options', getAuthHeaders());
      if (response.success) {
        setDeliveryOptions(response.data);
      }
    } catch (err) {
      console.error('Error loading delivery options:', err);
      setError('Failed to load delivery options');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error when user makes changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Validate required fields based on delivery type
      const validation = validateForm();
      if (!validation.isValid) {
        setError(validation.error);
        setSaving(false);
        return;
      }

      const response = await apiClient.patch(
        `/delivery/order/${order.id}`,
        formData,
        getAuthHeaders()
      );

      if (response.success) {
        // Call parent callback to update order in list
        onDeliveryUpdate(response.order);
        onHide(); // Close modal
      } else {
        setError(response.message || 'Failed to update delivery');
      }
    } catch (err) {
      console.error('Error updating delivery:', err);
      setError(err.message || 'Failed to update delivery information');
    } finally {
      setSaving(false);
    }
  };

  const validateForm = () => {
    const { deliveryType } = formData;

    switch (deliveryType) {
      case 'ADDRESS':
        if (!formData.street || !formData.house || !formData.city) {
          return { 
            isValid: false, 
            error: 'Street, house number, and city are required for address delivery' 
          };
        }
        break;
      case 'RAILWAY_STATION':
        if (!formData.deliveryStationId) {
          return { 
            isValid: false, 
            error: 'Railway station selection is required' 
          };
        }
        break;
      case 'PICKUP':
        if (!formData.storeId) {
          return { 
            isValid: false, 
            error: 'Store selection is required for pickup' 
          };
        }
        break;
    }

    return { isValid: true };
  };

  const renderDeliveryFields = () => {
    switch (formData.deliveryType) {
      case 'ADDRESS':
        return (
          <>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Вулиця *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    placeholder="Назва вулиці"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Номер будинку *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.house}
                    onChange={(e) => handleInputChange('house', e.target.value)}
                    placeholder="123"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Квартира</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.apartment}
                    onChange={(e) => handleInputChange('apartment', e.target.value)}
                    placeholder="45"
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group className="mb-3">
                  <Form.Label>Місто *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Київ"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Поштовий код</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="01001"
                  />
                </Form.Group>
              </Col>
            </Row>
          </>
        );

      case 'RAILWAY_STATION':
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Залізнична станція *</Form.Label>
              <Form.Select
                value={formData.deliveryStationId}
                onChange={(e) => handleInputChange('deliveryStationId', e.target.value)}
                required
              >
                <option value="">Оберіть станцію</option>
                {deliveryOptions.stations.map(station => (
                  <option key={station.id} value={station.id}>
                    {station.city} - {station.name} ({station.meetingPoint})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Час зустрічі</Form.Label>
              <Form.Control
                type="datetime-local"
                value={formData.meetingTime}
                onChange={(e) => handleInputChange('meetingTime', e.target.value)}
              />
              <Form.Text className="text-muted">
                Якщо не вказано, буде використано дату доставки
              </Form.Text>
            </Form.Group>
          </>
        );

      case 'PICKUP':
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Магазин для самовивозу *</Form.Label>
              <Form.Select
                value={formData.storeId}
                onChange={(e) => handleInputChange('storeId', e.target.value)}
                required
              >
                <option value="">Оберіть магазин</option>
                {deliveryOptions.stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name} - {store.city}, {store.address}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Час самовивозу</Form.Label>
              <Form.Control
                type="datetime-local"
                value={formData.pickupTime}
                onChange={(e) => handleInputChange('pickupTime', e.target.value)}
              />
            </Form.Group>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          Редагувати доставку - Замовлення #{order?.id}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {loading && (
            <div className="text-center mb-3">
              <Spinner animation="border" size="sm" /> Завантаження опцій доставки...
            </div>
          )}
          
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Тип доставки</Form.Label>
                <Form.Select
                  value={formData.deliveryType}
                  onChange={(e) => handleInputChange('deliveryType', e.target.value)}
                >
                  <option value="RAILWAY_STATION">Залізнична станція</option>
                  <option value="ADDRESS">За адресою</option>
                  <option value="PICKUP">Самовивіз</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Дата доставки</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={formData.deliveryDate}
                  onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Часовий слот</Form.Label>
            <Form.Control
              type="text"
              value={formData.deliveryTimeSlot}
              onChange={(e) => handleInputChange('deliveryTimeSlot', e.target.value)}
              placeholder="09:00-12:00"
            />
          </Form.Group>

          {renderDeliveryFields()}
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={saving}>
            Скасувати
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={saving || loading}
          >
            {saving && <Spinner animation="border" size="sm" className="me-2" />}
            {saving ? 'Збереження...' : 'Зберегти зміни'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default DeliveryEditor;