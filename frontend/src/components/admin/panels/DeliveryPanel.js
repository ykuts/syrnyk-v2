import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Card, Modal, Alert } from 'react-bootstrap';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { apiClient } from '../../../utils/api';
import { API_URL, getImageUrl } from '../../../config';

const DeliveryPanel = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [formData, setFormData] = useState({
    city: '',
    name: '',
    meetingPoint: '',
    photo: ''
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Загрузка станций
  const fetchStations = async () => {
    try {
      const response = await apiClient.get('/railway-stations');
      setStations(response.data);
      setError(null);
    } catch (err) {
      setError('Помилка при завантаженні станцій');
      console.error('Error fetching stations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // Обработчики формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('photo', file);
  
      const response = await apiClient.upload('/upload/stations', formData);

      setFormData(prev => ({
        ...prev,
        photo: response.url 
      }));
    } catch (err) {
      setError('Помилка при завантаженні фото');
      console.error('Error uploading photo:', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (selectedStation) {
        // Use PUT for update
        await apiClient.put(`/railway-stations/${selectedStation.id}`, formData);
      } else {
        // Use POST for creation
        await apiClient.post('/railway-stations', formData);
      }
      
      await fetchStations();
      setShowModal(false);
      setSelectedStation(null);
      setFormData({ city: '', name: '', meetingPoint: '', photo: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю станцію?')) {
      try {
        const station = stations.find(s => s.id === id);

        // Delete photo first if exists
        if (station.photo) {
          const filename = station.photo.split('/').pop();
          await fetch(`${API_URL}/api/upload/stations/${filename}`, {
            method: 'DELETE',
          });
        }
  
        // Then delete the station
        await fetch(`${API_URL}/api/railway-stations/${id}`, {
          method: 'DELETE',
        });
        
        await fetchStations();
      } catch (err) {
        setError('Помилка при видаленні станції');
      }
    }
  };

  const checkImageUrl = (url) => {
    if (!url) return null;
    return getImageUrl(url, 'station');
  };

  const handleEdit = (station) => {
    setSelectedStation(station);
    setFormData({
      city: station.city,
      name: station.name,
      meetingPoint: station.meetingPoint,
      photo: station.photo ? getImageUrl(station.photo, 'station') : ''
    });
    setShowModal(true);
  };

  if (loading && stations.length === 0) {
    return <div>Завантаження...</div>;
  }

  return (
    <div>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Управління залізничними станціями</h5>
          <Button
            variant="primary"
            onClick={() => {
              setSelectedStation(null);
              setFormData({ city: '', name: '', meetingPoint: '', photo: '' });
              setShowModal(true);
            }}
            className="d-flex align-items-center gap-2"
          >
            <PlusCircle size={18} />
            Додати станцію
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Місто</th>
                <th>Станція</th>
                <th>Місце зустрічі</th>
                <th>Фото</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {stations.map(station => (
                <tr key={station.id}>
                  <td>{station.city}</td>
                  <td>{station.name}</td>
                  <td>{station.meetingPoint}</td>
                  {<td>
                    {station.photo && (
                      <img
                        src={getImageUrl(station.photo)}
                        alt={station.name}
                        style={{ height: '50px', width: '50px', objectFit: 'cover' }}
                        onError={(e) => {
                          if (!e.target.dataset.tried) {
                            console.error('Error loading image:', station.photo);
                            e.target.dataset.tried = 'true';
                            e.target.src = '/placeholder.jpg';
                          }
                        }}
                      />
                    )}
                  </td>}
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(station)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(station.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedStation ? 'Редагувати станцію' : 'Додати нову станцію'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Місто</Form.Label>
              <Form.Control
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Назва станції</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Місце зустрічі</Form.Label>
              <Form.Control
                type="text"
                name="meetingPoint"
                value={formData.meetingPoint}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Фото станції</Form.Label>
              <div>
                {formData.photo && (
                  <div className="mb-2">
                    <img
                      src={checkImageUrl(formData.photo)}
                      alt="Preview"
                      style={{ height: '100px', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <Form.Control
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={uploadingPhoto}
                />
                {uploadingPhoto && <div className="mt-2">Завантаження фото...</div>}
              </div>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Скасувати
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading || uploadingPhoto}
              >
                {loading ? 'Збереження...' : 'Зберегти'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DeliveryPanel;