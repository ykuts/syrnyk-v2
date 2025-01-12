import React from 'react';
import { ListGroup, Row, Col } from 'react-bootstrap';
import './ProductBenefitsSlide.css';

const ProductBenefitsSlide = () => {
  return (
    <div className="slide-content">
      <h3 className="text-center mb-4">Сир SYRNYK – це смачний і здоровий вибір для всієї родини</h3>
      <p className="text-center mb-4">
      Завдяки нейтральному смаку та приємній текстурі його можна використовувати у різних стравах – від салатів до десертів. 
      Він підійде на сніданок вранці, послужить ситним перекусом вдень або доповнить вашу вечерю.
      </p>

      <div className="benefits-section">
        <h4 className="mb-4 text-left">5 причин, чому варто включити сир SYRNYK у раціон:</h4>
        <Row>
          <Col md={7}>
            <ListGroup variant="flush" className="benefits-list">
              <ListGroup.Item className="about-list-item">
                <strong>Покращує травлення: </strong> 
                Сир SYRNYK містить пробіотики, які сприяють здоровій мікрофлорі кишківника. Це допомагає покращити травлення і загальний стан шлунково-кишкового тракту.
              </ListGroup.Item>
              <ListGroup.Item className="about-list-item">
                <strong>Багатий на білки та кальцій: </strong>
                Сир SYRNYK є чудовим джерелом білків та кальцію. Білки необхідні для будівництва і відновлення тканин, а кальцій - для зміцнення кісток і зубів.
              </ListGroup.Item>
              <ListGroup.Item className="about-list-item">
                <strong>Екологічний продукт без добавок: </strong>
                Виготовлений на фермі у Швейцарії за високими стандартами якості, сир SYRNYK є екологічно чистим продуктом, що гарантує відсутність штучних добавок, консервантів чи барвників. Це робить його більш натуральним і здоровим вибором для всієї родини.
              </ListGroup.Item>
              <ListGroup.Item className="about-list-item">
                <strong>Універсальність у кулінарії: </strong>
                Завдяки нейтральному смаку та приємній текстурі, сир SYRNYK може використовуватися у різних стравах – від салатів до десертів. Це збагачує кулінарні пропозиції і задовольняє потреби клієнтів у смачній та корисній їжі.
              </ListGroup.Item>
              <ListGroup.Item className="about-list-item">
                <strong>Збагачення раціону українськими рецептами: </strong>
                Сир SYRNYK виготовлений за традиційними українськими рецептами, що додає тепло та гостинність української кулінарної культури у ваш раціон.
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