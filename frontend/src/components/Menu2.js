import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Image from 'react-bootstrap/esm/Image';
import Form from 'react-bootstrap/Form';
import '../custom.scss';
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";


import { useTranslation } from 'react-i18next';


const Menu2 = () => {
    const { t, i18n } = useTranslation();

    const [selectedValue, setSelectedValue] = useState('');

    useEffect(() => {
        // Устанавливаем язык по умолчанию при загрузке компонента
        i18n.changeLanguage('ua');
    }, [i18n]);

    const handleChange = (event) => {
        const newLanguage = event.target.value;
        setSelectedValue(newLanguage);
        i18n.changeLanguage(newLanguage);
    };


    


    return (
        <Navbar collapseOnSelect expand="lg" className="justify-content-between">
            <Container fluid>
                {/* Тоггл для мобильных устройств */}
                <Navbar.Toggle aria-controls="responsive-navbar-nav" 
                style={{ border: 'none', boxShadow: 'none', outline: 'none' }} />
                
                {/* Блок профиля и корзины */}
                <Nav className='icons ms-auto d-flex flex-row align-self-start order-lg-4' id='nav-account'>
                    <Nav.Link href="#signeIn" className='p-2'>
                        <button className="custom-button round-button">
                            <Image src="/assets/account.png" roundedCircle
                                style={{ width: '30px', height: '30px' }} />
                            <span className="profile-text">{t('buttons.profile')}</span>
                        </button>
                    </Nav.Link>
                    <Nav.Link eventKey={2} href="#cart">
                        <button className="custom-button round-button">
                            <Image src="/assets/cart.png" roundedCircle
                                style={{ width: '30px', height: '30px' }} />
                            <span className="profile-text">{t('buttons.cart')}</span>
                        </button>
                    </Nav.Link>
                </Nav>

                {/* Коллапсируемые элементы */}
                <Navbar.Collapse id="responsive-navbar-nav" className='align-items-baseline'>
                    {/* Ссылки в навигации */}
                    <Nav className='links mx-auto  order-lg-3 flex-column '>
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

                    {/* Социальные иконки */}
                    <Nav className='select-lg d-flex flex-row justify-content-center order-lg-1'>
                        <Nav.Link href="https://www.instagram.com/syrnyk.ch">
                            <Image src="/assets/facebook.png"
                                style={{ width: '40px', height: '40px' }} />
                        </Nav.Link>
                        <Nav.Link href="https://www.instagram.com/syrnyk.ch">
                            <Image src="/assets/instagram.png"
                                style={{ width: '40px', height: '40px' }} />
                        </Nav.Link>
                    </Nav>

                    {/* Выбор языка */}
                    <Nav className='select-lg me-auto order-lg-2 d-flex justify-content-center align-items-center'>
                        <Form.Select 
                            value={selectedValue}
                            onChange={handleChange}
                            style={{ width: 'auto' }}
                            className="text-center">
                            <option value="ua">UA</option>
                            <option value="en">EN</option>
                            <option value="fr">FR</option>
                        </Form.Select>
                    </Nav>
                </Navbar.Collapse>
                <Row className="d-lg-none ">
                            <Col md="auto">
                                <Image src="/assets/logo2.png" alt="logo" fluid className='logo-header' />
                            </Col>
                        </Row>
            </Container>
        </Navbar>
    );
}

export default Menu2;