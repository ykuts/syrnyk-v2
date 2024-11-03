import { useState, useEffect, useContext } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Image from 'react-bootstrap/esm/Image';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom'; 
import LoginForm from './LoginForm';
import '../custom.scss';
import { CartContext } from '../context/CartContext';

const Menu2 = () => {
    const { t, i18n } = useTranslation();
    const [selectedValue, setSelectedValue] = useState('');

    const [showLogin, setShowLogin] = useState(false); // to display Modal


    const { cartItems, removeFromCart, totalPrice, addOneToCart, removeAllFromCart } = useContext(CartContext);
    const [showCart, setShowCart] = useState(false);

    const handleCloseCart = () => setShowCart(false);

    const navigate = useNavigate(); // Хук для навигации

    const handleCheckout = () => {
        // Закрываем модальное окно корзины
        setShowCart(false);
        // Перенаправляем на страницу оформления заказа
        navigate('/checkout');
    };


    useEffect(() => {
        // Set default language
        i18n.changeLanguage('ua');
    }, [i18n]);

    const handleChange = (event) => {
        const newLanguage = event.target.value;
        setSelectedValue(newLanguage);
        i18n.changeLanguage(newLanguage);
    };

    return (
        <>
            <Navbar collapseOnSelect expand="lg" className="justify-content-between">
                <Container fluid>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav"
                        style={{ border: 'none', boxShadow: 'none', outline: 'none' }} />

                    <Nav className='icons ms-auto d-flex flex-row align-self-start order-lg-4' id='nav-account'>
                        <Nav.Link className='p-2'>
                            <button className="custom-button round-button" onClick={() => setShowLogin(true)}>
                                <Image src="/assets/account.png" roundedCircle
                                    style={{ width: '30px', height: '30px' }} />
                                <span className="profile-text">{t('buttons.profile')}</span>
                            </button>
                        </Nav.Link>
                        <Nav.Link eventKey={2} onClick={() => setShowCart(true)}>
                            <button className="custom-button round-button">
                                <Image src="/assets/cart.png" roundedCircle style={{ width: '30px', height: '30px' }} />
                                <span className="profile-text">{t('buttons.cart')} ({cartItems.length})</span>
                            </button>
                        </Nav.Link>
                    </Nav>

                    <Navbar.Collapse id="responsive-navbar-nav" className='align-items-baseline'>
                        <Nav className='links mx-auto order-lg-3 flex-column'>
                            <Row className="justify-content-md-center">
                                <Col md="auto">
                                    <Nav.Link href="/" className="text-center">
                                        {t('menu.menu_top')}
                                    </Nav.Link>
                                </Col>
                                <Col md="auto">
                                    <Nav.Link href="#delivery" className="text-center">
                                        {t('menu.delivery')}
                                    </Nav.Link>
                                </Col>
                                <Col md="auto">
                                    <Nav.Link href="#about" className="text-center">
                                        {t('menu.about_us')}
                                    </Nav.Link>
                                </Col>
                            </Row>
                            <Row className="d-none d-lg-block">
                                <Col md="auto">
                                    <Image src="/assets/logo2.png" alt="logo" fluid className='logo-header' />
                                </Col>
                            </Row>
                        </Nav>

                        <Nav className='select-lg d-flex flex-row justify-content-center order-lg-1'>
                            <Nav.Link href="https://www.instagram.com/syrnyk.ch">
                                <Image src="/assets/facebook.png" style={{ width: '40px', height: '40px' }} />
                            </Nav.Link>
                            <Nav.Link href="https://www.instagram.com/syrnyk.ch">
                                <Image src="/assets/instagram.png" style={{ width: '40px', height: '40px' }} />
                            </Nav.Link>
                        </Nav>

                        <Nav className='select-lg me-auto order-lg-2 d-flex justify-content-center align-items-center'>
                            <Form.Select value={selectedValue} onChange={handleChange} style={{ width: 'auto' }} className="text-center">
                                <option value="ua">UA</option>
                                <option value="en">EN</option>
                                <option value="fr">FR</option>
                            </Form.Select>
                        </Nav>
                    </Navbar.Collapse>
                    <Row className="d-lg-none">
                        <Col md="auto">
                            <Image src="/assets/logo2.png" alt="logo" fluid className='logo-header' />
                        </Col>
                    </Row>
                </Container>
            </Navbar>


            {/* Modal for Shopping Cart */}
            <Modal show={showCart} onHide={handleCloseCart}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('buttons.cart')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {cartItems.length === 0 ? (
                        <p>{t('cart.empty')}</p>
                    ) : (
                        <ListGroup>
                            {cartItems.map(item => (
                                <ListGroup.Item key={item.id}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5>{item.title}</h5>
                                            <p>{item.price} CHF x {item.quantity}</p>
                                        </div>
                                        <div>
                                            <Button variant="light" onClick={() => removeFromCart(item.id)}>-</Button>
                                            <span className="mx-2">{item.quantity}</span>
                                            <Button variant="light" onClick={() => addOneToCart(item.id)}>+</Button>
                                            <Button variant="danger" className="ml-2" onClick={() => removeAllFromCart(item.id)}>
                                                {t('cart.remove')}
                                            </Button>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <h5>{t('cart.total')}: {totalPrice.toFixed(2)} CHF</h5>
                    {/* <h5>{totalItems}</h5> */}
                    <Button variant="success" 
                        onClick={handleCheckout}
                        disabled={cartItems.length === 0}>
                            {t('cart.checkout')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for Login form */}
            <Modal show={showLogin} onHide={() => setShowLogin(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Увійти</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <LoginForm closeModal={() => setShowLogin(false)} />
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Menu2;
