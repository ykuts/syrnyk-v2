import React, { useContext } from 'react';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import Image from 'react-bootstrap/esm/Image';
import Button from 'react-bootstrap/Button';
import { CartContext } from '../context/CartContext'; 
import './ProductCards.css'; // Assuming you have a CSS file for styling

/**
 * Product card component for recommendations section
 * With consistent styling to match main product cards
 */
const ProductCardRec = ({ product }) => {
    // Get cart context functions and state
    const { 
      cartItems, 
      addToCart, 
      removeFromCart, 
      addOneToCart 
    } = useContext(CartContext);
    
    // Check if product is in cart and get quantity
    const cartItem = cartItems.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    return (
        <Card className="product-card-rec">
            <Link to={`/products/${product.id}`}>
                <Card.Img
                    variant="top"
                    src={product.image}
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
                            type="button"
                            className="cart-button-round"
                            onClick={() => addToCart(product)}
                        >
                            <Image
                                src="/assets/cart.png"
                                roundedCircle
                                style={{ width: '25px', height: '25px', marginRight: '3px' }}
                            />
                            <span>До кошика</span>
                        </button>
                    ) : (
                        // Show quantity controls when product is in cart
                        <div className="quantity-controls">
                            <Button 
                                variant="light" 
                                className="quantity-button"
                                onClick={() => removeFromCart(product.id)}
                            >
                                -
                            </Button>
                            <span className="quantity-display">{quantity}</span>
                            <Button 
                                variant="light" 
                                className="quantity-button"
                                onClick={() => addOneToCart(product.id)}
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