import Row from "react-bootstrap/esm/Row";
import products from "../data/products.json"
import ProductCard from "./ProductCard";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";

const Recomendations = () => {
    return (
        <div >
            <Container>
                <div className='mb-3' style={{ textAlign: 'start', }}>
                    <h3 style={{ marginBottom: '15px' }}>Вам також сподобається</h3>
                    <Row>
                        {products.slice(0, 4).map((product) => {
                            return (
                                <Col key={product.id}>
                                    <ProductCard product={product} />
                                </Col>
                            );
                        })}
                    </Row>
                </div>
            </Container>

        </div>
    );
}

export default Recomendations;