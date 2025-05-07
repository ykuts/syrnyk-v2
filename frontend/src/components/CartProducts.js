import React, { useContext } from 'react';
import { Trash } from 'lucide-react';
import './CartProducts.css';
import { CartContext } from '../context/CartContext';

/**
 * CartProducts component with responsive design optimized for mobile
 * With updated blue color theme (#94c4d8)
 */
const CartProducts = ({ items }) => {
  const {
    addOneToCart,
    removeFromCart,
    removeAllFromCart,
    totalPrice
  } = useContext(CartContext);

  // Prevent event propagation to avoid form submission
  const handleButtonClick = (e, callback) => {
    e.preventDefault(); // Prevent the default button behavior
    e.stopPropagation(); // Stop event bubbling
    callback();
  };

  return (
    <div className="mb-5">
      <h2 className="h4 mb-4">Ваші продукти</h2>
      
      <div className="cart-items-mobile flex-row">
        {items.map(item => (
          <div key={item.id} className="cart-item-mobile d-flex flex-row justify-content-between align-items-center mb-3">
            <div className="cart-item-info text-start">
              <div className="product-name">{item.name}</div>
              {item.description && <div className="product-description">{item.description}</div>}
              {item.weight && <div className="product-quantity">{item.weight}</div>}
            </div>
            
            <div className="cart-item-controls">
              <div className="quantity-selector mx-5" style={{  borderColor: '#94c4d8' }}>
                <button 
                  type="button"
                  className="quantity-btn"
                  onClick={(e) => handleButtonClick(e, () => removeFromCart(item.id))}
                  disabled={item.quantity <= 1}
                  aria-label="Decrease quantity"
                  style={{ color: 'black' }}
                >
                  −
                </button>
                <span className="quantity-value" style={{ color: 'black' }}>{item.quantity}</span>
                <button 
                  type="button"
                  className="quantity-btn"
                  onClick={(e) => handleButtonClick(e, () => addOneToCart(item.id))}
                  aria-label="Increase quantity"
                  style={{ color: 'black' }}
                >
                  +
                </button>
              </div>
              
              <div className="item-price">
                {(item.quantity * item.price).toFixed(2)} CHF
              </div>
              
              <button
                type="button"
                className="remove-btn"
                onClick={(e) => handleButtonClick(e, () => removeAllFromCart(item.id))}
                aria-label="Remove item"
                style={{ background: 'none', border: 'none', color: '#black' }}
              >
                <Trash size={16} />
              </button>
            </div>
          </div>
        ))}
        
        <div className="cart-total" style={{ borderTop: '2px solid #94c4d8' }}>
          <span>Усього:</span>
          <span className="total-price" style={{ color: 'black', fontWeight: 'bold' }}>
            {totalPrice.toFixed(2)} CHF
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartProducts;