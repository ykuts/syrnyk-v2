import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Image from 'react-bootstrap/esm/Image';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom'; 
import { LogOut } from "lucide-react";
import '../custom.scss';
import { useAuth } from '../context/AuthContext';
import './CartNavItem.css';
import './Menu2.css';
import LoginModal from './LoginModal';
import CustomLanguageDropdown from './CustomLanguageDropdown';
import CartDropdown from './CartDropdown';

const Menu2 = () => {
    const [isSticky, setIsSticky] = useState(false);
    const { t } = useTranslation(['common', 'menu']);
    const { user, logout } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const navigate = useNavigate(); 

    // Handle scroll for sticky navbar
    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            setIsSticky(offset > 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Set default language
    /* useEffect(() => {
        i18n.changeLanguage('uk');
    }, [i18n]); */

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Profile Button Component
    const ProfileButton = () => {
        const navigate = useNavigate();
            
        if (!user) {
            return (
                <button className="custom-button round-button" onClick={() => setShowLogin(true)}>
                    <Image 
                        src="/assets/account.png" 
                        roundedCircle
                        style={{ width: '24px', height: '24px' }} 
                    />
                    <span className="profile-text">{t('buttons.profile', { ns: 'common' })}</span>
                </button>
            );
        }
    
        return (
            <Dropdown className="position-relative">
                <Dropdown.Toggle 
                    as="div" 
                    className="custom-button round-button d-flex align-items-center"
                >
                    <Image 
                        src="/assets/account-logged.png" 
                        roundedCircle
                        style={{ width: '24px', height: '24px' }} 
                    />
                    <span className="profile-text ms-2">{user.firstName}</span>
                </Dropdown.Toggle>
    
                <Dropdown.Menu className="position-absolute">
                    {user.role === 'CLIENT' ? (
                        <>
                            <Dropdown.Item onClick={() => navigate('/client')}>
                                {t('menu.profile', { ns: 'menu' })}
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/orders')}>
                                {t('menu.orders', { ns: 'menu' })}
                            </Dropdown.Item>
                        </>
                    ) : (
                        <>
                            <Dropdown.Item onClick={() => navigate('/admin/orders')}>
                                {t('menu.admin', { ns: 'menu' })}
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/admin/customers')}>
                                {t('menu.customers', { ns: 'menu' })}
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/admin/products')}>
                                {t('menu.products', { ns: 'menu' })}
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/admin/delivery')}>
                                {t('menu.delivery', { ns: 'menu' })}
                            </Dropdown.Item>
                        </>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-primary">
                        <LogOut size={16} className="me-2" />
                        {t('menu.logout', { ns: 'menu' })}
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        );
    };

    return (
        <>
            <Navbar 
                collapseOnSelect 
                expand="lg" 
                className={`justify-content-between ${isSticky ? 'sticky-navbar' : ''}`}
            >
                <Container fluid className="mobile-container">
                    <Navbar.Toggle 
                        aria-controls="responsive-navbar-nav"
                        className="mobile-toggle"
                    />

                    <Nav className='icons ms-auto d-flex flex-row align-self-start order-lg-4' id='nav-account'>
                        <div className='p-2'>
                            <ProfileButton />
                        </div>
                        <CartDropdown />
                    </Nav>

                    <Navbar.Collapse id="responsive-navbar-nav" className='align-items-baseline nav-collapse'>
                        <Nav className='links mx-auto order-lg-3 flex-column'>
                            <Row className="justify-content-md-center">
                                <Col md="auto">
                                    <Nav.Link href="/" className="text-center">
                                        {t('menu.menu_top', { ns: 'menu' })}
                                    </Nav.Link>
                                </Col>
                                <Col md="auto">
                                    <Nav.Link href="/delivery" className="text-center">
                                        {t('menu.delivery', { ns: 'menu' })}
                                    </Nav.Link>
                                </Col>
                                <Col md="auto">
                                    <Nav.Link href="/aboutus" className="text-center">
                                        {t('menu.about_us', { ns: 'menu' })}
                                    </Nav.Link>
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

                        <Nav className='custom-language-dropdown select-lg order-lg-2 d-flex justify-content-center align-items-center'>
                            <CustomLanguageDropdown />
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <LoginModal 
                show={showLogin} 
                onHide={() => setShowLogin(false)}
            />
        </>
    );
};

export default Menu2;