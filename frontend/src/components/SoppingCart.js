import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { useState } from 'react';

const ShoppingCart = ({ cartItems, updateCartItem, removeFromCart }) => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // Calculate the total price of items in the cart
    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                View Cart ({cartItems.length})
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Кошик</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {cartItems.length === 0 ? (
                        <p>Ви ще нічого не замовили</p>
                    ) : (
                        <ListGroup>
                            {cartItems.map(item => (
                                <ListGroup.Item key={item.id}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5>{item.title}</h5>
                                            <p>{item.price} CHF x {item.quantity}</p>
                                        </div>
                                        <div>
                                            <Button variant="light" onClick={() => updateCartItem(item, item.quantity - 1)}>-</Button>
                                            <span className="mx-2">{item.quantity}</span>
                                            <Button variant="light" onClick={() => updateCartItem(item, item.quantity + 1)}>+</Button>
                                            <Button
                                                variant="danger"
                                                className="ml-2"
                                                onClick={() => removeFromCart(item)}
                                            >
                                                Видалити
                                            </Button>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <h5>Total: {totalPrice.toFixed(2)} CHF</h5>
                    <Button variant="success" onClick={handleClose}>Оформити</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ShoppingCart;
