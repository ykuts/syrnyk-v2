
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/esm/Button';
import Image from 'react-bootstrap/esm/Image';


const ProductCardRec = ({ product }) => {
    return (

        <Card style={{ borderRadius: '20px' }} className="h-100 d-flex flex-column">
            <Link to={`/products/${product.id}`}>
                <Card.Img
                    variant="top"
                    src={product.image}
                    style={{ borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}
                />
            </Link>
            <Card.Body className="d-flex flex-column">
                <div>
                    <Link
                        to={`/products/${product.id}`}
                        style={{ textDecoration: 'none', color: 'black' }}
                    >
                        <Card.Title className='text-start'>{product.title}</Card.Title>
                    </Link>

                </div>
                {/* Этот блок будет заполнять пространство между описанием и нижней частью */}
                <div className="flex-grow-1"></div>
                <div>
                <div className="d-flex justify-content-between align-items-center">
                        <Card.Text className="text-dark mb-0 text-price">
                            {product.price} CHF / {product.weight}
                        </Card.Text>
                        <button
                            variant="light"
                            className="cart-button"
                        >
                            <Image
                                src="/assets/cart.png"
                                roundedCircle
                                style={{ width: '25px', height: '25px', marginRight: '3px' }}
                            />
                            <span style={{ fontSize: '0.85rem' }}>До кошика</span>
                        </button>
                    </div>
                </div>
            </Card.Body>
        </Card>

    );
}

export default ProductCardRec;