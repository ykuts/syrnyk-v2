import React from 'react';
import { Table, Button, ButtonGroup } from 'react-bootstrap';
import { Trash, Plus, Minus } from 'lucide-react';
import './CartProducts.css';

/**
 * CartProducts component with responsive design
 * - Table for desktop
 * - Simple list with quantity controls for mobile
 */
const CartProducts = ({ 
  items, 
  totalPrice, 
  onAdd, 
  onRemove, 
  onRemoveAll 
}) => {
  return (
    <div className="mb-5">
      <h2 className="h4 mb-4">Ваші продукти</h2>
      
      {/* Desktop view - Table */}
      {/* <div className="d-none d-md-block">
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Продукт</th>
                <th className="text-center">Кількість</th>
                <th className="text-end">Ціна</th>
                <th className="text-end">Усього</th>
                <th className="text-center">Дія</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td className="text-center">
                    <ButtonGroup size="sm">
                      <Button 
                        variant="outline-secondary"
                        style={{ border: 'none' }}
                        onClick={() => onRemove?.(item.id)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </Button>
                      <Button variant="light" disabled>
                        {item.quantity}
                      </Button>
                      <Button 
                        variant="outline-secondary"
                        onClick={() => onAdd?.(item.id)}
                      >
                        <Plus size={16} />
                      </Button>
                    </ButtonGroup>
                  </td>
                  <td className="text-end">{item.price.toFixed(2)} CHF</td>
                  <td className="text-end">{(item.quantity * item.price).toFixed(2)} CHF</td>
                  <td className="text-center">
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => onRemoveAll?.(item.id)}
                      title="Видалити продукт"
                    >
                      <Trash size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
              <tr className="table-active">
                <td colSpan="3" className="text-end fw-bold">Total:</td>
                <td className="text-end fw-bold fs-5">{totalPrice.toFixed(2)} CHF</td>
                <td></td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div> */}
      
      {/* Mobile view - Simple list with quantity controls */}
      <div >
        <div className="cart-items-mobile flex-row">
          {items.map(item => (
            <div key={item.id} className="cart-item-mobile d-flex flex-row justify-content-between align-items-center mb-3">
              <div className="cart-item-info text-start">
                <div className="product-name">{item.name}</div>
                <div className="product-description">{item.description || ""}</div>
                {item.weight && <div className="product-quantity">{item.weight}</div>}
              </div>
              
              <div className="cart-item-controls">
                <div className="quantity-selector mx-5">
                  <button 
                    className="quantity-btn"
                    onClick={() => onRemove?.(item.id)}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => onAdd?.(item.id)}
                  >
                    +
                  </button>
                </div>
                
                <div className="item-price">
                  {(item.quantity * item.price).toFixed(0)} CHF
                </div>
              </div>
            </div>
          ))}
          
          <div className="cart-total">
            <span>Усього:</span>
            <span className="total-price">{totalPrice.toFixed(2)} CHF</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartProducts;