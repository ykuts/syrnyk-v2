import { useState, useEffect, useContext } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Image from 'react-bootstrap/esm/Image';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom'; 
import LoginForm from './LoginForm';
import '../custom.scss';
import { useAuth } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Trash, User, Package, Box, LogOut, Settings, Truck, SquareUserRound } from "lucide-react";
import './CartNavItem.css';
import './Menu2.css';

const Menu2 = () => {
    const [isSticky, setIsSticky] = useState(false);
    const { t, i18n } = useTranslation();
    const [selectedValue, setSelectedValue] = useState('');
    const { user, logout } = useAuth();

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

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            setIsSticky(offset > 100); // меняем состояние когда скролл больше 100px
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const [isHidden, setIsHidden] = useState(false);
let lastScroll = 0;

useEffect(() => {
    const handleScroll = () => {
        const currentScroll = window.scrollY;
        setIsSticky(currentScroll > 100);
        
        // Скрываем меню при скролле вниз и показываем при скролле вверх
        if (currentScroll > lastScroll && !isHidden && currentScroll > 300) {
            setIsHidden(true);
        } else if (currentScroll < lastScroll && isHidden) {
            setIsHidden(false);
        }
        lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
}, [isHidden]);

    useEffect(() => {
        // Set default language
        i18n.changeLanguage('ua');
    }, [i18n]);

    const handleChange = (event) => {
        const newLanguage = event.target.value;
        setSelectedValue(newLanguage);
        i18n.changeLanguage(newLanguage);
    };


    const ProfileButton = () => {
        const navigate = useNavigate();
        const { t } = useTranslation();
    
        if (!user) {
            return (
                <button className="custom-button round-button" onClick={() => setShowLogin(true)}>
                    <Image src="/assets/account.png" roundedCircle
                        style={{ width: '30px', height: '30px' }} />
                    <span className="profile-text">{t('buttons.profile')}</span>
                </button>
            );
        }
    
        return (
            <Dropdown className="position-relative">
                <Dropdown.Toggle as="div" className="custom-button round-button d-flex align-items-center">
                    <div 
                        className="rounded-circle d-flex align-items-center justify-content-center text-white"
                        style={{
                            width: '30px',
                            height: '30px',
                            fontWeight: '700',
                            fontSize: '16px'
                        }}
                    >
                        {user.firstName[0]}
                    </div>
                    <span className="profile-text ms-2">{user.firstName}</span>
                </Dropdown.Toggle>
    
                <Dropdown.Menu 
                    className="position-absolute" 
                    style={{
                        zIndex: 1000,
                        marginTop: '0.5rem'
                    }}
                >
                    {user.role === 'CLIENT' ? (
                        <>
                            <Dropdown.Item onClick={() => navigate('/client')}>
                                <User size={16} className="me-2" />
                                Профіль
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/orders')}>
                                <Package size={16} className="me-2" />
                                Історія замовлень
                            </Dropdown.Item>
                        </>
                    ) : (
                        <>
                            <Dropdown.Item onClick={() => navigate('/admin/orders')}>
                                <Package size={16} className="me-2" />
                                Управління замовленнями
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/admin/users')}>
                                <SquareUserRound size={16} className="me-2" />
                                Управління клієнтами
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/admin/products')}>
                                <Box size={16} className="me-2" />
                                Управління продуктами
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/admin/delivery')}>
                                <Truck size={16} className="me-2" />
                                Управління доставкою
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/admin/settings')}>
                                <Settings size={16} className="me-2" />
                                Налаштування
                            </Dropdown.Item>
                        </>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                        <LogOut size={16} className="me-2" />
                        Вихід
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        );
    };

    return (
        <>
            <div className={isSticky ? 'navbar-spacer' : ''} />
            <Navbar 
                collapseOnSelect 
                expand="lg" 
                className={`justify-content-between ${isSticky ? 'sticky-navbar' : ''} ${isHidden ? 'hidden' : ''}`}
            >
                <Container fluid>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav"
                        style={{ border: 'none', boxShadow: 'none', outline: 'none' }} />

                    <Nav className='icons ms-auto d-flex flex-row align-self-start order-lg-4' id='nav-account'>
                    <div className='p-2'>
                        
                            <ProfileButton />
                        
                            {/* <button className="custom-button round-button" onClick={() => setShowLogin(true)}>
                                <Image src="/assets/account.png" roundedCircle
                                    style={{ width: '30px', height: '30px' }} />
                                <span className="profile-text">{t('buttons.profile')}</span>
                            </button> */}
                        </div>
                        <Nav.Link eventKey={2} onClick={() => setShowCart(true)}>
                        <div className="cart-icon-container custom-button round-button">
                            <img
                                src="/assets/cart.png"
                                alt="Cart"
                                className="cart-icon"
                            />
                            {cartItems.length > 0 && (
                            <span className="cart-counter">{cartItems.length}</span>
                            )}
                            <span className="cart-text">{t('buttons.cart')}</span>
                            </div>
                            {/* <button className="custom-button round-button">
                                <Image src="/assets/cart.png" roundedCircle style={{ width: '30px', height: '30px' }} />
                                <span className="profile-text">{t('buttons.cart')} ({cartItems.length})</span>
                            </button> */}
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
                                    <Nav.Link href="/delivery" className="text-center">
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
                            <Nav.Link href="https://www.facebook.com/">
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
                    {/* <Row className="d-lg-none">
                        <Col md="auto">
                            <Image src="/assets/logo2.png" alt="logo" fluid className='logo-header' />
                        </Col>
                    </Row> */}
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
                                <h5>{item.name}</h5>
                                <p>{item.price} CHF x {item.quantity}</p>
                            </div>
                            <div>
                                <Button variant="light" onClick={() => removeFromCart(item.id)}>-</Button>
                                <span className="mx-2">{item.quantity}</span>
                                <Button variant="light" onClick={() => addOneToCart(item.id)}>+</Button>
                                <Button 
                                    variant="danger" 
                                    className="ml-2" 
                                    onClick={() => removeAllFromCart(item.id)}
                                >
                                    <Trash size={16} />
                                </Button>
                            </div>
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        )}
    </Modal.Body>
    <Modal.Footer>
        <div className="d-flex justify-content-between w-100">
            <div className='w-30' style={{ width: '30%' }}>
            <Button variant="secondary" onClick={handleCloseCart}>
                {t('cart.continueShopping')}
            </Button>
            </div>

            <div className='w-30' style={{ width: '30%' }}>

                <Button 
                    variant="primery"
                    onClick={handleCheckout}
                    disabled={cartItems.length === 0}
                >
                    {t('cart.checkout')}
                </Button>
            </div>

            <div className="d-flex align-items-center gap-3 flex-column">
                <h5 className="mb-0">{t('cart.total')}: </h5>
                <h6 className="mb-0">{(totalPrice || 0).toFixed(2)}  CHF</h6>
            </div>
            
        </div>
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
