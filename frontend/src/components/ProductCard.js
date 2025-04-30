// src/components/ProductCard.js
import React, { useContext, useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../context/CartContext';
import { getImageUrl } from '../config';
import './ProductCards.css';

const ProductCard = ({ product }) => {
    const { t, i18n } = useTranslation(['common', 'product']);
    const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
    const [imageError, setImageError] = useState(false);
    const [translatedProduct, setTranslatedProduct] = useState(product);
    const quantity = cartItems.find((item) => item.id === product.id)?.quantity || 0;

    // Update translated product when language or product changes
    useEffect(() => {
        // If product has translations for current language, use them
        if (product?.translations && product.translations[i18n.language]) {
            const translation = product.translations[i18n.language];
            setTranslatedProduct({
                ...product,
                name: translation.name || product.name,
                description: translation.description || product.description,
                weight: translation.weight || product.weight
            });
        } else {
            // Otherwise use original product data
            setTranslatedProduct(product);
        }
    }, [product, i18n.language]);

    // Default image URL
    const defaultImageUrl = '/assets/default-product.png'; 

    const handleAddToCart = () => {
        addToCart(translatedProduct); // Use translated version
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
        <Card style={{ backgroundColor: '#95c2d7', borderRadius: '20px' }} className="h-100 d-flex flex-column product-card">
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
                    alt={translatedProduct.name}
                />
            </Link>
            <Card.Body className="d-flex flex-column">
                <div>
                    <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'black' }}>
                        <Card.Title className="text-start">{translatedProduct.name}</Card.Title>
                    </Link>
                    <Card.Text className="text-white text-start mb-4">
                        {translatedProduct.description}
                    </Card.Text>
                </div>
                <div className="flex-grow-1"></div>
                <div>
                    <div className="d-flex justify-content-between align-items-center">
                        <Card.Text className="text-dark mb-0 text-price">
                            {product.price} CHF / {translatedProduct.weight}
                        </Card.Text>
                        {quantity === 0 ? (
                            <Button 
                                variant="light" 
                                className="cart-button-round" 
                                onClick={handleAddToCart}
                                aria-label={`${t('product.add_to_cart')} ${translatedProduct.name}`}
                            >
                                <Image 
                                    src="/assets/cart.png" 
                                    roundedCircle 
                                    style={{ width: '25px', height: '25px', marginRight: '3px' }} 
                                />
                                <span>{t('product.add_to_cart', { ns: 'product' })}</span>
                            </Button>
                        ) : (
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
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;