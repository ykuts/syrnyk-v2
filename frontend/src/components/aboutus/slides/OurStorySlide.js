// OurStorySlide.js
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './OurStorySlide.css';

const OurStorySlide = () => {
  return (
    <div className="slide-content">
      <h3 className="text-center mb-4">Наша історія</h3>
      
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
              Мене звати Ірина Піскова, я з України. Я дуже люблю кулінарію та родинні традиції: зустрічі, спільний сміх, святкування!
Коли я приїхала до Швейцарії, країни-експерта в сирі, я вирішила виготовляти сир! Але це український свіжий сир.
Ми також великі любителі сиру, і наші рецепти додають ще більше різноманіття до сирного мистецтва. Наші рецепти відзначаються теплом і гостинністю, що додає особливий шарм українській кулінарній традиції. Виготовлення сиру дозволяє мені зберегти частинку нашої культури у своєму серці. І я охоче ділюся цим зі швейцарцями!
Я також створила акаунт в Instagram, щоб ділитися цікавими, смачними рецептами, зробленими з мого сиру. Це спосіб подорожувати до України та дізнатися, хто ми такі!
              </Card.Text>
              <Card.Text>
              Ми також великі любителі сиру, і наші рецепти додають ще більше різноманітності в мистецтво
 сиру. Наші рецепти відзначаються теплом і гостинністю, додаючи особливого шарму
 до української кулінарної традиції.
              </Card.Text>
              <div className="text-center mt-4">
            <Link to="/" className="btn btn-primary">
              Замовити
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