import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Card, Modal, Alert } from 'react-bootstrap';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

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
    photo: null
  });

  // Загрузка станций
  const fetchStations = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/railway-stations');
      const data = await response.json();
      setStations(data.data);
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

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      photo: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const url = selectedStation
        ? `http://localhost:3001/api/railway-stations/${selectedStation.id}`
        : 'http://localhost:3001/api/railway-stations';
      
      const method = selectedStation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Помилка при збереженні станції');
      }

      await fetchStations();
      setShowModal(false);
      setSelectedStation(null);
      setFormData({ city: '', name: '', meetingPoint: '', photo: null });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю станцію?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/railway-stations/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Помилка при видаленні станції');
        }

        await fetchStations();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleEdit = (station) => {
    setSelectedStation(station);
    setFormData({
      city: station.city,
      name: station.name,
      meetingPoint: station.meetingPoint,
      photo: null
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
              setFormData({ city: '', name: '', meetingPoint: '', photo: null });
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
                  <td>
                    {station.photo && (
                      <img 
                        src={station.photo} 
                        alt="Station" 
                        style={{ height: '50px', width: '50px', objectFit: 'cover' }} 
                      />
                    )}
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
                type="text"
                name="meetingPoint"
                value={formData.meetingPoint}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Фото станції</Form.Label>
              <Form.Control
                type="file"
                name="photo"
                onChange={handleFileChange}
                accept="image/*"
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Скасувати
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
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


