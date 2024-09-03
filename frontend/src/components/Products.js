import Col from "react-bootstrap/esm/Col";
import products from "../data/products.json"
import ProductCard from "./ProductCard";
import Row from "react-bootstrap/esm/Row";
import Container from "react-bootstrap/esm/Container";

const Products = () => {
    return ( 
        <Container id='products'>
            
        <Row >
        {products.map((product) => (
          <Col
            key={product.id}
            xs={12}    // 1 карточка на экранах до 576px (вертикальный телефон)
            sm={6}     // 2 карточки на экранах от 576px до 767px (горизонтальный телефон)
            md={4}     // 3 карточки на экранах от 768px до 991px (планшет)
            lg={3}     // 4 карточки на экранах от 992px и выше (десктоп)
            className="d-flex justify-content-center align-items-center p-3"
          >
            <ProductCard product={product} />
          </Col>
        ))}
                    
        </Row>
        </Container>
     );
}
 
export default Products;