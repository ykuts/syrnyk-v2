import React, { useState, useEffect } from 'react';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import ProductCardRec from "./ProductCardRec";
import { Alert, Spinner } from 'react-bootstrap';
import { apiClient } from '../utils/api';
import { getImageUrl } from '../config';

/**
 * Recommendations component displays random products that the user might like
 * With consistent card widths and layout
 */
const Recommendations = () => {
    const [visibleProducts, setVisibleProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await apiClient.get('/products');

                // Validate data format
                if (!Array.isArray(data)) {
                    throw new Error('Received invalid data format from server');
                }

                // Process data before setting state
                const processedProducts = data.map(product => {
                    // Ensure image URLs are properly constructed
                    const imageUrl = getImageUrl(product.image);
                    const imageUrls = product.images?.map(img => getImageUrl(img)) || [];

                    return {
                        ...product,
                        image: imageUrl,
                        images: imageUrls,
                        fullImageUrl: imageUrl
                    };
                });

                // Get a random selection of products based on screen size
                const randomProducts = getRandomProducts(processedProducts);
                setVisibleProducts(randomProducts);
                setError(null);
            } catch (err) {
                console.error('Error fetching recommended products:', err);
                setError(err.message || 'Failed to load recommendations. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

        // Handle window resize
        const handleResize = () => {
            setVisibleProducts(prev => {
                if (prev.length > 0) {
                    return getRandomProducts(prev);
                }
                return prev;
            });
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Get random products based on screen size
    const getRandomProducts = (products) => {
        if (!Array.isArray(products) || products.length === 0) {
            return [];
        }

        const shuffled = [...products].sort(() => 0.5 - Math.random());
        const width = window.innerWidth;
        
        if (width >= 1200) {
            return shuffled.slice(0, Math.min(4, shuffled.length));
        } else if (width >= 768) {
            return shuffled.slice(0, Math.min(3, shuffled.length));
        } else if (width >= 576) {
            return shuffled.slice(0, Math.min(2, shuffled.length));
        } else {
            return shuffled.slice(0, Math.min(1, shuffled.length));
        }
    };

    // Loading state
    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '150px' }}>
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    // Error state
    if (error) {
        return (
            <Container>
                <Alert variant="danger">
                    {error}
                </Alert>
            </Container>
        );
    }

    // Don't show anything if no products
    if (visibleProducts.length === 0) {
        return null;
    }

    // Render recommendations
    return (
        <div className="py-4 bg-light">
            <Container>
                <h2 className="mb-4">Вам також сподобається</h2>
                <Row className="g-4">
                    {visibleProducts.map((product) => (
                        <Col
                            key={product.id}
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            className="mb-4" // Consistent bottom margin
                        >
                            <ProductCardRec product={product} />
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default Recommendations;