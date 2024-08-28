import { Link, useParams } from "react-router-dom";
import products from '../data/products.json';
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Card from 'react-bootstrap/Card';
import Button from "react-bootstrap/esm/Button";
import Recomendations from "./Recomendations";

const ProductDetails = () => {
    const { id } = useParams();  
    const product = products.find((p) => p.id === parseInt(id));  

    if (!product) {
        return <h2>Продукт не знайдено</h2>;
    }

    return (
        <div>
            <Container className="my-4">
            <Link to="/">На головну</Link> - {product.title}
            <Row>
                <Col md={8}>
                    <Card>
                        <Card.Img variant="top" src={product.image} alt="Голубці з м'ясом" />
                        <Card.Body>
                            <Card.Title className="text-dark">{product.title}</Card.Title>
                            <Card.Text className="text-muted">
                                {product.price} CHF / {product.weight}
                            </Card.Text>
                            <Button variant="warning">До кошика</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Склад</Card.Title>
                            <Card.Text>
                                {product['description-full']}
                            </Card.Text>
                            <Card.Title>РЕЦЕПТ</Card.Title>
                            <Card.Text>
                                {product.recipe}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
        {/* <Recomendations /> */}
        </div>
    );
}
 
export default ProductDetails;