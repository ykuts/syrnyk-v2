import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Image from 'react-bootstrap/esm/Image';
import Form from 'react-bootstrap/Form';
import '../custom.scss';


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
            <Container>
                {/* Тоггл перемещен влево на мобильных устройствах */}
                <Navbar.Toggle aria-controls="responsive-navbar-nav" className="" />
                {/* nav-account фиксирован справа, независимо от устройства */}
                
                <Nav className='icons ms-auto d-flex flex-row order-lg-4' id='nav-account'>
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
                <Navbar.Collapse id="responsive-navbar-nav" className="">

                    {/* nav-links будет первым блоком в мобильной версии */}
                    <Nav className='links mx-auto order-lg-3 ' id='nav-links'>
                        <Nav.Link href="#products" className="px-auto">
                            {t('menu.menu_top')}
                        </Nav.Link>
                        <Nav.Link href="#delivery" className="px-auto">
                            {t('menu.delivery')}
                        </Nav.Link>
                        <Nav.Link href="#about" className="px-auto">
                            {t('menu.about_us')}
                        </Nav.Link>
                    </Nav>

                    {/* nav-social будет вторым блоком в мобильной версии */}
                    <Nav className='select-lg d-flex flex-row justify-content-center order-lg-1' id='nav-social'>
                        <Nav.Link href="https://www.instagram.com/syrnyk.ch" className="px-auto">
                            <Image src="/assets/facebook.png"
                                style={{ width: '40px', height: '40px' }} />
                        </Nav.Link>
                        <Nav.Link href="https://www.instagram.com/syrnyk.ch" className="px-auto">
                            <Image src="/assets/instagram.png"
                                style={{ width: '40px', height: '40px' }} />
                        </Nav.Link>
                    </Nav>

                    {/* nav-lang будет третьим блоком в мобильной версии */}
                    <Nav className='select-lg me-auto order-lg-2 d-flex justify-content-center align-items-center' id='nav-lang'>
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

            </Container>
            
            
        </Navbar>
    );
}

export default Menu2;