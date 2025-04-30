import React, { useState, useContext, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Alert, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthChoice from './AuthChoice';
import CheckoutForm from './CheckoutForm';
import CartTable from './CartTable';
import { apiClient } from '../utils/api';
import { useTranslation } from 'react-i18next';

const STORE_ADDRESS = {
  id: 1,
  name: "Store in Nyon",
  address: "Chemin de Pre-Fleuri, 5",
  city: "Nyon",
  workingHours: "Daily 9:00-20:00"
};

const CheckoutPage = () => {
  const { t } = useTranslation('checkout');
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
  const [checkoutStep, setCheckoutStep] = useState('initial');
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
    confirmPassword: '', 
    preferredDeliveryType: 'PICKUP',
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

  // Load initial data when user is available
  useEffect(() => {
    const loadInitialData = async () => {
      if (user) {
        console.log('Loading data for user:', user);

        // Set user data
        setFormData(prev => ({
          ...prev,
          firstName: user.firstName || prev.firstName,
          lastName: user.lastName || prev.lastName,
          email: user.email || prev.email,
          phone: user.phone || prev.phone
        }));

        // Load delivery preferences
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const response = await apiClient.get('/users/delivery-preferences', {
              'Authorization': `Bearer ${token}`
            });
            console.log('Loaded preferences:', response);

            if (response.preferences) {
              const preferences = response.preferences;
              setFormData(prev => ({
                ...prev,
                preferredDeliveryType: preferences.type || 'PICKUP',
                deliveryType: preferences.type || 'PICKUP',
                street: preferences.address?.street || '',
                house: preferences.address?.house || '',
                apartment: preferences.address?.apartment || '',
                city: preferences.address?.city || '',
                postalCode: preferences.address?.postalCode || '',
                stationId: preferences.stationId ? preferences.stationId.toString() : '',
                storeId: preferences.storeId?.toString() || '1'
              }));
            }
          } catch (error) {
            console.error('Error loading preferences:', error);
          }
        }
        setCheckoutStep('form');
        setIsGuest(false);
      }
    };

    loadInitialData();
  }, [user]);

  // Load railway stations
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

  // Debug log for formData changes
  useEffect(() => {
    console.log('Current formData:', formData);
  }, [formData]);

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

    if (name === 'preferredDeliveryType') {
      setFormData(prev => ({
        ...prev,
        preferredDeliveryType: value,
        deliveryType: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
  
    try {
      if (isGuest && createAccount) {
        if (!formData.password || !formData.confirmPassword) {
          throw new Error('Будь ласка, введіть пароль та його підтвердження');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Паролі не співпадають');
        }
        if (!formData.password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
          throw new Error('Пароль повинен містити мінімум 8 символів та включати літери і цифри');
        }
      }

      const orderData = {
        deliveryType: formData.preferredDeliveryType,
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
      switch (formData.preferredDeliveryType) {
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
          throw new Error(`Invalid delivery type: ${formData.preferredDeliveryType}`);
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
    return <Container className="py-5 text-center"><p>{t('general.loading', {ns: 'common'})}</p></Container>;
  }

  // Render empty cart state
  if (cartItems.length === 0 && !submitSuccess) {
    return (
      <Container className="py-5 text-center">
        <h2>{t('cart.empty', {ns: 'common'})}</h2>
        <Button variant="primary" className="mt-3" onClick={() => navigate('/')}>
        {t('cart.continueShopping', {ns: 'common'})}
        </Button>
      </Container>
    );
  }

  // Render success state
  if (submitSuccess) {
    return (
      <Container className="py-5 text-center">
        <h2 className="text-success mb-4">{t('checkout.order_success')}</h2>
        <p>{t('checkout.success_message')}</p>
        <Button variant="primary" className="mt-3" onClick={() => navigate('/')}>
        {t('checkout.continue_shopping')}
        </Button>
      </Container>
    );
  }

  // Render main checkout form
  return (
    <Container className="py-5">
      <h1 className="text-center mb-5">{t('checkout.title')}</h1>

      {/* Show auth choice for non-authenticated users at initial step */}
      {checkoutStep === 'initial' && !user && (
        <div className="container-sm mb-4" style={{ maxWidth: '672px' }}>
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
          <div className="container mx-auto" style={{ maxWidth: '768px' }}>
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
              deliveryType={formData.preferredDeliveryType}
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
                {isSubmitting ? t('checkout.processing') : t('checkout.submit_order')}
              </Button>
            </div>
          </div>
        </Form>
      )}
    </Container>
  );
};

export default CheckoutPage;