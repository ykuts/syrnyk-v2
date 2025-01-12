import React from 'react';
import { ListGroup, Row, Col } from 'react-bootstrap';
import './ProductBenefitsSlide.css';

const ProductBenefitsSlide = () => {
  return (
    <div className="slide-content">
      <h3 className="text-center mb-4">SYRNYK Cheese - A Healthy Choice for the Whole Family</h3>
      <p className="text-center mb-4">
        Thanks to its neutral taste and pleasant texture, it can be used in various dishes - from salads to desserts. 
        It's perfect for breakfast, serves as a hearty snack during the day, or complements your dinner.
      </p>

      <div className="benefits-section">
        <h4 className="mb-4 text-left">5 reasons to include SYRNYK cheese in your diet:</h4>
        <Row>
          <Col md={7}>
            <ListGroup variant="flush" className="benefits-list">
              <ListGroup.Item className="about-list-item">
                <strong>Improves digestion: </strong> 
                SYRNYK cheese contains probiotics that promote healthy intestinal microflora.
              </ListGroup.Item>
              <ListGroup.Item className="about-list-item">
                <strong>Rich in proteins and calcium: </strong>
                SYRNYK cheese is an excellent source of proteins and calcium.
              </ListGroup.Item>
              <ListGroup.Item className="about-list-item">
                <strong>Eco-friendly product without additives: </strong>
                Made on a farm in Switzerland according to high quality standards.
              </ListGroup.Item>
              <ListGroup.Item className="about-list-item">
                <strong>Versatility in cooking: </strong>
                Can be used in various dishes from salads to desserts.
              </ListGroup.Item>
              <ListGroup.Item className="about-list-item">
                <strong>Enrichment with Ukrainian recipes: </strong>
                Made according to traditional Ukrainian recipes.
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={5} className="d-flex align-items-center justify-content-center">
            <div className="benefits-image-container">
              <img 
                src="/assets/images/syrnyk1.jpeg" 
                alt="SYRNYK cheese" 
                className="benefits-image"
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProductBenefitsSlide;