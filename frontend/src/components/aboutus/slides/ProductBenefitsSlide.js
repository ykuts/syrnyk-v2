import React from 'react';
import { ListGroup, Row, Col } from 'react-bootstrap';
import './ProductBenefitsSlide.css';
import { useTranslation } from 'react-i18next';

const ProductBenefitsSlide = () => {
  const { t } = useTranslation(['about', 'common']);
  return (
    <div className="slide-content">
      <h3 className="text-center mb-4">{t('about.benefits.title')}</h3>
      <p className="text-center mb-4">
      {t('about.benefits.description')}
      </p>

      <div className="benefits-section">
        <h4 className="mb-4 text-left">{t('about.benefits.reasons_title')}</h4>
        <Row>
          <Col md={7}>
            <ListGroup variant="flush" className="benefits-list">
              <ListGroup.Item className="about-list-item">
                <strong>{t('about.benefits.reasons.0.title')} </strong> 
                {t('about.benefits.reasons.0.description')}
              </ListGroup.Item>
              <ListGroup.Item className="about-list-item">
              <strong>{t('about.benefits.reasons.1.title')} </strong> 
              {t('about.benefits.reasons.1.description')}
              </ListGroup.Item>
              <ListGroup.Item className="about-list-item">
              <strong>{t('about.benefits.reasons.2.title')} </strong> 
              {t('about.benefits.reasons.2.description')}
              </ListGroup.Item>
              <ListGroup.Item className="about-list-item">
              <strong>{t('about.benefits.reasons.3.title')} </strong> 
              {t('about.benefits.reasons.3.description')}
              </ListGroup.Item>
              <ListGroup.Item className="about-list-item">
              <strong>{t('about.benefits.reasons.4.title')} </strong> 
              {t('about.benefits.reasons.4.description')}
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