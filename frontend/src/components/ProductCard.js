import React, { useContext, useState } from 'react';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import { CartContext } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
    const [imageError, setImageError] = useState(false);
    const quantity = cartItems.find((item) => item.id === product.id)?.quantity || 0;

    
    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        
        const cleanPath = path.replace(/^\/uploads\//, '');
        return `${process.env.REACT_APP_API_URL}/uploads/${cleanPath}`;
    };

    // URL image default
    const defaultImageUrl = '/assets/default-product.png'; 

    const handleAddToCart = () => {
        addToCart(product);
    };

    const handleRemoveFromCart = () => {
        removeFromCart(product.id);
    };

    const handleImageError = () => {
        console.log('Image load error for product:', product.id);
        setImageError(true);
    };

    // Final image URL 
    const imageUrl = imageError ? defaultImageUrl : getImageUrl(product.image);

    return (
        <Card style={{ backgroundColor: '#95c2d7', borderRadius: '20px' }} className="h-100 d-flex flex-column">
            <Link to={`/products/${product.id}`}>
                <Card.Img
                    variant="top"
                    src={imageUrl}
                    style={{ 
                        borderTopLeftRadius: '20px', 
                        borderTopRightRadius: '20px',
                        height: '250px', 
                        objectFit: 'cover' 
                    }}
                    onError={handleImageError}
                />
            </Link>
            <Card.Body className="d-flex flex-column">
                <div>
                    <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'black' }}>
                        <Card.Title className="text-start">{product.name}</Card.Title>
                    </Link>
                    <Card.Text className="text-white text-start mb-4">
                        {product.description}
                    </Card.Text>
                </div>
                <div className="flex-grow-1"></div>
                <div>
                    <div className="d-flex justify-content-between align-items-center">
                        <Card.Text className="text-dark mb-0 text-price">
                            {product.price} CHF / {product.weight}
                        </Card.Text>
                        {quantity === 0 ? (
                            <Button 
                                variant="light" 
                                className="cart-button-round" 
                                onClick={handleAddToCart}
                            >
                                <Image 
                                    src="/assets/cart.png" 
                                    roundedCircle 
                                    style={{ width: '25px', height: '25px', marginRight: '3px' }} 
                                />
                                <span>До кошика</span>
                            </Button>
                        ) : (
                            <div className="quantity-controls">
                                <Button 
                                    variant="light" 
                                    className="quantity-button"
                                    onClick={handleRemoveFromCart}
                                >
                                    -
                                </Button>
                                <span className="quantity-display">{quantity}</span>
                                <Button 
                                    variant="light" 
                                    className="quantity-button"
                                    onClick={handleAddToCart}
                                >
                                    +
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;