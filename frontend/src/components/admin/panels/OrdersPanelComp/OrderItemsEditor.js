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

const OrderItemsEditor = ({ 
  order, 
  onOrderUpdate,
  getAuthHeaders 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    productId: '',
    quantity: 1
  });
  const [availableProducts, setAvailableProducts] = useState([]);

  // New function to get updated order
  const getUpdatedOrder = async (orderId) => {
    try {
      const response = await apiClient.get(
        `/admin/orders`,
        getAuthHeaders()
      );
      // Find the specific order from the list
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
        <h6 className="mb-0">Order Items:</h6>
        <Button
          variant="outline-success"
          size="sm"
          onClick={handleShowAddModal}
          disabled={loading}
        >
          <PlusCircle size={18} className="me-1" />
          Add Item
        </Button>
      </div>

      <ListGroup>
        {order.items?.map((item) => (
          <ListGroup.Item 
            key={item.id}
            className="d-flex justify-content-between align-items-center"
          >
            <div className="d-flex align-items-center flex-grow-1">
              <div className="me-3">
                <strong>{item.product?.name}</strong>
                <div className="text-muted small">
                  Price: ${Number(item.price).toFixed(2)}
                </div>
              </div>
              
              <InputGroup size="sm" style={{ width: '120px' }}>
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

            <div className="ms-3 d-flex align-items-center">
              <span className="me-3">
                ${(item.quantity * Number(item.price)).toFixed(2)}
              </span>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleRemoveItem(item.id)}
                disabled={loading}
              >
                <Trash size={14} />
              </Button>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>

      {/* Add Item Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Item to Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Product</Form.Label>
            <Form.Select
              value={newItem.productId}
              onChange={(e) => setNewItem({ ...newItem, productId: e.target.value })}
              required
            >
              <option value="">Select a product...</option>
              {availableProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${Number(product.price).toFixed(2)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>Quantity</Form.Label>
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
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddItem}
            disabled={loading || !newItem.productId || newItem.quantity < 1}
          >
            Add Item
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderItemsEditor;