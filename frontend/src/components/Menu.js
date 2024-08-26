import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import SelectLang from './SelectLang';
import Image from 'react-bootstrap/esm/Image';


const Menu = () => {
    return ( 
        <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary justify-content-between">
        <Container>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
        
        <Nav className='select-lg me-auto'>
        <Nav.Link href="#products" className="px-auto">
        <Image src="/assets/facebook.png"  
                        style={{ width: '40px', height: '40px' }}/>
            </Nav.Link>
            <Nav.Link href="#products" className="px-auto">
            <Image src="/assets/instagram.png"  
                        style={{ width: '40px', height: '40px' }}/>
            </Nav.Link>
        </Nav>

        <Nav className='select-lg me-auto'>
            <SelectLang />
        </Nav>
        
        <Nav className='links mx-auto'>
            <Nav.Link href="#products" className="px-auto">
                Меню
            </Nav.Link>
            <Nav.Link href="#delivery" className="px-auto">
                Доставка
                </Nav.Link>
            <Nav.Link href="#about" className="px-auto">
                Про нас
            </Nav.Link>
        </Nav>
       
        {/* style={{ backgroundColor: '#ff961c' }}  */}

        <Nav className='icons ms-auto'>
            <Nav.Link href="#signeIn" className="custom-font">
                <button className="custom-button">
                    <Image src="/assets/account.png" roundedCircle 
                        style={{ width: '40px', height: '40px' }}/>
                    Профіль
                </button>
            {/* <Image src="/assets/account.png" roundedCircle 
             style={{ width: '40px', height: '40px' }}/> */}
            
            </Nav.Link>
            <Nav.Link eventKey={2} href="#cart">
                <button className="custom-button">
                    <Image src="/assets/cart.png" roundedCircle 
                        style={{ width: '40px', height: '40px' }}/>
                    Кошик
                </button>
            
            </Nav.Link>
        </Nav>
        </Navbar.Collapse>
        </Container>
    </Navbar>
     );
}
 
export default Menu;