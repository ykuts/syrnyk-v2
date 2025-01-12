// MissionGoalsSlide.js
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Utensils, Globe, Users, Handshake } from 'lucide-react';
import './MissionGoalsSlide.css';

const MissionGoalsSlide = () => {
  const goals = [
    {
      title: "Розвиток української кухні",
      description: "Ми прагнемо популяризувати традиційні українські страви, демонструючи їхнє багатство та унікальність. Наш кисломолочний сир займає особливе місце серед цих страв",
      icon: <Utensils size={48} className="goal-icon" />
    },
    {
      title: "Культурний обмін",
      description: "Організовуємо заходи, які сприяють глибшому розумінню та інтеграції української культури в швейцарське суспільство",
      icon: <Globe size={48} className="goal-icon" />
    },
    {
      title: "Підтримка українських кухарів",
      description: "Створюємо платформу для самореалізації, де талановиті кухарі можуть розвивати свої навички та втілювати творчі кулінарні ідеї",
      icon: <Users size={48} className="goal-icon" />
    },
    {
      title: "Комунікація та співпраця",
      description: "Будуємо партнерські відносини з місцевими організаціями, ресторанами та фермерами, щоб спільно просувати українські продукти та кулінарну спадщину",
      icon: <Handshake size={48} className="goal-icon" />
    }
  ];

  return (
    <div className="slide-content">
      <h3 className="text-center mb-4">Наша місія і цілі</h3>
      <Card className="about-card content-section-goal">
        <Card.Body>
          <Card.Text>
          Ми створили асоціацію SYRNYK з глибокою любов'ю та пристрастю до української кухні. Наша мета – подарувати вам частинку України, її неповторні смаки та аромат, які можуть об'єднати людей навіть на відстані тисячі кілометрів від рідного дому.
          </Card.Text>
        </Card.Body>
      </Card>

      <h4 className="mb-3">Цілі:</h4>
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