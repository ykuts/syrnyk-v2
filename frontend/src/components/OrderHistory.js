// components/OrderHistory.js
import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Modal, Row, Col, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../utils/api';
import { getImageUrl } from '../config'
import { format } from 'date-fns';

const OrderHistory = () => {
  const { t, i18n } = useTranslation(['orders', 'common']);
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
      setError(t('errors.fetch_failed'));
    } finally {
      setLoading(false);
    }
  };

  // Get status badge with localized text
  const getStatusBadge = (status) => {
    const variants = {
      PENDING: { bg: 'warning', text: t('status.pending') },
      CONFIRMED: { bg: 'info', text: t('status.confirmed') },
      DELIVERED: { bg: 'success', text: t('status.delivered') },
      CANCELLED: { bg: 'danger', text: t('status.cancelled') }
    };
    return <Badge bg={variants[status].bg}>{variants[status].text}</Badge>;
  };

  // Format delivery information with localized text
  const formatDeliveryInfo = (order) => {
    if (order.addressDelivery) {
      return t('delivery.address_format', {
        street: order.addressDelivery.street,
        house: order.addressDelivery.house,
        apartment: order.addressDelivery.apartment ? t('delivery.apartment', { number: order.addressDelivery.apartment }) : '',
        city: order.addressDelivery.city
      });
    } else if (order.stationDelivery) {
      return t('delivery.station_format', {
        station: order.stationDelivery.station.name,
        time: format(new Date(order.stationDelivery.meetingTime), 'dd.MM.yyyy HH:mm')
      });
    } else if (order.pickupDelivery) {
      return t('delivery.pickup_format', {
        store: order.pickupDelivery.store.name,
        time: format(new Date(order.pickupDelivery.pickupTime), 'dd.MM.yyyy HH:mm')
      });
    }
    return t('delivery.not_specified');
  };

  // Order details modal component
  const OrderDetailsModal = ({ order, show, onHide }) => {
    if (!order) return null;

    return (
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t('modal.title', { id: order.id })}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">{t('modal.delivery_info')}</h5>
                </Card.Header>
                <Card.Body>
                  <p>{formatDeliveryInfo(order)}</p>
                  <p>{t('modal.status')}: {getStatusBadge(order.status)}</p>
                  {order.trackingNumber && (
                    <p>{t('modal.tracking_number')}: {order.trackingNumber}</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Header>
              <h5 className="mb-0">{t('modal.products')}</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>{t('table.product')}</th>
                    <th>{t('table.quantity')}</th>
                    <th>{t('table.price')}</th>
                    <th>{t('table.total')}</th>
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
                      <td>{item.price} {t('common:currency')}</td>
                      <td>{(item.quantity * item.price).toFixed(2)} {t('common:currency')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>{t('table.grand_total')}:</strong></td>
                    <td><strong>{order.totalAmount} {t('common:currency')}</strong></td>
                  </tr>
                  {order.discount && (
                    <tr>
                      <td colSpan="3" className="text-end"><strong>{t('table.discount')}:</strong></td>
                      <td><strong>-{order.discount} {t('common:currency')}</strong></td>
                    </tr>
                  )}
                </tfoot>
              </Table>
            </Card.Body>
          </Card>

          {order.notesClient && (
            <Card className="mt-4">
              <Card.Header>
                <h5 className="mb-0">{t('modal.order_notes')}</h5>
              </Card.Header>
              <Card.Body>
                <p>{order.notesClient}</p>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            {t('common:buttons.close')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  // Loading state
  if (loading) {
    return <Container className="py-4">{t('common:loading')}</Container>;
  }

  // Error state
  if (error) {
    return <Container className="py-4">{t('common:error')}: {error}</Container>;
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">{t('title')}</h2>

      {orders.length === 0 ? (
        <p>{t('empty_message')}</p>
      ) : (
        <Table responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>{t('table.date')}</th>
              <th>{t('table.status')}</th>
              <th>{t('table.delivery_method')}</th>
              <th>{t('table.amount')}</th>
              <th>{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{format(new Date(order.createdAt), 'dd.MM.yyyy')}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>{order.deliveryType}</td>
                <td>{order.totalAmount} {t('common:currency')}</td>
                <td>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetails(true);
                    }}
                  >
                    {t('buttons.details')}
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