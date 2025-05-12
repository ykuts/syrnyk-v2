// Update to src/components/admin/panels/DeliveryPanel.js

import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Card, Modal, Alert } from 'react-bootstrap';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { apiClient } from '../../../utils/api';
import { getImageUrl } from '../../../config';
import StationTranslationsForm from './DeliveryPanelComp/StationTranslationsForm';

const DeliveryPanel = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [availableLanguages, setAvailableLanguages] = useState(['uk', 'en', 'fr']);
  const [formData, setFormData] = useState({
    city: '',
    name: '',
    meetingPoint: '',
    photo: '',
    translations: {}
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Fetch stations
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

  // Fetch available languages
  const fetchAvailableLanguages = async () => {
    try {
      const response = await apiClient.get('/railway-stations/languages');
      if (response.languages && response.languages.length > 0) {
        setAvailableLanguages(response.languages);
      }
    } catch (err) {
      console.error('Error fetching available languages:', err);
    }
  };

  useEffect(() => {
    fetchStations();
    fetchAvailableLanguages();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle translations changes
  const handleTranslationsChange = (translations) => {
    setFormData(prev => ({
      ...prev,
      translations
    }));
  };

  // Handle file change
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
        photo: response.url.replace(/^\/+/, '')
      }));
    } catch (err) {
      setError('Помилка при завантаженні фото');
      console.error('Error uploading photo:', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (selectedStation) {
        // Update existing station
        await apiClient.put(`/railway-stations/${selectedStation.id}`, formData);
      } else {
        // Create new station
        await apiClient.post('/railway-stations', formData);
      }
      
      await fetchStations();
      setShowModal(false);
      setSelectedStation(null);
      setFormData({ 
        city: '', 
        name: '', 
        meetingPoint: '', 
        photo: '',
        translations: {}
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle station deletion
  const handleDelete = async (id) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю станцію?')) {
      try {
        const station = stations.find(s => s.id === id);

        // Delete photo first if exists
        if (station.photo) {
          const filename = station.photo.split('/').pop();
          await apiClient.delete(`/upload/stations/${filename}`);
        }
  
        // Then delete the station
        await apiClient.delete(`/railway-stations/${id}`);
        
        await fetchStations();
      } catch (err) {
        setError('Помилка при видаленні станції');
      }
    }
  };

  // Helper function to check and format image URLs
  const checkImageUrl = (url) => {
    if (!url) return null;
    try {
      return getImageUrl(url, 'station');
    } catch (error) {
      console.error('Error formatting image URL:', error);
      return '/placeholder.jpg';
    }
  };

  // Handle editing a station
  const handleEdit = async (station) => {
    try {
      // Fetch full station data with translations
      const stationData = await apiClient.get(`/railway-stations/${station.id}`);
      setSelectedStation(stationData);
      
      // Format data for the form
      setFormData({
        city: stationData.city,
        name: stationData.name,
        meetingPoint: stationData.meetingPoint,
        photo: stationData.photo ? stationData.photo.replace(/^\/+/, '') : '',
        translations: stationData.translations || {}
      });
      
      setShowModal(true);
    } catch (err) {
      setError('Помилка при завантаженні деталей станції');
      console.error('Error fetching station details:', err);
    }
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
              setFormData({ 
                city: '', 
                name: '', 
                meetingPoint: '', 
                photo: '',
                translations: {}
              });
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
                <th>Переклади</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {stations.map(station => (
                <tr key={station.id}>
                  <td>{station.city}</td>
                  <td>{station.name}</td>
                  <td>{station.meetingPoint}</td>
                  <td>
                    {station.photo && (
                      <img
                        src={checkImageUrl(station.photo)}
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
                  </td>
                  <td>
                    {station.translations ? 
                      Object.keys(station.translations).join(', ') : 
                      'No translations'}
                  </td>
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
                as="textarea"
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

            {/* Station translations form */}
            <StationTranslationsForm
              translations={formData.translations}
              availableLanguages={availableLanguages}
              onChange={handleTranslationsChange}
            />

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