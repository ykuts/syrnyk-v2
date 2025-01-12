// CollaborationSlide.js
import React from 'react';
import { Card, Row, Col, ListGroup } from 'react-bootstrap';
import './CollaborationSlide.css';

const CollaborationSlide = () => {
  const offerItems = [
    "Platform for self-realization",
    "Support and development",
    "Networking opportunities"
  ];

  const importanceItems = [
    "Promotion of Ukrainian cuisine",
    "Cultural exchange",
    "Development opportunities"
  ];

  return (
    <div className="slide-content">
      <h3 className="text-center mb-4">Join Our Community</h3>

      <Row className="collaboration-container">
        <Col md={4}>
          <div className="collaboration-image-container mb-4">
            <img 
              src="/assets/images/collaboration1.jpeg" 
              alt="Chefs collaborating"
              className="collaboration-image"
            />
          </div>
        </Col>

        <Col md={8}>
          <Card className="about-card content-section mb-4">
            <Card.Body>
              <Card.Text>
                SYRNYK Association sincerely invites chefs, restaurateurs, and cheese makers to collaborate. 
                We believe that together we can make a significant contribution to the development and 
                promotion of Ukrainian cuisine in Switzerland.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6}>
          <Card className="about-card h-100 offer-card">
            <div className="card-image-top">
              <img 
                src="/assets/images/offer.jpeg" 
                alt="What we offer"
                className="offer-image"
              />
            </div>
            <Card.Header>What we offer</Card.Header>
            <ListGroup variant="flush">
              {offerItems.map((item, index) => (
                <ListGroup.Item key={index} className="about-list-item">
                  {item}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="about-card h-100 importance-card">
            <div className="card-image-top">
              <img 
                src="/assets/images/importance.jpeg" 
                alt="Why it matters"
                className="importance-image"
              />
            </div>
            <Card.Header>Why it matters</Card.Header>
            <ListGroup variant="flush">
              {importanceItems.map((item, index) => (
                <ListGroup.Item key={index} className="about-list-item">
                  {item}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CollaborationSlide;