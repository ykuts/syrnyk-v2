// OurStorySlide.js
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './OurStorySlide.css';
import { useTranslation } from 'react-i18next';

const OurStorySlide = () => {
  const { t } = useTranslation(['about', 'common']);
  return (
    <div className="slide-content">
      <h3 className="text-center mb-4">{t('about.story.title')}</h3>
      
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
                {t('about.story.text')}
              </Card.Text>
              <Card.Text>
                {t('about.story.text2')}
              </Card.Text>
              <div className="text-center mt-4">
            <Link to="/" className="btn btn-primary">
              {t('common:buttons.order')}
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