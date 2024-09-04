import { Link, useParams } from "react-router-dom";
import products from '../data/products.json';
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Card from 'react-bootstrap/Card';
import Image from "react-bootstrap/esm/Image";
import Nav from 'react-bootstrap/Nav';
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
                <div className='mb-3' style={{ textAlign: 'start', }}>
                    <Link to="/" className="custom-link">На головну</Link> &gt; {product.title}
                </div>
                <Row>
                    <Col md={8} >
                        <Card >
                            <Card.Img src={product.image} alt="Голубці з м'ясом" />

                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="mb-4" style={{ border: 'none', textAlign: 'start' }} >
                            <Card.Body>
                                <Card.Title className="text-dark">{product.title}</Card.Title>
                                <Card.Text className="text-muted d-flex justify-content-between align-items-center">
                                    <span>{product.price} CHF / {product.weight}</span>
                                    <Nav.Link eventKey={2} href="#cart" className="p-0">
                                        <button className="custom-button" style={{ display: 'flex', alignItems: 'center' }}>
                                            <Image
                                                src="/assets/cart.png"
                                                roundedCircle
                                                style={{ width: '30px', height: '30px', marginRight: '8px' }}
                                            />
                                            До кошика
                                        </button>
                                    </Nav.Link>
                                </Card.Text>


                            </Card.Body>
                        </Card>
                        <Card className="mb-4" style={{ backgroundColor: '#94c4d8', textAlign: 'start', borderRadius: '15px' }}>

                            <Card.Body>
                                <Card.Title>Склад</Card.Title>
                                <Card.Text>
                                    <p>{product['description-full']}</p>
                                    {product.assortment && product.assortment.length > 0 && (
                                        <div>
                                        <h5>Асортимент</h5>
                                        <ul>
                                            {product.assortment.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                        </div>
                                    )}
                                    <h5>Період та умови зберігання:</h5>
                                    <p>{product.umovy}</p>
                                </Card.Text>

                            </Card.Body>
                        </Card>
                        <Card className="mb-4" style={{ backgroundColor: '#e9e6e3', textAlign: 'start', borderRadius: '15px' }}>

                            <Card.Body>

                                <Card.Title>РЕЦЕПТ</Card.Title>
                                <Card.Text>
                                    {product.recipe}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <Container>
            <h4 className="text-start pt-3">
                Вам також сподобається
            </h4>
            </Container>
             <Recomendations />
        </div>
    );
}

export default ProductDetails;