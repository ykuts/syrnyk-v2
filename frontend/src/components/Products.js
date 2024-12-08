import React, { useState, useEffect } from 'react';
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import Container from "react-bootstrap/esm/Container";
import ProductCard from "./ProductCard";
import { Alert, Spinner } from 'react-bootstrap';

// Define API base URL with fallback
const API_URL = process.env.REACT_APP_API_URL || 'https://syrnyk-v2-production.up.railway.app';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const apiUrl = `${API_URL}/api/products`;
                console.log('Fetching products from:', apiUrl); // For debugging

                const response = await fetch(apiUrl);
                
                // Check content type
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Received non-JSON response from server");
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                // Validate data format
                if (!Array.isArray(data)) {
                    throw new Error('Received invalid data format from server');
                }
                
                // Process data before setting state
                const processedProducts = data.map(product => ({
                    ...product,
                    image: product.image || null, // Ensure no undefined values
                    // Add full URL for images if needed
                    fullImageUrl: product.image ? 
                        (product.image.startsWith('http') ? 
                            product.image : 
                            `${API_URL}/uploads/${product.image}`
                        ) : null
                }));
                
                setProducts(processedProducts);
                setError(null);
            } catch (err) {
                console.error('Error details:', err);
                setError(err.message || 'Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Show loading spinner while fetching data
    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    // Display error message if something went wrong
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
                    // Show message when no products are available
                    <Col className="text-center p-5">
                        <Alert variant="info">
                            No products available at the moment.
                        </Alert>
                    </Col>
                ) : (
                    // Render product cards in a responsive grid
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