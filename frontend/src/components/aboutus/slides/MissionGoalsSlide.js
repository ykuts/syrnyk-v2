// MissionGoalsSlide.js
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Utensils, Globe, Users, Handshake } from 'lucide-react';
import './MissionGoalsSlide.css';

const MissionGoalsSlide = () => {
  const goals = [
    {
      title: "Development of Ukrainian Cuisine",
      description: "Promoting traditional Ukrainian dishes and sharing our culinary heritage",
      icon: <Utensils size={48} className="goal-icon" />
    },
    {
      title: "Cultural Exchange",
      description: "Organizing events that promote understanding of Ukrainian culture",
      icon: <Globe size={48} className="goal-icon" />
    },
    {
      title: "Supporting Ukrainian Chefs",
      description: "Creating a platform for self-realization and professional growth",
      icon: <Users size={48} className="goal-icon" />
    },
    {
      title: "Building Partnerships",
      description: "Collaborating with local organizations and businesses",
      icon: <Handshake size={48} className="goal-icon" />
    }
  ];

  return (
    <div className="slide-content">
      <h3 className="text-center mb-4">Our Mission and Goals</h3>
      <Card className="about-card content-section-goal">
        <Card.Body>
          <Card.Text>
            We created the SYRNYK association with deep love and passion for Ukrainian cuisine. 
            Our goal is to give you a piece of Ukraine, its unique tastes and aroma that can unite 
            people even thousands of kilometers from home.
          </Card.Text>
        </Card.Body>
      </Card>

      <h4 className="mb-3">Our Goals:</h4>
      <Row className="g-4">
        {goals.map((goal, index) => (
          <Col md={6} key={index}>
            <Card className="about-card goal-card h-100">
              <Card.Body className="d-flex flex-column">
                <div className="icon-container mb-3">
                  {goal.icon}
                </div>
                <Card.Title>{goal.title}</Card.Title>
                <Card.Text>{goal.description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MissionGoalsSlide;