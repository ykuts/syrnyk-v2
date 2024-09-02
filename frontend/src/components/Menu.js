import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
//import SelectLang from './SelectLang';
import Image from 'react-bootstrap/esm/Image';
import Form from 'react-bootstrap/Form';
import '../custom.scss';

import { useTranslation } from 'react-i18next';


const Menu = () => {
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
        <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary justify-content-between">
        <Container>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
        
        <Nav className='select-lg me-auto'>
        <Nav.Link href="https://www.instagram.com/syrnyk.ch" className="px-auto">
        <Image src="/assets/facebook.png"  
                        style={{ width: '40px', height: '40px' }}/>
            </Nav.Link>
            <Nav.Link href="https://www.instagram.com/syrnyk.ch" className="px-auto">
            <Image src="/assets/instagram.png"  
                        style={{ width: '40px', height: '40px' }}/>
            </Nav.Link>
        </Nav>

        <Nav className='select-lg me-auto'>

            {/* <SelectLang /> */}
           
            <Form.Select value={selectedValue} onChange={handleChange}>
                <option value="ua">UA</option>
                <option value="en">EN</option>
                <option value="fr">FR</option>
            </Form.Select>
        </Nav>
       
        <Nav className='links mx-auto'>
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


        <Nav className='icons ms-auto'>
            <Nav.Link href="#signeIn" className="">
                <button className="custom-button">
                    <Image src="/assets/account.png" roundedCircle 
                        style={{ width: '30px', height: '30px' }}/>
                    {t('buttons.profile')}
                </button>
            {/* <Image src="/assets/account.png" roundedCircle 
             style={{ width: '40px', height: '40px' }}/> */}
            
            </Nav.Link>
            <Nav.Link eventKey={2} href="#cart">
                <button className="custom-button">
                    <Image src="/assets/cart.png" roundedCircle 
                        style={{ width: '30px', height: '30px' }}/>
                    {t('buttons.cart')}
                </button>
            
            </Nav.Link>
        </Nav>
        </Navbar.Collapse>
        </Container>
    </Navbar>
     );
}
 
export default Menu;