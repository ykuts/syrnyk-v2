// components/admin/OrdersPanelComp/OrderItemsEditor.js
import React, { useState } from 'react';
import { 
  ListGroup, 
  Button, 
  Form, 
  InputGroup, 
  Modal,
  Alert
} from 'react-bootstrap';
import { Plus, Minus, Trash, PlusCircle } from 'lucide-react';
import { apiClient } from '../../../../utils/api';
import './OrderItemsEditor.css';


const OrderItemsEditor = ({ 
  order, 
  onOrderUpdate,
  getAuthHeaders,
  onOrderChange  // New prop
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    productId: '',
    quantity: 1
  });
  const [availableProducts, setAvailableProducts] = useState([]);

  const getUpdatedOrder = async (orderId) => {
    try {
      const response = await apiClient.get(
        `/admin/orders`,
        getAuthHeaders()
      );
      const updatedOrder = response.orders.find(o => o.id === orderId);
      if (!updatedOrder) {
        throw new Error('Updated order not found');
      }
      return updatedOrder;
    } catch (err) {
      console.error('Error fetching updated order:', err);
      throw err;
    }
  };

  const handleShowAddModal = async () => {
    try {
      const response = await apiClient.get('/products');
      setAvailableProducts(response);
      setShowAddModal(true);
    } catch (err) {
      setError('Failed to load products');
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.put(
        `/orders/${order.id}/items/${itemId}`,
        { quantity: newQuantity },
        getAuthHeaders()
      );
      
      const updatedOrder = await getUpdatedOrder(order.id);
      onOrderUpdate(updatedOrder);
      onOrderChange(); // Notify parent about changes
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item?')) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await apiClient.delete(
        `/orders/${order.id}/items/${itemId}`,
        getAuthHeaders()
      );
      
      const updatedOrder = await getUpdatedOrder(order.id);
      onOrderUpdate(updatedOrder);
      onOrderChange(); // Notify parent about changes
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.productId || newItem.quantity < 1) {
      setError('Please select a product and specify quantity');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await apiClient.post(
        `/orders/${order.id}/items`,
        newItem,
        getAuthHeaders()
      );
      
      const updatedOrder = await getUpdatedOrder(order.id);
      onOrderUpdate(updatedOrder);
      onOrderChange(); // Notify parent about changes
      setShowAddModal(false);
      setNewItem({ productId: '', quantity: 1 });
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="order-items-editor">
    {error && (
      <Alert variant="danger" className="mb-3">
        {error}
      </Alert>
    )}

    <div className="d-flex justify-content-between align-items-center mb-3">
      <h6 className="mb-0">Товари:</h6>
      <Button
        variant="outline-success"
        size="sm"
        onClick={handleShowAddModal}
        disabled={loading}
        className="add-item-btn d-flex align-items-center"
      >
        <PlusCircle size={18} className="me-1" />
        <span className="d-none d-sm-inline">Додати товар</span>
        <span className="d-sm-none">Додати</span>
      </Button>
    </div>

    <ListGroup>
      {order.items?.map((item) => (
        <ListGroup.Item 
          key={item.id}
          className="d-flex justify-content-between align-items-center"
        >
          {/* Product info */}
          <div className="item-info">
            <div className="item-name">{item.product?.name}</div>
            <div className="item-price">
              Ціна: ${Number(item.price).toFixed(2)}
            </div>
          </div>

          {/* Controls: quantity + total + delete */}
          <div className="item-controls">
            {/* Quantity controls */}
            <div className="quantity-controls">
              <InputGroup size="sm">
                <Button
                  variant="outline-secondary"
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  disabled={loading || item.quantity <= 1}
                >
                  <Minus size={14} />
                </Button>
                <Form.Control
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                  min="1"
                  style={{ textAlign: 'center' }}
                  disabled={loading}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  disabled={loading}
                >
                  <Plus size={14} />
                </Button>
              </InputGroup>
            </div>

            {/* Total and delete */}
            <div className="item-actions">
              <span className="item-total">
                ${(item.quantity * Number(item.price)).toFixed(2)}
              </span>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleRemoveItem(item.id)}
                disabled={loading}
                className="btn-delete"
              >
                <Trash size={14} />
              </Button>
            </div>
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>

    {/* Add item modal */}
    <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Додати товар</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Товар</Form.Label>
          <Form.Select
            value={newItem.productId}
            onChange={(e) => setNewItem({ ...newItem, productId: e.target.value })}
            required
          >
            <option value="">Оберіть товар...</option>
            {availableProducts.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} - ${Number(product.price).toFixed(2)}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group>
          <Form.Label>Кількість</Form.Label>
          <Form.Control
            type="number"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
            min="1"
            required
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
          Скасувати
        </Button>
        <Button 
          variant="primary" 
          onClick={handleAddItem}
          disabled={loading || !newItem.productId || newItem.quantity < 1}
        >
          Додати
        </Button>
      </Modal.Footer>
    </Modal>
  </div>
);
};

export default OrderItemsEditor;