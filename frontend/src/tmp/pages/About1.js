import { Link } from "react-router-dom";
import ListGroup from 'react-bootstrap/ListGroup';

const About1 = () => {
    return ( 
        <div>
            {/* <div className="image">
                <img src="/assets/images/syrnyk1.jpeg" alt="" />
            </div> */}
            <div>
        <h3>Сир SYRNYK – це смачний і здоровий вибір для всієї родини. </h3>
        <p>Завдяки нейтральному смаку та приємній текстурі його можна використовувати у різних стравах – від салатів до десертів. 
        Він підійде на сніданок вранці, послужить ситним перекусом вдень або доповнить вашу вечерю. </p>
         <h4>5 причин, чому варто включити сир SYRNYK у раціон:</h4>

         <ListGroup as="ol" numbered className="text-start">
      <ListGroup.Item
        as="li"
        className="d-flex justify-content-between align-items-start text-start"
      >
        <div className="ms-2 me-auto">
          <div className="fw-bold"><span className="my-text">Покращує травлення:</span> </div>
          Сир SYRNYK містить пробіотики, які сприяють здоровій мікрофлорі кишківника. Це допомагає покращити травлення і загальний стан шлунково-кишкового тракту.
        </div>
        </ListGroup.Item>
      <ListGroup.Item
        as="li"
        className="d-flex justify-content-between align-items-start "
      >
        <div className="ms-2 me-auto">
          <div className="fw-bold">Багатий на білки та кальцій:</div>
          Сир SYRNYK є чудовим джерелом білків та кальцію. Білки необхідні для будівництва і відновлення тканин, а кальцій - для зміцнення кісток і зубів.
        </div>
        
      </ListGroup.Item>
      <ListGroup.Item
        as="li"
        className="d-flex justify-content-between align-items-start"
      >
        <div className="ms-2 me-auto">
          <div className="fw-bold">Екологічний продукт без добавок:</div>
          Виготовлений на фермі у Швейцарії за високими стандартами якості, сир SYRNYK є екологічно чистим продуктом, що гарантує відсутність штучних добавок, консервантів чи барвників. Це робить його більш натуральним і здоровим вибором для всієї родини.
        </div>
        
      </ListGroup.Item>
      <ListGroup.Item
        as="li"
        className="d-flex justify-content-between align-items-start"
      >
        <div className="ms-2 me-auto">
          <div className="fw-bold">Універсальність у кулінарії:</div>
          Завдяки нейтральному смаку та приємній текстурі, сир SYRNYK може використовуватися у різних стравах – від салатів до десертів. Це збагачує кулінарні пропозиції і задовольняє потреби клієнтів у смачній та корисній їжі.
        </div>
        
      </ListGroup.Item>
      <ListGroup.Item
        as="li"
        className="d-flex justify-content-between align-items-start"
      >
        <div className="ms-2 me-auto">
          <div className="fw-bold">Збагачення раціону українськими рецептами:</div>
          Сир SYRNYK виготовлений за традиційними українськими рецептами, що додає тепло та гостинність української кулінарної культури у ваш раціон.
        </div>
        
      </ListGroup.Item>
    </ListGroup>

            
            <h3>
                Сир SYRNYK – це смачний і здоровий вибір для всієї родини, що додає різноманіття і користь у ваш раціон.
            </h3>
            </div>
        <Link className='btn btn-primary' to="/">Замовити</Link>
        </div>
     );
}
 
export default About1;