// components/OrderHistory.js
import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Modal, Row, Col, Card } from 'react-bootstrap';
import { apiClient } from '../utils/api';
import { getImageUrl } from '../config'
import { format } from 'date-fns';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const customHeaders = {
        Authorization: `Bearer ${token}`
      };
      
      // Using apiClient.get with the endpoint and custom headers
      const response = await apiClient.get('/users/orders', customHeaders);
      setOrders(response.orders);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: { bg: 'warning', text: 'В обробці' },
      CONFIRMED: { bg: 'info', text: 'Підтверджено' },
      DELIVERED: { bg: 'success', text: 'Доставлено' },
      CANCELLED: { bg: 'danger', text: 'Скасовано' }
    };
    return <Badge bg={variants[status].bg}>{variants[status].text}</Badge>;
  };

  const formatDeliveryInfo = (order) => {
    if (order.addressDelivery) {
      return `Доставка за адресою: ${order.addressDelivery.street}, ${order.addressDelivery.house}${
        order.addressDelivery.apartment ? `, кв. ${order.addressDelivery.apartment}` : ''
      }, ${order.addressDelivery.city}`;
    } else if (order.stationDelivery) {
      return `Доставка на станцію: ${order.stationDelivery.station.name}, час: ${
        format(new Date(order.stationDelivery.meetingTime), 'dd.MM.yyyy HH:mm')
      }`;
    } else if (order.pickupDelivery) {
      return `Самовивіз з: ${order.pickupDelivery.store.name}, час: ${
        format(new Date(order.pickupDelivery.pickupTime), 'dd.MM.yyyy HH:mm')
      }`;
    }
    return 'Спосіб доставки не вказано';
  };

  const OrderDetailsModal = ({ order, show, onHide }) => {
    if (!order) return null;

    return (
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Деталі замовлення #{order.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Інформація про доставку</h5>
                </Card.Header>
                <Card.Body>
                  <p>{formatDeliveryInfo(order)}</p>
                  <p>Статус: {getStatusBadge(order.status)}</p>
                  {order.trackingNumber && (
                    <p>Номер відстеження: {order.trackingNumber}</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Товари</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Товар</th>
                    <th>Кількість</th>
                    <th>Ціна</th>
                    <th>Сума</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {item.product.image && (
                            <img 
                              src={item.product.image} 
                              alt={item.product.name} 
                              style={{ width: '50px', marginRight: '10px' }}
                            />
                          )}
                          {item.product.name}
                        </div>
                      </td>
                      <td>{item.quantity}</td>
                      <td>{item.price} CHF</td>
                      <td>{(item.quantity * item.price).toFixed(2)} CHF</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Загальна сума:</strong></td>
                    <td><strong>{order.totalAmount} CHF</strong></td>
                  </tr>
                  {order.discount && (
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Знижка:</strong></td>
                      <td><strong>-{order.discount} CHF</strong></td>
                    </tr>
                  )}
                </tfoot>
              </Table>
            </Card.Body>
          </Card>

          {order.notesClient && (
            <Card className="mt-4">
              <Card.Header>
                <h5 className="mb-0">Примітки до замовлення</h5>
              </Card.Header>
              <Card.Body>
                <p>{order.notesClient}</p>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Закрити
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  if (loading) {
    return <Container className="py-4">Loading...</Container>;
  }

  if (error) {
    return <Container className="py-4">Error: {error}</Container>;
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Історія замовлень</h2>

      {orders.length === 0 ? (
        <p>У вас поки немає замовлень</p>
      ) : (
        <Table responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Дата</th>
              <th>Статус</th>
              <th>Спосіб доставки</th>
              <th>Сума</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{format(new Date(order.createdAt), 'dd.MM.yyyy')}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>{order.deliveryType}</td>
                <td>{order.totalAmount} CHF</td>
                <td>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetails(true);
                    }}
                  >
                    Деталі
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <OrderDetailsModal
        order={selectedOrder}
        show={showDetails}
        onHide={() => {
          setShowDetails(false);
          setSelectedOrder(null);
        }}
      />
    </Container>
  );
};

export default OrderHistory;