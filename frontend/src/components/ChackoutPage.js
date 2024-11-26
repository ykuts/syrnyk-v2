import React, { useState, useContext, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { Form, Button, Alert, ButtonGroup, Container, Table } from 'react-bootstrap';
import { Trash, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CheckoutForm from './CheckoutForm';

const STORE_ADDRESS = {
  id: 1,
  name: "Магазин у Nyon",
  address: "Chemin de Pre-Fleuri, 5",
  city: "Nyon",
  workingHours: "щодня 9.00-20.00"
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    totalPrice, 
    removeAllFromCart, 
    addOneToCart, 
    removeFromCart,
    clearCart 
  } = useContext(CartContext);

  const [railwayStations, setRailwayStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    deliveryType: 'PICKUP',
    street: '',
    house: '',
    apartment: '',
    city: '',
    postalCode: '',
    stationId: '',
    meetingTime: '',
    storeId: '',
    pickupTime: '',
    paymentMethod: 'TWINT',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchDeliveryData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/railway-stations');
        const result = await response.json();
        setRailwayStations(result.data);
      } catch (error) {
        console.error('Error fetching delivery data:', error);
        setSubmitError('Failed to load delivery options');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryData();
  }, []);

  const CartTable = () => (
    <div className="mb-5">
      <h2 className="h4 mb-4">Ваші товари</h2>
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
                <td>{item.name}</td>
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
            <tr className="table-active">
              <td colSpan="3" className="text-end fw-bold">Усього:</td>
              <td className="text-end fw-bold fs-5">{totalPrice.toFixed(2)} CHF</td>
              <td></td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          },
          deliveryType: formData.deliveryType,
          deliveryData: getDeliveryData(),
          items: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: totalPrice,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          status: 'PENDING',
          paymentStatus: 'PENDING'
        })
      });

      if (!response.ok) throw new Error('Failed to create order');

      setSubmitSuccess(true);
      clearCart();
      
    } catch (error) {
      setSubmitError('Помилка при оформленні замовлення. Спробуйте ще раз пізніше.');
      console.error('Order submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDeliveryData = () => {
    switch (formData.deliveryType) {
      case 'ADDRESS':
        return {
          street: formData.street,
          house: formData.house,
          apartment: formData.apartment,
          city: formData.city,
          postalCode: formData.postalCode
        };
      case 'RAILWAY_STATION':
        return {
          stationId: parseInt(formData.stationId),
          meetingTime: formData.meetingTime
        };
      case 'PICKUP':
        return {
          storeId: parseInt(formData.storeId),
          pickupTime: formData.pickupTime
        };
      default:
        return {};
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <p>Завантаження...</p>
      </Container>
    );
  }

  if (cartItems.length === 0 && !submitSuccess) {
    return (
      <Container className="py-5 text-center">
        <h2>Ваш кошик порожній</h2>
        <Button 
          variant="primary" 
          className="mt-3"
          onClick={() => navigate('/')}
        >
          Повернутися до покупок
        </Button>
      </Container>
    );
  }

  if (submitSuccess) {
    return (
      <Container className="py-5 text-center">
        <h2 className="text-success mb-4">Замовлення успішно оформлено!</h2>
        <p>Дякуємо за Ваше замовлення. Ми зв'яжемося з Вами найближчим часом.</p>
        <Button 
          variant="primary" 
          className="mt-3"
          onClick={() => navigate('/')}
        >
          Повернутися до покупок
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="text-center mb-5">Оформлення замовлення</h1>
      
      <Form onSubmit={handleSubmit}>
        <div className="max-w-3xl mx-auto">
          <CartTable />
          
          <CheckoutForm 
            formData={formData}
            handleChange={handleChange}
            deliveryType={formData.deliveryType}
            railwayStations={railwayStations}
            stores={[STORE_ADDRESS]}
          />

          {submitError && (
            <Alert variant="danger" className="mb-4">
              {submitError}
            </Alert>
          )}

          <div className="d-grid gap-2">
            <Button
              type="submit"
              size="lg"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Оформлення...' : 'Оформити замовлення'}
            </Button>
          </div>
        </div>
      </Form>
    </Container>
  );
};

export default CheckoutPage;