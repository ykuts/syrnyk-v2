import Col from "react-bootstrap/esm/Col";
import products from "../data/products.json"
import ProductCard from "./ProductCard";
import Row from "react-bootstrap/esm/Row";
import Container from "react-bootstrap/esm/Container";

const Products = () => {
    return ( 
        <Container>
            <h2>Products</h2>
        <Row>
                        {products.map(
                            (product) => {
                             return(
                                <Col>
                                <ProductCard product={product}/>
                                </Col>
                            )
                    }
                )}
                    
        </Row>
        </Container>
     );
}
 
export default Products;