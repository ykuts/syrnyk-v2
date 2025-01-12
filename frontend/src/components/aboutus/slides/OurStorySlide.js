// OurStorySlide.js
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './OurStorySlide.css';

const OurStorySlide = () => {
  return (
    <div className="slide-content">
      <h3 className="text-center mb-4">Our Story</h3>
      
      <Row className="story-container">
        <Col md={5} className="image-col">
          <div className="story-image-container mb-4 mb-md-0">
            <img 
              src="/assets/images/iryna2.jpeg" 
              alt="Iryna Piskova" 
              className="story-image"
            />
          </div>
        </Col>
        
        <Col md={7}>
          <Card className="about-card story-card">
            <Card.Body>
              <Card.Text>
                My name is Iryna Piskova, I'm from Ukraine. I love cooking and family traditions: 
                gatherings, shared laughter, celebrations! When I came to Switzerland, a country of 
                cheese expertise, I decided to make cheese! But this is Ukrainian fresh cheese.
              </Card.Text>
              <Card.Text>
                We are also great cheese lovers, and our recipes add even more variety to the art 
                of cheese. Our recipes are marked by warmth and hospitality, adding a special charm 
                to Ukrainian culinary tradition.
              </Card.Text>
              <div className="text-center mt-4">
            <Link to="/" className="btn btn-primary">
              Order Now
            </Link>
          </div>
            </Card.Body>
          </Card>

          
        </Col>
      </Row>
    </div>
  );
};

export default OurStorySlide;