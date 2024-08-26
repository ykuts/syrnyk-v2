import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';


const ProductCard = ({product}) => {
    return ( 
        
        <Card style={{ width: '18rem' }}>
            <Card.Img variant="top" src={product.image} />
            <Card.Body>
                <Card.Title>{product.title}</Card.Title>
                <Card.Text>
                {product.description}
                </Card.Text>
                <Button variant="primary">Go somewhere</Button>
            </Card.Body>
        </Card>
       
     );
}
 
export default ProductCard;