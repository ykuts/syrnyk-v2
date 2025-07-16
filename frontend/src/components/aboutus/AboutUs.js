import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import './AboutUs.css';

const AboutUs = () => {
  const { t } = useTranslation('about');

  return (
    <Container className="my-5">
      {/* Page title */}
      <Row>
        <Col>
          <h1 className="text-center mb-5 page-title">{t('about.title')}</h1>
        </Col>
      </Row>

      {/* Introduction section with kitchen image */}
      <Row className="mb-5 align-items-center">
        <Col lg={6} className="mb-4 mb-lg-0">
          <div className="content-section">
            <h3 className="section-title text-primary mb-3">{t('about.intro')}</h3>
            <p className="lead text-justify mb-4">{t('about.description')}</p>
          </div>
        </Col>
        <Col lg={6}>
          <div className="image-container">
            <img 
              src="./../assets/about1.jpg"
              alt="Kitchen workshop"
              className="img-fluid about-image"
            />
          </div>
        </Col>
      </Row>

      {/* Cheese section */}
      <Row className="mb-5">
        <Col>
          <Card className="content-card">
            <Card.Body className="p-4">
              <h3 className="section-title text-primary text-center mb-4">{t('about.cheeseTitle')}</h3>
              <p className="text-justify lead">{t('about.cheeseDescription')}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Product section with cheese image */}
      <Row className="mb-5 align-items-center">
        <Col lg={6} className="order-lg-2 mb-4 mb-lg-0">
          <div className="content-section">
            <h3 className="section-title text-primary mb-3">{t('about.gastronomyTitle')}</h3>
            <p className="text-justify mb-4">{t('about.gastronomyDescription')}</p>

            {/* Product features */}
            <Card className="product-features-card">
              <Card.Body className="text-center">
                {/* <h5 className="text-primary mb-3">SYRNYK</h5> */}
                <img 
                  src="./../assets/logo2.png"
                  alt="SYRNYK cheese"
                  className="img-fluid mb-3 product-logo"
                />
                <p className="mb-3">
                  <strong>{t('about.product.subtitle')}</strong><br/>
                  <small className="text-muted">{t('about.product.description')}</small>
                </p>
                <div className="features-badges">
                  <span className="feature-badge">{t('about.product.features.calcium')}</span>
                  <span className="feature-badge">{t('about.product.features.protein')}</span>
                  <span className="feature-badge">{t('about.product.features.lowFat')}</span>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
        <Col lg={6} className="order-lg-1">
          <div className="image-container">
            <img 
              src="./../assets/about2.jpg"
              alt="SYRNYK cheese package"
              className="img-fluid about-image"
            />
          </div>
        </Col>
      </Row>

      {/* Order button section */}
      <Row>
        <Col>
          <Card className="order-card">
            <Card.Body className="text-center p-4">
              <h4 className="text-white mb-3">{t('about.order.title')}</h4>
              <p className="text-white mb-4">{t('about.order.description')}</p>
              <Button 
                variant="light" 
                size="lg" 
                className="order-button px-4 py-2"
                onClick={() => window.location.href = '/'}
              >
                {t('about.order.buttonText')}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutUs;