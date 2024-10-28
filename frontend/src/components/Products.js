import { useState } from 'react';
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import Container from "react-bootstrap/esm/Container";
import products from "../data/products.json";
import ProductCard from "./ProductCard";
import Image from 'react-bootstrap/Image'; // For the cart icon
import ShoppingCart from "./SoppingCart";


const Products = () => {
    const [cartItems, setCartItems] = useState([]); // State to hold items in the cart

    // Function to add a product to the cart
    const addToCart = (product) => {
        setCartItems([...cartItems, { ...product, quantity: 1 }]); // Add with initial quantity 1
    };

    // Function to update the quantity of a product in the cart
    const updateCartItem = (product, quantity) => {
        setCartItems(cartItems.map(item =>
            item.id === product.id ? { ...item, quantity } : item
        ));
    };

    // Calculate the total number of items in the cart
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <Container id='products' fluid>
            {/* Cart icon in the top of the page */}
            {/* // Inside the Products component: */}
<ShoppingCart
    cartItems={cartItems}
    updateCartItem={updateCartItem}
    removeFromCart={(product) => updateCartItem(product, 0)}
/>
            <div className="cart-icon">
                <Image src="/assets/cart.png" roundedCircle />
                {totalItems > 0 && (
                    <span className="cart-coucd nter">{totalItems}</span>
                )}
            </div>

            <Row>
                {products.map((product) => (
                    <Col
                        key={product.id}
                        xs={12}    // 1 card on screens up to 576px (vertical phone)
                        sm={6}     // 2 cards on screens from 576px to 767px (horizontal phone)
                        md={4}     // 3 cards on screens from 768px to 991px (tablet)
                        lg={3}     // 4 cards on screens from 992px and above (desktop)
                        className="d-flex justify-content-center align-items-center p-3"
                    >
                        <ProductCard
                            product={product}
                            addToCart={addToCart} // Pass addToCart function
                            updateCartItem={updateCartItem} // Pass updateCartItem function
                            cartItems={cartItems} // Pass the cart items
                        />
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default Products;
