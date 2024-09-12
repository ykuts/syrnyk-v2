/* import { Link } from 'react-router-dom'; */
import Image from 'react-bootstrap/esm/Image';
import Container from 'react-bootstrap/esm/Container';
import Col from 'react-bootstrap/esm/Col';
import Row from 'react-bootstrap/esm/Row';


const FooterNav = () => {
    return (
        <footer style={{ paddingTop: '30px' }}>
            <Container fluid>
                <Row className="justify-content-evenly align-items-center flex-nowrap p-1">
                    <Col md={3} className="d-none d-md-block">
                    </Col>
                    <Col xs={6} md={3} className="text-start text-md-left align-items-start">
                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '40px' }}><a href="/" className='menu-footer-link'>Меню</a></li>
                            <li style={{ marginBottom: '40px' }}><a href="/" className='menu-footer-link'>Доставка</a></li>
                            <li style={{ marginBottom: '40px' }}><a href="/" className='menu-footer-link'>Про нас</a></li>
                        </ul>
                    </Col>
                    {/* Третья колонка, пока пустая */}
                        <Col md={1} className="d-none d-md-block">
                            {/* Место для дополнительного контента */}
                        </Col>
                    <Col xs={6} md={5} className="text-center" >
                        <div>
                            <div style={{ marginBottom: '10px' }}>
                                <Image src="/assets/logo-white.png" alt="logo" fluid className='logo-footer' />
                            </div>
                        </div>

                        <div>
                            <p style={{ marginBottom: '5px' }}>
                                <a href="tel:+41797158774" style={{ color: '#fff', textDecoration: 'none' }}>
                                    <Image src="/assets/call-white.png" alt="call us" fluid className='logo-header' style={{ width: '40px', height: '40px' }} />
                                    +41 79 715-87-74
                                </a>
                            </p>
                            <div >
                                <a href="https://www.instagram.com/syrnyk.ch" target='_blank'  rel="noopener noreferrer" className="px-auto">
                                    <Image src="/assets/facebook-white.png"
                                        style={{ width: '50px', height: '50px' }} />
                                </a>
                                <a href="https://www.instagram.com/syrnyk.ch" target='_blank'  rel="noopener noreferrer" className="px-auto">
                                    <Image src="/assets/instagram-white.png"
                                        style={{ width: '50px', height: '50px' }} />
                                </a>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
}

export default FooterNav;