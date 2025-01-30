import React, { useState, useContext, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Alert, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthChoice from './AuthChoice';
import CheckoutForm from './CheckoutForm';
import CartTable from './CartTable';
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
  const { user, login } = useAuth();
  const { cartItems, 
          totalPrice, 
          clearCart,
          addOneToCart,    
          removeFromCart, 
          removeAllFromCart 
        
        } = useContext(CartContext);

  // Checkout flow states
  const [checkoutStep, setCheckoutStep] = useState('initial'); // 'initial', 'form', 'complete'
  const [isGuest, setIsGuest] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);

  // Data states
  const [railwayStations, setRailwayStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
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

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
      setCheckoutStep('form');
      setIsGuest(false);
    }
  }, [user]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await apiClient.get('/railway-stations');
        setRailwayStations(response.data);
      } catch (error) {
        console.error('Error fetching stations:', error);
        setSubmitError('Failed to load delivery options');
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  const handleAuthChoice = (choice) => {
    if (choice === 'guest') {
      setIsGuest(true);
      setCheckoutStep('form');
    }
  };

  const handleLogin = () => {
    navigate('/login', { state: { returnUrl: '/checkout' } });
  };

  const handleRegister = () => {
    navigate('/register', { state: { returnUrl: '/checkout' } });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'createAccount') {
      setCreateAccount(checked);
      return;
    }

    if ((name === 'meetingTime' || name === 'pickupTime') && value) {
      const selectedDate = new Date(value);
      const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      if (selectedDate < minDate) {
        setFormData(prev => ({
          ...prev,
          [name]: minDate.toISOString().slice(0, 16)
        }));
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
  
    try {
      const orderData = {
        deliveryType: formData.deliveryType,
        totalAmount: totalPrice,
        paymentMethod: formData.paymentMethod,
        notesClient: formData.notesClient,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };
  
      // For guest orders, add customer info
      if (!user) {
        orderData.customer = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        };
  
        // If guest wants to create account
        if (createAccount && formData.password) {
          console.log('Registration requested:', {
            email: formData.email,
            hasPassword: !!formData.password,
            createAccount
          });
          orderData.shouldRegister = true;
          orderData.password = formData.password;
        }
      } else {
        orderData.userId = user.id;
      }
  
      // Add delivery information based on type
      switch (formData.deliveryType) {
        case 'ADDRESS':
          orderData.addressDelivery = {
            street: formData.street,
            house: formData.house,
            apartment: formData.apartment || null,
            city: formData.city,
            postalCode: formData.postalCode
          };
          break;
  
        case 'RAILWAY_STATION':
          orderData.stationDelivery = {
            stationId: parseInt(formData.stationId),
            meetingTime: new Date(formData.meetingTime).toISOString()
          };
          break;
  
        case 'PICKUP':
          orderData.pickupDelivery = {
            storeId: parseInt(formData.storeId),
            pickupTime: new Date(formData.pickupTime).toISOString()
          };
          break;
  
        default:
          throw new Error(`Invalid delivery type: ${formData.deliveryType}`);
      }
  
      console.log('Sending order data:', orderData);
  
      try {
        // Make the API call
        const response = await apiClient.post('/orders', orderData);
        console.log('Order response:', response);
  
        // Handle successful registration and auto-login
        if (createAccount && response.user) {
          console.log('New user created:', response.user);
          try {
            const loginResponse = await login(formData.email, formData.password);
            if (loginResponse.success) {
              console.log('Auto-login successful');
            } else {
              console.error('Auto-login failed:', loginResponse.error);
            }
          } catch (loginError) {
            console.error('Auto-login error:', loginError);
          }
        }
  
        setSubmitSuccess(true);
        clearCart();
      } catch (apiError) {
        console.error('API error:', apiError);
        throw apiError;
      }
    } catch (error) {
      console.error('Order submission error:', error);
      setSubmitError(error.message || 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading state
  if (loading) {
    return <Container className="py-5 text-center"><p>Завантаження...</p></Container>;
  }

  // Render empty cart state
  if (cartItems.length === 0 && !submitSuccess) {
    return (
      <Container className="py-5 text-center">
        <h2>Ваш кошик порожній</h2>
        <Button variant="primary" className="mt-3" onClick={() => navigate('/')}>
          Повернутись до покупок
        </Button>
      </Container>
    );
  }

  // Render success state
  if (submitSuccess) {
    return (
      <Container className="py-5 text-center">
        <h2 className="text-success mb-4">Замовлення успішно оформлено!</h2>
        <p>Дякуємо за Ваше замовлення. Ми зв'яжемось з вами найближчим часом.</p>
        <Button variant="primary" className="mt-3" onClick={() => navigate('/')}>
          Продовжити покупки
        </Button>
      </Container>
    );
  }

  // Render main checkout form
  return (
    <Container className="py-5">
      <h1 className="text-center mb-5">Оформлення замовлення</h1>

      {/* Show auth choice for non-authenticated users at initial step */}
      {checkoutStep === 'initial' && !user && (
        <div className="max-w-2xl mx-auto mb-4">
          <AuthChoice 
            onChoice={handleAuthChoice}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        </div>
      )}

      {/* Show checkout form when appropriate */}
      {checkoutStep === 'form' && (
        <Form onSubmit={handleSubmit}>
          <div className="max-w-3xl mx-auto">
          <CartTable 
              items={cartItems}
              totalPrice={totalPrice}
              onAdd={addOneToCart}
              onRemove={removeFromCart}
              onRemoveAll={removeAllFromCart}
/>

            <CheckoutForm 
              formData={formData}
              handleChange={handleChange}
              deliveryType={formData.deliveryType}
              railwayStations={railwayStations}
              stores={[STORE_ADDRESS]}
              isAuthenticated={!!user}
              isGuest={isGuest}
              createAccount={createAccount}
              onCreateAccountChange={(checked) => setCreateAccount(checked)}
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
      )}
    </Container>
  );
};

export default CheckoutPage;