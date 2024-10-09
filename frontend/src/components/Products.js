import Col from "react-bootstrap/esm/Col";
import products from "../data/products.json";
import ProductCard from "./ProductCard";
import Row from "react-bootstrap/esm/Row";
import Container from "react-bootstrap/esm/Container";

const Products = () => {
    return (
        <Container id='products' fluid>
            <Row>
                {products.map((product) => (
                    <Col
                        key={product.id}
                        xs={12}    // 1 card on screens up to 576px (vertical phone)
                        sm={6}     // 2 cards on screens from 576px to 767px (horizontal phone)
                        md={4}     // 3 cards on screens from 768px to 991px (tablet)
                        lg={3}     // 4 cards on screens from 992px and above (desktop)
                        className="d-flex justify-content-center align-items-center p-3"
                    >
                        <ProductCard product={product} />
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default Products;
