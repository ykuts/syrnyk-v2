import React, { useState, useEffect } from 'react';
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import Container from "react-bootstrap/esm/Container";
import ProductCard from "./ProductCard";
import { Alert, Spinner } from 'react-bootstrap';
import { apiClient } from '../utils/api';
import { getImageUrl } from '../config';

const Products = () => {
    const [products, setProducts] = useState([]);
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

                setProducts(processedProducts);
                setError(null);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.message || 'Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Loading state
    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
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
                    <br />
                    <small>Please refresh the page to try again.</small>
                </Alert>
            </Container>
        );
    }

    // Render product grid
    return (
        <Container id='products' fluid>
            <Row>
                {products.length === 0 ? (
                    <Col className="text-center p-5">
                        <Alert variant="info">
                            No products available at the moment.
                        </Alert>
                    </Col>
                ) : (
                    products.map((product) => (
                        <Col
                            key={product.id}
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            className="d-flex justify-content-center align-items-center p-3"
                        >
                            <ProductCard
                                product={product}
                            />
                        </Col>
                    ))
                )}
            </Row>
        </Container>
    );
};

export default Products;