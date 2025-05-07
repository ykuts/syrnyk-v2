// src/components/admin/panels/ProductsPanelsComp/ProductOrderManager.js
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Table, Button, Alert, Spinner } from 'react-bootstrap';
import { apiClient } from '../../../../utils/api';
import { getImageUrl } from '../../../../config';

const ProductOrderManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/products');
      // Sort products by displayOrder before setting state
      const sortedProducts = [...data].sort((a, b) => a.displayOrder - b.displayOrder);
      setProducts(sortedProducts);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update displayOrder for all items based on their new positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      displayOrder: index + 1
    }));
    
    setProducts(updatedItems);
  };

  const saveOrder = async () => {
    try {
      setSaving(true);
      
      // Prepare array of updates with product IDs and their new display orders
      const updates = products.map((product, index) => ({
        id: product.id,
        displayOrder: index + 1
      }));
      
      // Send bulk update to backend
      await apiClient.post('/products/update-order', { updates });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save product order');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  return (
    <div className="product-order-manager">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Manage Product Order</h3>
        <Button 
          variant="primary" 
          onClick={saveOrder} 
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Order'}
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Product order saved successfully!</Alert>}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="products">
          {(provided) => (
            <Table 
              striped 
              bordered 
              hover 
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>Order</th>
                  <th style={{ width: '80px' }}>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <Draggable 
                    key={product.id.toString()} 
                    draggableId={product.id.toString()} 
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          background: snapshot.isDragging ? "#f8f9fa" : "transparent"
                        }}
                      >
                        <td className="text-center">{index + 1}</td>
                        <td>
                          {product.image && (
                            <img 
                              src={getImageUrl(product.image, 'product')}
                              alt={product.name} 
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = '/assets/default-product.png';
                              }}
                            />
                          )}
                        </td>
                        <td>{product.name}</td>
                        <td>{product.category?.name}</td>
                        <td>{product.price} CHF</td>
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            </Table>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ProductOrderManager;