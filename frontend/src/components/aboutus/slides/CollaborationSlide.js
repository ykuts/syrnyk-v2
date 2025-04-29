// CollaborationSlide.js
import React from 'react';
import { Card, Row, Col, ListGroup } from 'react-bootstrap';
import './CollaborationSlide.css';
import { useTranslation } from 'react-i18next';

const CollaborationSlide = () => {
  const { t } = useTranslation(['about', 'common']);
  const offerItems = [
    "Платформа для самореалізації: Створюємо можливості для демонстрації вашого кулінарного таланту та обміну досвідом з іншими професіоналами.",
    "Підтримка та розвиток: Надаємо підтримку в організації заходів, кулінарних майстер-класів та фестивалів.",
    "Нетворкінг: Допомагаємо встановити зв’язки з місцевими ресторанами та фермами для спільної співпраці та розвитку."
  ];

  const importanceItems = [
    "Популяризація української кухні: Разом ми зможемо донести до швейцарців всю багатогранність та унікальність української кухні.",
    "Культурний обмін: Ваші кулінарні таланти допоможуть зблизити наші культури та зробити їхнє співіснування гармонійнішим.",
    "Можливості для розвитку: Це надасть коло спілкування та допоможе знайти місце роботи або започаткувати свою справу."
  ];

  return (
    <div className="slide-content">
      <h3 className="text-center mb-4">{t('about.collaboration.title')}</h3>

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
              {t('about.collaboration.intro')}
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
            <Card.Header>{t('about.collaboration.offer.title')}</Card.Header>
            <ListGroup variant="flush">
              {offerItems.map((item, index) => (
                <ListGroup.Item key={index} className="about-list-item">
                  {t(`about.collaboration.offer.items.${index}`)}
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
            <Card.Header>{t('about.collaboration.importance.title')}</Card.Header>
            <ListGroup variant="flush">
              {importanceItems.map((item, index) => (
                <ListGroup.Item key={index} className="about-list-item">
                  {t(`about.collaboration.importance.items.${index}`)}
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