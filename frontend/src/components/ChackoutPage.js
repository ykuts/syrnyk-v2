import React, { useState, useContext, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Alert, ButtonGroup, Container, Table } from 'react-bootstrap';
import { Trash, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CheckoutForm from './CheckoutForm';
import { getApiUrl } from '../config';
import { apiClient } from '../utils/api';

const STORE_ADDRESS = {
  id: 1,
  name: "Магазин у Nyon",
  address: "Chemin de Pre-Fleuri, 5",
  city: "Nyon",
  workingHours: "щодня 9:00-20:00"
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    meetingTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), 
    storeId: '1',
    pickupTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    paymentMethod: 'TWINT',
    notesClient: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prevState => ({
        ...prevState,
        firstName: user.firstName || prevState.firstName,
        lastName: user.lastName || prevState.lastName,
        email: user.email || prevState.email,
        phone: user.phone || prevState.phone,
        ...(user.preferredDeliveryLocation && {
          deliveryType: 'ADDRESS',
        })
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchDeliveryData = async () => {
      try {
        const response = await fetch(getApiUrl('/api/railway-stations'));
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
                    title="Remove item"
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
    
    // Special handling for date fields
    if (name === 'meetingTime' || name === 'pickupTime') {
      // Check if the value is not empty
      if (value) {
        const selectedDate = new Date(value);
        const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // minimum next day
        
        // If selected date is earlier than minimum, set to minimum
        if (selectedDate < minDate) {
          setFormData(prevState => ({
            ...prevState,
            [name]: minDate.toISOString().slice(0, 16)
          }));
          return;
        }
      }
    }
    
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
      // Prepare order data
      const orderData = {
        userId: user?.id,
        deliveryType: formData.deliveryType,
        totalAmount: totalPrice,
        paymentMethod: formData.paymentMethod,
        notesClient: formData.notes,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };
  
      // Add customer data for non-authenticated users
      if (!user) {
        orderData.customer = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        };
      }
  
      // Add delivery-specific data
      if (formData.deliveryType === 'ADDRESS') {
        orderData.addressDelivery = {
          street: formData.street,
          house: formData.house,
          apartment: formData.apartment || null,
          city: formData.city,
          postalCode: formData.postalCode
        };
      } else if (formData.deliveryType === 'RAILWAY_STATION') {
        orderData.stationDelivery = {
          stationId: parseInt(formData.stationId),
          meetingTime: new Date(formData.meetingTime).toISOString()
        };
      } else if (formData.deliveryType === 'PICKUP') {
        orderData.pickupDelivery = {
          storeId: 1,
          pickupTime: new Date(formData.pickupTime).toISOString()
        };
      }
  
      console.log('Sending order data:', orderData);
  
      // Use apiClient utility to make the request
      const headers = {};
      if (user?.token) {
        headers.Authorization = `Bearer ${user.token}`;
      }
      
      const result = await apiClient.post('/orders', orderData, headers);
      console.log('Order created:', result);
  
      setSubmitSuccess(true);
      clearCart();
      
    } catch (error) {
      console.error('Order submission error:', error);
      setSubmitError(error.message || 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* const getDeliveryData = () => {
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
  }; */

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <p>Loading...</p>
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
          Повернутись до покупок
        </Button>
      </Container>
    );
  }

  if (submitSuccess) {
    return (
      <Container className="py-5 text-center">
        <h2 className="text-success mb-4">Order successfully placed!</h2>
        <p>Thank you for your order. We will contact you shortly.</p>
        <Button 
          variant="primary" 
          className="mt-3"
          onClick={() => navigate('/')}
        >
          Return to Shopping
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
            isAuthenticated={!!user}
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
              {isSubmitting ? 'Оформлюємо...' : 'Оформити замовлення'}
            </Button>
          </div>
        </div>
      </Form>
    </Container>
  );
};

export default CheckoutPage;