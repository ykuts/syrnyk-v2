import React, { useContext, useState, useEffect } from 'react';
import { Dropdown, Button, Nav } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Trash } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import './CartDropdown.css';

const CartDropdown = () => {
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const { 
    cartItems, 
    removeFromCart, 
    addOneToCart, 
    removeAllFromCart, 
    totalPrice 
  } = useContext(CartContext);

  const handleCheckout = () => {
    setShow(false);
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    setShow(false);
    navigate('/');
  };

  // Handle body scroll lock
  useEffect(() => {
    if (show && window.innerWidth <= 576) {
      document.body.classList.add('cart-open');
    } else {
      document.body.classList.remove('cart-open');
    }
    
    return () => {
      document.body.classList.remove('cart-open');
    };
  }, [show]);

  const handleToggle = (isOpen) => {
    setShow(isOpen);
  };

  return (
    <>
    {/* Add overlay div */}
    {/* <div 
        className={`cart-overlay ${show ? 'show' : ''}`} 
        onClick={() => setShow(false)}
      /> */}
    <Dropdown 
      align="end" 
      show={show} 
      onToggle={handleToggle}
      className="cart-dropdown"
      >
      <Dropdown.Toggle as="div">
        <Nav.Link className="cart-nav-link">
          <div className="cart-icon-container custom-button round-button">
            <img
              src="/assets/cart.png"
              alt={t('buttons.cart')}
              className="cart-icon"
            />
            {cartItems.length > 0 && (
              <span className="cart-counter">{cartItems.length}</span>
            )}
            <span className="cart-text">{t('buttons.cart')}</span>
          </div>
        </Nav.Link>
      </Dropdown.Toggle>

      <Dropdown.Menu className="cart-dropdown-menu">
        <div className="cart-dropdown-header p-3 border-bottom">
          <h5 className="mb-0">{t('buttons.cart')}</h5>
        </div>
        
        <div className="cart-items-container">
          {cartItems.length === 0 ? (
            <div className="p-3 text-center text-muted">
              {t('cart.empty')}
            </div>
          ) : (
            <div>
              {cartItems.map(item => (
                <div key={item.id} className="cart-item p-3 border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-0">{item.name}</h6>
                      <small className="text-muted">
                        {item.price} CHF x {item.quantity}
                      </small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Button 
                        variant="light" 
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                      >
                        -
                      </Button>
                      <span>{item.quantity}</span>
                      <Button 
                        variant="light" 
                        size="sm"
                        onClick={() => addOneToCart(item.id)}
                        aria-label={`Add ${item.name}`}
                      >
                        +
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => removeAllFromCart(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="p-3 border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <strong>{t('cart.total')}:</strong>
                  <strong>{totalPrice.toFixed(2)} CHF</strong>
                </div>
              </div>

              <div className="p-3 d-grid gap-2">
                <Button 
                  variant="primary" 
                  onClick={handleCheckout}
                  className="w-100"
                >
                  {t('cart.checkout')}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={handleContinueShopping}
                  className="w-100"
                >
                  {t('cart.continueShopping')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
    </>
  );
};

export default CartDropdown;