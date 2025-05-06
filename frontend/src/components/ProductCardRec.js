import React, { useContext, useRef, useState } from 'react';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import Image from 'react-bootstrap/esm/Image';
import Button from 'react-bootstrap/Button';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../context/CartContext'; 
import { useAnimation } from '../context/AnimationContext';
import { getImageUrl } from '../config';
import './ProductCards.css'; // Assuming you have a CSS file for styling
import './Animation.css';

/**
 * Product card component for recommendations section
 * With consistent styling to match main product cards
 */
const ProductCardRec = ({ product }) => {
    // Get cart context functions and state
    const { t } = useTranslation(['common', 'product']);
    const { 
      cartItems, 
      addToCart, 
      removeFromCart, 
      addOneToCart 
    } = useContext(CartContext);
    
    // Check if product is in cart and get quantity
    const cartItem = cartItems.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;
    
    const { triggerAnimation } = useAnimation();
    const [imageError, setImageError] = useState(false);
    const buttonRef = useRef(null);

    // Default image URL
    const defaultImageUrl = '/assets/default-product.png'; 

    const handleAddToCart = () => {
            // Get the button element
            const button = buttonRef.current;
            const cartIcon = document.querySelector('.cart-icon-container');
            
            if (cartIcon && button) {
              // Get current positions at the time of the click
              const buttonRect = button.getBoundingClientRect();
              const cartRect = cartIcon.getBoundingClientRect();
              
              // These positions already include scroll position
              const sourcePosition = {
                top: buttonRect.top + window.scrollY,
                left: buttonRect.left + window.scrollX
              };
              
              const targetPosition = {
                top: cartRect.top + window.scrollY,
                left: cartRect.left + window.scrollX
              };
              
              console.log('Animation positions:', { 
                sourcePosition, 
                targetPosition,
                scroll: { x: window.scrollX, y: window.scrollY },
                buttonRect,
                cartRect
              });
              
              // Get product image URL
              const productImgUrl = imageError ? defaultImageUrl : getImageUrl(product.image);
              
              // Trigger animation
              triggerAnimation(productImgUrl, product.id, sourcePosition, targetPosition);
              
              // Add product to cart after a short delay
              setTimeout(() => {
                addToCart(product);
              }, 100);
            } else {
              // Fallback if elements not found
              console.warn('Cart icon or button not found');
              addToCart(product);
            }
        };
        
    
        const handleRemoveFromCart = () => {
            removeFromCart(product.id);
        };

        const handleImageError = () => {
            console.log('Image load error for product:', product.id);
            setImageError(true);
        };

        // Final image URL using centralized handler
            const imageUrl = imageError ? defaultImageUrl : getImageUrl(product.image);

    return (
        <Card className="product-card-rec">
            <Link to={`/products/${product.id}`}>
                <Card.Img
                    variant="top"
                    src={product.image}
                    onError={handleImageError}
                    alt={product.name}
                />
            </Link>
            
            <Card.Body>
                <Link
                    to={`/products/${product.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                >
                    <Card.Title className="text-start">{product.name}</Card.Title>
                </Link>
                
                {/* Price and Add to Cart button */}
                <div className="d-flex justify-content-between align-items-center">
                    <Card.Text className="text-dark mb-0 text-price">
                        {product.price} CHF / {product.weight}
                    </Card.Text>
                    
                    {quantity === 0 ? (
                        // Show "Add to Cart" button when product is not in cart
                        <button 
                            ref={buttonRef}
                            type="button"
                            className="cart-button-round"
                            onClick={handleAddToCart}
                            aria-label={`${t('product.add_to_cart')} ${product.name}`}
                        >
                            <Image
                                src="/assets/cart.png"
                                roundedCircle
                                style={{ width: '25px', height: '25px', marginRight: '3px' }}
                            />
                            <span>{t('product.add_to_cart', { ns: 'product' })}</span>
                        </button>
                    ) : (
                        // Show quantity controls when product is in cart
                        <div className="quantity-controls">
                            <Button 
                                variant="light" 
                                className="quantity-button"
                                onClick={handleRemoveFromCart}
                                aria-label={`${t('general.quantity')} -1`}
                            >
                                -
                            </Button>
                            <span className="quantity-display">{quantity}</span>
                            <Button 
                                ref={buttonRef}
                                variant="light" 
                                className="quantity-button"
                                onClick={handleAddToCart}
                                aria-label={`${t('general.quantity')} +1`}
                            >
                                +
                            </Button>
                        </div>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductCardRec;