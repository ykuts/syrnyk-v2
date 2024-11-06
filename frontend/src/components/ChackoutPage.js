import React, { useState, useContext} from 'react';
import { CartContext } from '../context/CartContext'; 
import { Form, Row, Col, Button, Alert, ButtonGroup  } from 'react-bootstrap';
import { Container, Table } from 'react-bootstrap';
import { Trash, Plus, Minus } from 'lucide-react';

const CheckoutPage = () => {
  const { 
    cartItems, 
    totalPrice, 
    removeAllFromCart, 
    addOneToCart, 
    removeFromCart 
  } = useContext(CartContext);
  
  // Состояния для формы
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'card',
    deliveryMethod: 'standard',
    notes: ''
  });

  // Состояния для управления процессом
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Обработчик изменений в форме
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Валидация формы
  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city'];
    return requiredFields.every(field => formData[field].trim() !== '');
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверка валидности формы
    if (!validateForm()) {
      alert("Будь ласка, заповніть усі обов'язкові поля");
      return;
    }

    // Подготовка данных для отправки
    const orderData = {
      userId: 2, // FIXME: Подставьте реальный ID пользователя
      addressId: 1, // FIXME: Создайте адрес или используйте существующий
      status: 'PENDING',
      totalAmount: totalPrice,
      paymentStatus: 'PENDING',
      paymentMethod: 'TWINT',
      notes: formData.notes,
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        // FIXME: Очистите корзину после успешного заказа
        // clearCart();
      } else {
        setSubmitError(result.message || 'Виникла помилка при оформленні замовлення');
      }
    } catch (error) {
      setSubmitError('Помилка мережі. Будь ласка, перевірте підключення.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Если заказ успешен, покажем сообщение
  if (submitSuccess) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Замовлення оформлено!</h2>
        <p>Дякуємо за Ваше замовлення. Ми зв'яжемося з Вами найближчим часом.</p>
      </div>
    );
  }


  const CartTable = () => (
    <div className="mb-4">
      <h2 className="h4 mb-3">Ваші товари:</h2>
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Назва товару</th>
              <th className="text-center">Кількість</th>
              <th className="text-end">Ціна</th>
              <th className="text-end">Сума</th>
              <th className="text-center">Дії</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map(item => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td className="text-center">
                  <ButtonGroup size="sm">
                    <Button 
                      variant="outline-secondary"
                      onClick={() => removeFromCart(item.id)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </Button>
                    <Button variant="light" disabled>
                      {item.quantity}
                    </Button>
                    <Button 
                      variant="outline-secondary"
                      onClick={() => addOneToCart(item.id)}
                    >
                      <Plus size={16} />
                    </Button>
                  </ButtonGroup>
                </td>
                <td className="text-end">{item.price.toFixed(2)} CHF</td>
                <td className="text-end">{(item.quantity * item.price).toFixed(2)} CHF</td>
                <td className="text-center">
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => removeAllFromCart(item.id)}
                    title="Видалити товар"
                  >
                    <Trash size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="table-active">
            <tr>
              <td colSpan="3" className="text-end fw-bold">Всього:</td>
              <td className="text-end fw-bold fs-5">{totalPrice.toFixed(2)} CHF</td>
              <td></td>
            </tr>
          </tfoot>
        </Table>
      </div>
    </div>
  );

  if (submitSuccess) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Замовлення оформлено!</h2>
        <p>Дякуємо за Ваше замовлення. Ми зв'яжемося з Вами найближчим часом.</p>
      </div>
    );
  }


  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Оформлення замовлення</h1>
      
      <Container>
        <CartTable />
      </Container>

      {/* Форма оформления заказа */}
      <Container className="d-flex justify-content-center align-items-center my-4">
      <div className="w-50 w-md-75 w-lg-50">
      <Form onSubmit={handleSubmit} className="mb-4">
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Control
              type="text"
              name="firstName"
              placeholder="Ім'я"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Control
              type="text"
              name="lastName"
              placeholder="Прізвище"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Control
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Control
          type="tel"
          name="phone"
          placeholder="Телефон"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          name="address"
          placeholder="Адреса доставки"
          value={formData.address}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Control
              type="text"
              name="city"
              placeholder="Місто"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        {/* <Col md={6}>
          <Form.Group>
            <Form.Control
              type="text"
              name="zipCode"
              placeholder="Индекс"
              value={formData.zipCode}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col> */}
      </Row>

      <Row className="mb-3">
        <Col md={6}>
      <Form.Group className="mb-3">
        <Form.Select 
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
        >
          <option value="card">TWINT</option>
          <option value="cash">CASH</option>
        </Form.Select>
      </Form.Group>
      </Col>

      <Col md={6}>
      <Form.Group className="mb-3">
        <Form.Select
          name="deliveryMethod"
          value={formData.deliveryMethod}
          onChange={handleChange}
        >
          <option value="standard">Самовивіз</option>
          <option value="express">Кур'єр</option>
        </Form.Select>
      </Form.Group>
      </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Control
          as="textarea"
          name="notes"
          placeholder="Додати коментар"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
        />
      </Form.Group>

      {submitError && (
        <Alert variant="danger" className="mb-3">
          {submitError}
        </Alert>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className="w-100"
      >
        {isSubmitting ? 'Оформлення...' : 'Оформити замовлення'}
      </Button>
    </Form>
    </div>
    </Container>
    </div>
  );
};

export default CheckoutPage;