import { useState, useEffect } from 'react';
import Row from "react-bootstrap/esm/Row";
import products from "../data/products.json"
import ProductCardRec from "./ProductCardRec";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";

const getRandomProducts = (count) => {
    let shuffled = products.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const handleResize = (setVisibleProducts) => {
    const width = window.innerWidth;
    if (width >= 1200) {
        setVisibleProducts(getRandomProducts(4));
    } else if (width >= 768) {
        setVisibleProducts(getRandomProducts(3));
    } else if (width >= 576) {
        setVisibleProducts(getRandomProducts(2));
    } else {
        setVisibleProducts(getRandomProducts(1));
    }
};

const Recomendations = () => {
    const [visibleProducts, setVisibleProducts] = useState([]);

    useEffect(() => {
        handleResize(setVisibleProducts); // Initial load
        const onResize = () => handleResize(setVisibleProducts);
        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return (
        <Container>
            <Row>
                {visibleProducts.map((product) => (
                    <Col
                        key={product.id}
                        xs={12} sm={6} md={4} lg={3}
                        className="d-flex justify-content-center align-items-center p-3"
                    >
                        <ProductCardRec product={product} />
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default Recomendations;