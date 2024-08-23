import {
    MDBInput,
    MDBCheckbox,
    MDBBtn
  } from 'mdb-react-ui-kit';

  import Container from 'react-bootstrap/esm/Container';
  import Row from 'react-bootstrap/esm/Row';
  import Col from 'react-bootstrap/esm/Col';

const Order = () => {
    return (<div>

        <h2>Замовити</h2>

        <Container>
                <Row>
                    <Col>
                        <img src="/assets/images/deliveryVD.png" alt="" />
                    </Col>
                    <Col>
                    <form>
      <MDBInput id='form4Example1' wrapperClass='mb-4' label='Name' />
      <MDBInput type='email' id='form4Example2' wrapperClass='mb-4' label='Email address' />
      <MDBInput wrapperClass='mb-4' textarea id='form4Example3' rows={4} label='Message' />

      <MDBCheckbox
        wrapperClass='d-flex justify-content-center mb-4'
        id='form4Example4'
        label='Send me a copy of this message'
        defaultChecked
      />

      <MDBBtn type='submit' className='mb-4' block>
        Sign in
      </MDBBtn>
    </form>
                    
                    </Col>
                    </Row>

</Container>
        

        </div>
     );
}
 
export default Order;