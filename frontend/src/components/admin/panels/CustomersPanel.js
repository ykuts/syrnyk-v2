import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { Eye, UserX, UserCheck } from 'lucide-react';
import axios from 'axios';

const CustomersPanel = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState({ customer: null, newStatus: false });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (Array.isArray(response.data)) {
        setCustomers(response.data);
      } else if (response.data && Array.isArray(response.data.users)) {
        setCustomers(response.data.users);
      } else {
        console.error('Unexpected data format:', response.data);
        setError('Неправильний формат даних від сервера');
        setCustomers([]);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('У вас нет прав доступа к этой странице');
      } else {
        setError('Ошибка при загрузке списка клиентов');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const handleShowStatusModal = (customer, newStatus) => {
    setStatusAction({ customer, newStatus });
    setShowStatusModal(true);
  };

  const handleStatusChange = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/users/admin/users/${statusAction.customer.id}/status`,
        { isActive: statusAction.newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setShowStatusModal(false);
      fetchCustomers();
    } catch (err) {
      setError('Помилка при зміні статусу користувача');
      console.error(err);
    }
  };

  if (loading && !customers.length) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container fluid>
      <h2 className="mb-4">Управління клієнтами</h2>
      
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {customers.length === 0 && !loading ? (
        <Alert variant="info">Клієнтів не знайдено</Alert>
      ) : (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ім'я</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Статус</th>
              <th>Дата реєстрації</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{`${customer.firstName} ${customer.lastName}`}</td>
                <td>{customer.email}</td>
                <td>{customer.phone || 'Не вказано'}</td>
                <td>
                  <Badge bg={customer.isActive ? 'success' : 'danger'}>
                    {customer.isActive ? 'Активний' : 'Заблокований'}
                  </Badge>
                </td>
                <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleShowDetails(customer)}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      variant={customer.isActive ? "outline-danger" : "outline-success"}
                      size="sm"
                      onClick={() => handleShowStatusModal(customer, !customer.isActive)}
                    >
                      {customer.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Модальне вікно з деталями користувача */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Деталі клієнта</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCustomer && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Повне ім'я</Form.Label>
                <Form.Control 
                  readOnly 
                  value={`${selectedCustomer.firstName} ${selectedCustomer.lastName}`} 
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control readOnly value={selectedCustomer.email} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Телефон</Form.Label>
                <Form.Control readOnly value={selectedCustomer.phone || 'Не вказано'} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Адреса доставки за замовчуванням</Form.Label>
                <Form.Control 
                  readOnly 
                  value={selectedCustomer.preferredDeliveryLocation || 'Не вказано'} 
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Дата реєстрації</Form.Label>
                <Form.Control 
                  readOnly 
                  value={new Date(selectedCustomer.createdAt).toLocaleString()} 
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Модальне вікно підтвердження зміни статусу */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Підтвердження дії</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {statusAction.customer && (
            <p>
              Ви дійсно бажаєте {statusAction.newStatus ? 'активувати' : 'деактивувати'} користувача{' '}
              <strong>{statusAction.customer.firstName} {statusAction.customer.lastName}</strong>?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Скасувати
          </Button>
          <Button
            variant={statusAction.newStatus ? "success" : "danger"}
            onClick={handleStatusChange}
          >
            {statusAction.newStatus ? 'Активувати' : 'Деактивувати'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CustomersPanel;