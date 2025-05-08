import React, { useState, useEffect, useContext, useRef } from 'react';
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
import { useAnimation } from '../context/AnimationContext';
import { Alert, Spinner } from 'react-bootstrap';
import Recomendations from "./Recomendations";
import './ProductDetails.css';
import './Animation.css';

const ProductDetails = () => {
    const { t } = useTranslation(['common', 'product']);
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showGallery, setShowGallery] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [modalImageIndex, setModalImageIndex] = useState(0);
    const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
    const { triggerAnimation } = useAnimation();
    const [imageError, setImageError] = useState(false);
    const buttonRef = useRef(null);
    // Reference to the carousel container
    const carouselRef = useRef(null);

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
    const allImages = [ ...additionalImages].filter(Boolean);

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
            
            // IMPORTANT: Make sure we're passing a valid URL for the image
            // Always use main product image for consistency
            const mainImageUrl = product.image ? 
                getImageUrl(product.image) : 
                '/assets/default-product.png';
            
            console.log('Animation image URL:', mainImageUrl); // Debug log
            
            // Trigger animation with valid image URL
            triggerAnimation(mainImageUrl, product.id, sourcePosition, targetPosition);
            
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

    // Open modal on image click, but not when clicking controls
    const handleImageClick = (e) => {
        // Check if the click is on a carousel control
        const target = e.target;
        const isControlClick =
            target.classList.contains('carousel-control-prev') ||
            target.classList.contains('carousel-control-next') ||
            target.classList.contains('carousel-control-prev-icon') ||
            target.classList.contains('carousel-control-next-icon') ||
            target.classList.contains('carousel-indicators') ||
            target.tagName === 'BUTTON' ||
            target.parentElement.tagName === 'BUTTON';

        // Only open modal if not clicking on controls
        if (!isControlClick) {
            setShowGallery(true);
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
                            {/* Product image carousel */}
                            <div
                                className="product-image-carousel"
                                ref={carouselRef}
                            >
                                <Carousel
                                    activeIndex={selectedImageIndex}
                                    onSelect={setSelectedImageIndex}
                                    interval={null}
                                    indicators={allImages.length > 1}
                                    controls={allImages.length > 1}
                                >
                                    {allImages.map((img, index) => (
                                        <Carousel.Item key={index}>
                                            <div
                                                className="carousel-image-container"
                                                onClick={handleImageClick}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <img
                                                    className="d-block w-100"
                                                    src={img}
                                                    alt={`${product.name} ${index + 1}`}
                                                    style={{
                                                        objectFit: 'cover',
                                                        height: '400px',
                                                    }}
                                                    onError={handleImageError}
                                                />
                                            </div>
                                        </Carousel.Item>
                                    ))}
                                </Carousel>
                            </div>


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
                                                ref={buttonRef}
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
                                                    ref={buttonRef}
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
  onShow={() => setModalImageIndex(selectedImageIndex)} // Sync initial position
  className="product-gallery-modal" // Add custom class for styling
>
  <Modal.Header closeButton>
    <Modal.Title>{product.name}</Modal.Title>
  </Modal.Header>
  <Modal.Body className="fixed-height-modal-body">
    <Carousel
      activeIndex={modalImageIndex}
      onSelect={setModalImageIndex}
      interval={null}
      className="gallery-carousel"
    >
      {allImages.map((img, index) => (
        <Carousel.Item key={index}>
          <div className="fixed-image-container">
            <img
              className="gallery-image"
              src={img}
              alt={`${product.name} ${index + 1}`}
              onError={handleImageError}
            />
          </div>
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