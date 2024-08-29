
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/esm/Button';
import Image from 'react-bootstrap/esm/Image';


const ProductCard = ({product}) => {
    

    return ( 
        
        <Card style={{ width: '15rem', backgroundColor: '#95c2d7', borderRadius: '20px' }} className="h-100 d-flex flex-column">
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
                    <Card.Text className="text-white text-start mb-4">
                        {product.description}
                    </Card.Text>
                </div>
                {/* Этот блок будет заполнять пространство между описанием и нижней частью */}
                <div className="flex-grow-1"></div>
                <div>
                    <Card.Text className="text-dark fs-6">
                        {product.price} CHF / {product.weight}
                    </Card.Text>
                    <div className='d-flex justify-content-center mt-3'>
                        <Button 
                            variant="light" 
                            style={{ 
                                borderRadius: '20px', 
                                padding: '5px 15px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                boxShadow: '0px 0px 5px rgba(0,0,0,0.1)' 
                            }}
                        >
                            <Image 
                                src="/assets/cart.png" 
                                roundedCircle 
                                style={{ width: '40px', height: '40px', marginRight: '8px' }}
                            />
                            До кошика
                        </Button>
                    </div>
                </div>
            </Card.Body>
        </Card>
       
     );
}
 
export default ProductCard;