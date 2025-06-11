import React, { useContext } from 'react';
import { Trash } from 'lucide-react';
import './CartProducts.css';
import { CartContext } from '../context/CartContext';
import { useTranslation } from 'react-i18next';

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

  const { t } = useTranslation('checkout');

  // Prevent event propagation to avoid form submission
  const handleButtonClick = (e, callback) => {
    e.preventDefault(); // Prevent the default button behavior
    e.stopPropagation(); // Stop event bubbling
    callback();
  };

  return (
    <div className="mb-5">
      <h2 className="h4 mb-4">{t('cart.title')}</h2>

      <div className="cart-items-mobile flex-row">
        {items.map(item => (
          <div key={item.id} className="cart-item-mobile flex-row justify-content-between align-items-center mb-3">
            <div className="cart-item-info text-start">
              <div className="product-name">{item.name}</div>
              {/* {item.description && <div className="product-description">{item.description}</div>} */}
              {item.weight && <div className="product-quantity">{item.weight}</div>}
            </div>
            
            {/* Bottom row with controls and price */}
            <div className="cart-bottom-row d-flex justify-content-between align-items-center mt-2">
              {/* Left-aligned quantity selector */}
              <div className="quantity-selector" style={{  borderColor: '#94c4d8' }}>
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
              
              {/* Right side with price and remove button */}
              <div className="price-controls d-flex align-items-center">
                <div className="item-price me-3">
                  {(item.quantity * item.price).toFixed(2)} CHF
                </div>
                
                <button
                  type="button"
                  className="remove-btn"
                  onClick={(e) => handleButtonClick(e, () => removeAllFromCart(item.id))}
                  aria-label="Remove item"
                  style={{ background: 'none', border: 'none', color: '#94c4d8' }}
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
            
            {/* Border line */}
            <div className="cart-item-border mt-2"></div>
          </div>
        ))}
        
        <div className="cart-total">
          <span>{t('cart.total')}:</span>
          <span className="total-price" style={{ color: '#black', fontWeight: 'bold' }}>
            {totalPrice.toFixed(2)} CHF
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartProducts;