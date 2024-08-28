import Row from "react-bootstrap/esm/Row";
import products from "../data/products.json"
import ProductCard from "./ProductCard";
import Col from "react-bootstrap/esm/Col";

const Recomendations = () => {
    return ( 
        <div>
            <h2>Вам також сподобається</h2>
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
        </div>
     );
}
 
export default Recomendations;