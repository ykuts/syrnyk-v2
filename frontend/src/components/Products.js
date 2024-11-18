import React, { useState, useEffect } from 'react';
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import Container from "react-bootstrap/esm/Container";
import ProductCard from "./ProductCard";
import { Alert, Spinner } from 'react-bootstrap';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/products');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                // Обрабатываем данные перед установкой в состояние
                const processedProducts = data.map(product => ({
                    ...product,
                    image: product.image || null // Убеждаемся, что у нас нет undefined
                }));
                
                setProducts(processedProducts);
                setError(null);
            } catch (err) {
                setError('Failed to load products. Please try again later.');
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert variant="danger">
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container id='products' fluid>
            <Row>
                {products.map((product) => (
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
                ))}
            </Row>
        </Container>
    );
};

export default Products;