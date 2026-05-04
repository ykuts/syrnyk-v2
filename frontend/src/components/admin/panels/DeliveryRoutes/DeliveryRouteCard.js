// frontend/src/components/admin/panels/DeliveryRoutes/DeliveryRouteCard.js
import React, { useState } from 'react';
import { Card, Button, Badge, Collapse, ListGroup, Modal } from 'react-bootstrap';
import { Phone, MapPin, Navigation, ChevronDown, ChevronUp, Check, Package } from 'lucide-react';

const DeliveryRouteCard = ({ order, index, onDeliveryComplete }) => {
  const [expanded, setExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const getPaymentBadge = () => {
    if (order.paymentStatus === 'PAID') {
      return <Badge bg="success">✅ Оплачено</Badge>;
    }
    if (order.paymentMethod === 'CASH') {
      return <Badge bg="warning" text="dark">💵 Готівка при доставці</Badge>;
    }
    return <Badge bg="info">💳 До оплати</Badge>;
  };

  const handleCallClick = () => {
    window.location.href = `tel:${order.customer.phone}`;
  };

  const handleNavigateClick = () => {
    const address = order.customer.address.fullAddress;
    // Open in Google Maps
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
  };

  const handleDeliveryComplete = () => {
    setShowConfirm(true);
  };

  const confirmDelivery = async () => {
    setShowConfirm(false);
    await onDeliveryComplete(order.id);
  };

  const isDelivered = order.status === 'DELIVERED';

  return (
    <>
      <Card className={`delivery-route-card mb-3 ${isDelivered ? 'delivered' : ''}`}>
        <Card.Body>
          {/* Order Number */}
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h5 className="mb-1">
                {index + 1}. {order.customer.name}
              </h5>
              <small className="text-muted">Замовлення #{order.id}</small>
            </div>
            {isDelivered && (
              <Badge bg="success" className="delivered-badge">
                <Check size={16} /> Доставлено
              </Badge>
            )}
          </div>

          {/* Address */}
          <div className="mb-2">
            <div className="d-flex align-items-start gap-2">
              <MapPin size={18} className="text-primary mt-1 flex-shrink-0" />
              <div className="flex-grow-1">
                <div className="fw-medium">{order.customer.address.fullAddress}</div>
                <small className="text-muted">
                  {order.customer.address.city}, {order.customer.address.canton}
                </small>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="mb-3">
            <div className="d-flex align-items-center gap-2">
              <Phone size={18} className="text-primary" />
              <a href={`tel:${order.customer.phone}`} className="text-decoration-none">
                {order.customer.phone}
              </a>
            </div>
          </div>

          {/* Amount and Payment */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span className="fs-4 fw-bold text-primary">
                {formatCurrency(order.total)}
              </span>
            </div>
            <div>
              {getPaymentBadge()}
            </div>
          </div>

          {/* Action Buttons */}
          {!isDelivered ? (
            <div className="d-grid gap-2">
              <div className="row g-2">
                <div className="col-4">
                  <Button 
                    variant="outline-primary" 
                    className="w-100"
                    onClick={handleCallClick}
                  >
                    <Phone size={18} />
                  </Button>
                </div>
                <div className="col-4">
                  <Button 
                    variant="outline-primary" 
                    className="w-100"
                    onClick={handleNavigateClick}
                  >
                    <Navigation size={18} />
                  </Button>
                </div>
                <div className="col-4">
                  <Button 
                    variant="outline-secondary" 
                    className="w-100"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </Button>
                </div>
              </div>

              <Button 
                variant="success" 
                size="lg"
                onClick={handleDeliveryComplete}
                className="delivery-complete-btn"
              >
                <Check size={20} className="me-2" />
                Доставлено
              </Button>
            </div>
          ) : (
            <div className="text-center py-2">
              <small className="text-muted">
                Доставлено: {new Date(order.deliveredAt).toLocaleString('uk-UA')}
              </small>
            </div>
          )}

          {/* Expandable Details */}
          <Collapse in={expanded}>
            <div className="mt-3 pt-3 border-top">
              <h6 className="mb-2 d-flex align-items-center gap-2">
                <Package size={18} />
                Товари:
              </h6>
              <ListGroup variant="flush">
                {order.items.map((item) => (
                  <ListGroup.Item 
                    key={item.id}
                    className="px-0 d-flex justify-content-between"
                  >
                    <div>
                      <div>{item.productName}</div>
                      <small className="text-muted">x{item.quantity}</small>
                    </div>
                    <div className="text-end">
                      <div>{formatCurrency(item.total)}</div>
                      <small className="text-muted">
                        {formatCurrency(item.price)} × {item.quantity}
                      </small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <div className="mt-2 pt-2 border-top">
                <div className="d-flex justify-content-between fw-bold">
                  <span>Разом:</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>

              {order.notesClient && (
                <div className="mt-3">
                  <strong>Примітка клієнта:</strong>
                  <p className="mb-0 mt-1">{order.notesClient}</p>
                </div>
              )}
            </div>
          </Collapse>
        </Card.Body>
      </Card>

      {/* Confirmation Modal */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Підтвердити доставку</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Підтвердити доставку замовлення?</p>
          <div className="bg-light p-3 rounded">
            <div><strong>{order.customer.name}</strong></div>
            <div className="text-muted">{order.customer.address.fullAddress}</div>
            <div className="mt-2">
              <strong>Сума: {formatCurrency(order.total)}</strong>
            </div>
            {order.paymentStatus === 'PENDING' && (
              <div className="mt-2 text-warning">
                💵 Потрібно отримати готівку
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Скасувати
          </Button>
          <Button variant="success" onClick={confirmDelivery}>
            <Check size={18} className="me-2" />
            Так, доставлено
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DeliveryRouteCard;
