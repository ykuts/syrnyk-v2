import Container from "react-bootstrap/esm/Container";

const OrderBox = () => {
    return ( 
        <div>
            <Container>
            <p className="text-start mb-1">Українські традиції у</p>
            <p className="text-start">Швейцарії</p>
            <p className="text-start">
            <button className="custom-button">
                замовити
            </button>
            </p>
            </Container>
        </div>
     );
}
 
export default OrderBox;