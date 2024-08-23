import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import SelectLang from './SelectLang';


const Menu = () => {
    return ( 
        <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary justify-content-between">
        <Container>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
        
        <Nav className='select-lg me-auto'>
            <SelectLang />
        </Nav>
        
        <Nav className='links mx-auto'>
            <Nav.Link href="#products" className="px-auto">
                продукція
            </Nav.Link>
            <Nav.Link href="#delivery" className="px-auto">
                доставка та оплата
                </Nav.Link>
            <Nav.Link href="#about" className="px-auto">
                наші цінності
            </Nav.Link>
        </Nav>
       
        <Nav className='icons ms-auto'>
            <Nav.Link href="#signeIn" className="custom-font">
            <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#133495"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/></svg>
            </Nav.Link>
            <Nav.Link eventKey={2} href="#cart">
                <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_13_30)">
                    <path d="M1.66669 1.66666H8.33335L12.8 23.9833C12.9524 24.7506 13.3699 25.4399 13.9793 25.9305C14.5887 26.4211 15.3512 26.6816 16.1334 26.6667H32.3333C33.1155 26.6816 33.878 26.4211 34.4874 25.9305C35.0968 25.4399 35.5143 24.7506 35.6667 23.9833L38.3334 9.99999H10M16.6667 35C16.6667 35.9205 15.9205 36.6667 15 36.6667C14.0795 36.6667 13.3334 35.9205 13.3334 35C13.3334 34.0795 14.0795 33.3333 15 33.3333C15.9205 33.3333 16.6667 34.0795 16.6667 35ZM35 35C35 35.9205 34.2538 36.6667 33.3334 36.6667C32.4129 36.6667 31.6667 35.9205 31.6667 35C31.6667 34.0795 32.4129 33.3333 33.3334 33.3333C34.2538 33.3333 35 34.0795 35 35Z" stroke="#133495" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_13_30">
                    <rect width="40" height="40" fill="white"/>
                    </clipPath>
                    </defs>
                </svg>
            </Nav.Link>
        </Nav>
        </Navbar.Collapse>
        </Container>
    </Navbar>
     );
}
 
export default Menu;