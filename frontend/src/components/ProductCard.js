import { useContext } from 'react';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import { CartContext } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
    const quantity = cartItems.find((item) => item.id === product.id)?.quantity || 0;

    const handleAddToCart = () => {
        addToCart(product);
    };

    const handleRemoveFromCart = () => {
        removeFromCart(product.id);
    };

    return (
        <Card style={{ backgroundColor: '#95c2d7', borderRadius: '20px' }} className="h-100 d-flex flex-column">
            <Link to={`/products/${product.id}`}>
                <Card.Img
                    variant="top"
                    src={product.image}
                    style={{ borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}
                />
            </Link>
            <Card.Body className="d-flex flex-column">
                <div>
                    <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'black' }}>
                        <Card.Title className="text-start">{product.title}</Card.Title>
                    </Link>
                    <Card.Text className="text-white text-start mb-4">
                        {product.description}
                    </Card.Text>
                </div>
                <div className="flex-grow-1"></div>
                <div>
                    
                    <div className="d-flex justify-content-between align-items-center">
                        <Card.Text className="text-dark mb-0 text-price">
                            {product.price} CHF / {product.weight}
                        </Card.Text>
                        {quantity === 0 ? (
                            <Button variant="light" className="cart-button" onClick={handleAddToCart}>
                                <Image src="/assets/cart.png" roundedCircle style={{ width: '25px', height: '25px', marginRight: '3px' }} />
                                <span style={{ fontSize: '0.85rem' }}>Add to cart</span>
                            </Button>
                        ) : (
                            <div className="d-flex align-items-center">
                                <Button variant="light" onClick={handleRemoveFromCart}>-</Button>
                                <span className="mx-2">{quantity}</span>
                                <Button variant="light" onClick={handleAddToCart}>+</Button>
                            </div>
                        )}
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;
