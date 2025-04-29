import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../config';
import { apiClient } from '../utils/api';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from 'react-bootstrap/Card';
import Image from "react-bootstrap/Image";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Carousel from 'react-bootstrap/Carousel';
import { CartContext } from '../context/CartContext';
import { Alert, Spinner } from 'react-bootstrap';
import Recomendations from "./Recomendations";
import './ProductDetails.css';

const ProductDetails = () => {
    const { t } = useTranslation(['common', 'product']);
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showGallery, setShowGallery] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
    
    const quantity = cartItems.find((item) => item?.id === parseInt(id))?.quantity || 0;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await apiClient.get(`/products/${id}`);
                if (!data) {
                    throw new Error(t('errors.notFound'));
                }
                setProduct(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching product:', err);
                setError(err.message || 'Failed to load product details');
                if (err.message.includes('404')) {
                    setTimeout(() => navigate('/'), 3000);
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }

        return () => {
            // Cleanup
            setProduct(null);
            setError(null);
        };
    }, [id, navigate]);

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <Spinner animation="border" aria-label={t('general.loading')} />
            </Container>
        );
    }

    if (error || !product) {
        return (
            <Container>
                <div className="text-center my-5">
                    <Alert variant="danger">
                        {error || t('errors.notFound')}
                        <br />
                        <small>{t('errors.general')}</small>
                    </Alert>
                    <Link to="/" className="btn btn-primary mt-3">
                        {t('backToHome')}
                    </Link>
                </div>
            </Container>
        );
    }

    // Only process images if product exists and has images
    const mainImage = getImageUrl(product.image);
    const additionalImages = product.images?.map(img => getImageUrl(img)) || [];
    const allImages = [mainImage, ...additionalImages].filter(Boolean);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product);
        }
    };

    const handleRemoveFromCart = () => {
        if (product) {
            removeFromCart(product.id);
        }
    };



    return (
        <div>
            <Container className="my-4">
                <div className='mb-3' style={{ textAlign: 'start' }}>
                    <Link to="/" className="custom-link">{t('backToHome')}</Link> &gt; {product.name}
                </div>
                <Row>
                    <Col md={8}>
                        <Card>
                            <Card.Img
                                src={mainImage}
                                alt={product.name}
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    setSelectedImageIndex(0);
                                    setShowGallery(true);
                                }}
                            />
                            
                            {/* {additionalImages.length > 0 && (
                                <div className="d-flex mt-3 gap-2 p-2 overflow-auto">
                                    {allImages.map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt={`${product.name} ${index + 1}`}
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                objectFit: 'cover',
                                                cursor: 'pointer',
                                                border: selectedImageIndex === index ? '2px solid #007bff' : 'none'
                                            }}
                                            onClick={() => {
                                                setSelectedImageIndex(index);
                                                setShowGallery(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            )} */}
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="mb-4" style={{ border: 'none', textAlign: 'start' }}>
                        <Card.Body>
                        <Card.Title className="text-dark">{product.name}</Card.Title>
                        <Card.Text className="text-muted d-flex justify-content-between align-items-center">
                            <span>{product.price} CHF / {product.weight}</span>
                            <div className="cart-controls">
                                {quantity === 0 ? (
                                    <Button 
                                        variant="light" 
                                        className="cart-button-round-det" 
                                        onClick={handleAddToCart}
                                        aria-label={t('product.add_to_cart')}
                                    >
                                        <Image 
                                            src="/assets/cart.png" 
                                            roundedCircle 
                                            style={{ width: '25px', height: '25px', marginRight: '3px' }} 
                                        />
                                        <span>{t('product.add_to_cart', { ns: 'product' })}</span>
                                    </Button>
                                ) : (
                                    <div className="quantity-controls-det">
                                        <Button 
                                            variant="light" 
                                            className="quantity-button-det"
                                            onClick={handleRemoveFromCart}
                                            aria-label={`${t('general.quantity')} -1`}
                                        >
                                            -
                                        </Button>
                                        <span className="quantity-display-det">{quantity}</span>
                                        <Button 
                                            variant="light" 
                                            className="quantity-button-det"
                                            onClick={handleAddToCart}
                                        >
                                            +
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card.Text>
                    </Card.Body>
                        </Card>

                        <Card className="mb-4" style={{ backgroundColor: '#94c4d8', textAlign: 'start', borderRadius: '15px' }}>
                            <Card.Body>
                                <Card.Title>{t('product.composition', { ns: 'product' })}</Card.Title>
                                <Card.Text>
                                    <p>{product.descriptionFull}</p>
                                    {product.assortment && product.assortment.length > 0 && (
                                        <div>
                                            <h5>{t('product.assortment', { ns: 'product' })}</h5>
                                            <ul>
                                                {product.assortment.map((item, index) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    <h5>{t('product.storage', { ns: 'product' })}:</h5>
                                    <p>{product.umovy}</p>
                                </Card.Text>
                            </Card.Body>
                        </Card>

                        <Card className="mb-4" style={{ backgroundColor: '#e9e6e3', textAlign: 'start', borderRadius: '15px' }}>
                            <Card.Body>
                                <Card.Title>{t('product.recipe', { ns: 'product' })}</Card.Title>
                                <Card.Text>{product.recipe}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modal with the carousel */}
            <Modal 
                show={showGallery} 
                onHide={() => setShowGallery(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>{product.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Carousel 
                        activeIndex={selectedImageIndex}
                        onSelect={setSelectedImageIndex}
                        interval={null}
                    >
                        {allImages.map((img, index) => (
                            <Carousel.Item key={index}>
                                <img
                                    className="d-block w-100"
                                    src={getImageUrl(img)}
                                    alt={`${product.name} ${index + 1}`}
                                    style={{ 
                                        maxHeight: '70vh',
                                        objectFit: 'contain',
                                        backgroundColor: '#f8f9fa'
                                    }}
                                />
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </Modal.Body>
            </Modal>

            <Container>
                <h4 className="text-start pt-3">
                    {t('product.recommendations', { ns: 'product' })}
                </h4>
            </Container>
            <Recomendations />
        </div>
    );
}

export default ProductDetails;