import Col from "react-bootstrap/esm/Col";
import products from "../data/products.json"
import ProductCard from "./ProductCard";
import Row from "react-bootstrap/esm/Row";
import Container from "react-bootstrap/esm/Container";

const Products = () => {
    return ( 
        <Container id='products'>
            
        <Row >
                        {products.map(
                            (product) => {
                             return(
                                <Col className="d-flex justify-content-center align-items-center p-3" key={product.id}>
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