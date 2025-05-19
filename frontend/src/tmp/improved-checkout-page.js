import React, { useState, useContext, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Alert, Container, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthChoice from './AuthChoice';
import CheckoutForm from './CheckoutForm';
import CartProducts from './CartProducts';
import DeliveryOptions from './checkout/DeliveryOptions';
import DeliveryCostCalculator from './DeliveryCostCalculator';
import { apiClient } from '../utils/api';
import { useTranslation } from 'react-i18next';
import { loadUserPreferences } from '../utils/userPreferences';

// Import templates
import {
  consentCheckboxText,
  marketingConsentText,
  requiredConsentError
} from '../templates/dataProcessingTemplates';

// Store configuration
const STORE_ADDRESS = {
  id: 1,
  name: "Store in Nyon",
  address: "Chemin de Pre-Fleuri, 5",
  city: "Nyon",
  workingHours: "Daily 9:00-20:00"
};

const CheckoutPage = () => {
  const { t, i18n } = useTranslation(['checkout', 'auth']);
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const {
    cartItems,
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
  
  // Initialize form data with defaults
  const [formData, setFormData] = useState({
    // Customer info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Account creation
    password: '',
    confirmPassword: '',
    
    // Delivery info
    preferredDeliveryType: 'PICKUP',
    deliveryType: 'PICKUP',
    street: '',
    house: '',
    apartment: '',
    city: '',
    postalCode: '',
    
    // Station delivery
    stationId: '',
    meetingTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    
    // Pickup delivery
    storeId: '1',
    pickupTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    
    // Payment info
    paymentMethod: 'CASH',
    notesClient: '',
    
    // Data consent fields
    dataConsentAccepted: false,
    marketingConsent: false,
    language: i18n.language || 'uk',
    
    // New delivery fields
    deliveryDate: '',
    deliveryTimeSlot: '',
    deliveryCost: 0,
    zoneId: ''
  });

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formValidationError, setFormValidationError] = useState(null);
  const [deliveryCalculation, setDeliveryCalculation] = useState({
    cost: 0,
    isValid: true,
    message: ''
  });

  // Load initial data when user is available
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load railway stations regardless of user state
        const stationsResponse = await apiClient.get('/railway-stations');
        setRailwayStations(stationsResponse.data || []);
        
        if (user) {
          console.log('Loading data for authenticated user:', user.id);
          
          // Set user data
          setFormData(prev => ({
            ...prev,
            firstName: user.firstName || prev.firstName,
            lastName: user.lastName || prev.lastName,
            email: user.email || prev.email,
            phone: user.phone || prev.phone
          }));

          // Load user's saved delivery preferences
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const userPrefs = await loadUserPreferences(token);
              
              if (userPrefs) {
                console.log('Loaded user preferences:', userPrefs);
                
                setFormData(prev => ({
                  ...prev,
                  ...userPrefs
                }));
              }
            } catch (error) {
              console.error('Error loading user preferences:', error);
            }
          }
          
          // Set the checkout flow directly to form for authenticated users
          setCheckoutStep('form');
          setIsGuest(false);
        }
      } catch (error) {
        console.error('Error during initial data loading:', error);
        setSubmitError('Failed to load required data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user]);

  // Update language in form data when i18n.language changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      language: i18n.language
    }));
  }, [i18n.language]);

  // Handle delivery cost calculation
  const handleDeliveryCostCalculated = (calculationResult) => {
    // Update the delivery calculation state
    setDeliveryCalculation(calculationResult);
    
    // Update the form data with the calculated cost
    setFormData(prev => ({
      ...prev,
      deliveryCost: calculationResult.cost
    }));
  };

  // User makes auth choice (guest checkout, login, or register)
  const handleAuthChoice = (choice) => {
    if (choice === 'guest') {
      setIsGuest(true);
      setCheckoutStep('form');
    }
  };

  // Navigate to login page
  const handleLogin = () => {
    navigate('/login', { state: { returnUrl: '/checkout' } });
  };

  // Navigate to register page
  const handleRegister = () => {
    navigate('/register', { state: { returnUrl: '/checkout' } });
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for createAccount checkbox
    if (type === 'checkbox' && name === 'createAccount') {
      setCreateAccount(checked);
      return;
    }

    // Validation for datetime fields
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

    // Handle checkbox fields
    const newValue = type === 'checkbox' ? checked : value;

    // Special handling for delivery type changes
    if (name === 'preferredDeliveryType') {
      setFormData(prev => ({
        ...prev,
        preferredDeliveryType: value,
        deliveryType: value,
        // Reset delivery date and time when delivery type changes
        deliveryDate: '',
        deliveryTimeSlot: ''
      }));
    } else {
      // General case for all other fields
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }
  };

  // Validate the form before submission
  const validateForm = () => {
    // Basic required field validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setFormValidationError(t('validation.missing_fields'));
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormValidationError(t('validation.invalid_email'));
      return false;
    }

    // Phone validation
    const phoneRegex = /^\+[1-9]\d{6,14}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      setFormValidationError(t('validation.invalid_phone'));
      return false;
    }

    // Delivery validation based on type
    if (formData.deliveryType === 'ADDRESS') {
      if (!formData.street || !formData.house || !formData.city || !formData.postalCode) {
        setFormValidationError(t('validation.missing_address'));
        return false;
      }
      
      // Validate postal code
      if (!/^\d{4}$/.test(formData.postalCode)) {
        setFormValidationError(t('validation.invalid_postal_code'));
        return false;
      }
      
      // Check if delivery is valid based on calculation
      if (!deliveryCalculation.isValid) {
        setFormValidationError(deliveryCalculation.message || t('validation.delivery_not_available'));
        return false;
      }
    } else if (formData.deliveryType === 'RAILWAY_STATION') {
      if (!formData.stationId) {
        setFormValidationError(t('validation.missing_station'));
        return false;
      }
    }

    // Delivery date and time validation
    if (!formData.deliveryDate) {
      setFormValidationError(t('validation.missing_delivery_date'));
      return false;
    }

    if (!formData.deliveryTimeSlot) {
      setFormValidationError(t('validation.missing_delivery_time'));
      return false;
    }

    // Account creation validation
    if (isGuest && createAccount) {
      // Password validation
      if (!formData.password || formData.password.length < 8) {
        setFormValidationError(t('register.validation.password_requirements', { ns: 'auth' }));
        return false;
      }
      
      // Confirm password validation
      if (formData.password !== formData.confirmPassword) {
        setFormValidationError(t('register.validation.passwords_mismatch', { ns: 'auth' }));
        return false;
      }
      
      // Data consent validation
      if (!formData.dataConsentAccepted) {
        const errorText = requiredConsentError[formData.language] || requiredConsentError.uk;
        setFormValidationError(errorText || t('register.validation.consent_required', { ns: 'auth' }));
        return false;
      }
    }

    // All validations passed
    setFormValidationError(null);
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setSubmitError(null);
    setFormValidationError(null);

    // Validate form
    if (!validateForm()) {
      window.scrollTo(0, 0); // Scroll to top to show validation error
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        deliveryType: formData.deliveryType,
        totalAmount: totalPrice,
        paymentMethod: formData.paymentMethod,
        notesClient: formData.notesClient,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        // Add delivery cost
        deliveryCost: parseFloat(formData.deliveryCost) || 0,
        // Add delivery date and time slot
        deliveryDate: formData.deliveryDate,
        deliveryTimeSlot: formData.deliveryTimeSlot
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
          console.log('Registration requested during checkout:', {
            email: formData.email,
            hasPassword: !!formData.password,
            consentAccepted: formData.dataConsentAccepted
          });
          
          orderData.shouldRegister = true;
          orderData.password = formData.password;
          orderData.dataConsentAccepted = formData.dataConsentAccepted;
          orderData.marketingConsent = formData.marketingConsent || false;
          orderData.dataConsentVersion = 'v1.0'; // Current version
          orderData.dataConsentDate = new Date().toISOString();
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
            meetingTime: new Date(formData.deliveryDate).toISOString()
          };
          
          // If time slot is in format "09:00-12:00", extract the start time
          if (formData.deliveryTimeSlot) {
            const startTime = formData.deliveryTimeSlot.split('-')[0].trim();
            
            // Create a new date object from delivery date
            const meetingDate = new Date(formData.deliveryDate);
            
            // Parse time components
            const [hours, minutes] = startTime.split(':').map(Number);
            
            // Set time components
            meetingDate.setHours(hours, minutes, 0, 0);
            
            // Update the meeting time
            orderData.stationDelivery.meetingTime = meetingDate.toISOString();
          }
          break;

        case 'PICKUP':
          orderData.pickupDelivery = {
            storeId: parseInt(formData.storeId),
            pickupTime: new Date(formData.deliveryDate).toISOString()
          };
          
          // If time slot is in format "09:00-12:00", extract the start time
          if (formData.deliveryTimeSlot) {
            const startTime = formData.deliveryTimeSlot.split('-')[0].trim();
            
            // Create a new date object from delivery date
            const pickupDate = new Date(formData.deliveryDate);
            
            // Parse time components
            const [hours, minutes] = startTime.split(':').map(Number);
            
            // Set time components
            pickupDate.setHours(hours, minutes, 0, 0);
            
            // Update the pickup time
            orderData.pickupDelivery.pickupTime = pickupDate.toISOString();
          }
          break;

        default:
          throw new Error(`Invalid delivery type: ${formData.deliveryType}`);
      }

      console.log('Sending order data:', orderData);

      // Make the API call to create order
      const response = await apiClient.post('/orders', orderData);
      console.log('Order created successfully:', response);

      // Handle successful registration and auto-login
      if (createAccount && response.user) {
        console.log('New user created:', response.user);
        try {
          const loginResponse = await login(formData.email, formData.password);
          if (loginResponse.success) {
            console.log('Auto-login successful after registration');
          } else {
            console.error('Auto-login failed:', loginResponse.error);
          }
        } catch (loginError) {
          console.error('Auto-login error:', loginError);
        }
      }

      // Show success message and clear cart
      setSubmitSuccess(true);
      clearCart();
      window.scrollTo(0, 0); // Scroll to top to show success message
    } catch (error) {
      console.error('Order submission error:', error);
      setSubmitError(error.message || 'Failed to create order');
      window.scrollTo(0, 0); // Scroll to top to show error message
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

  // Calculate final price including delivery
  const deliveryCost = parseFloat(formData.deliveryCost) || 0;
  const finalPrice = totalPrice + deliveryCost;

  // Render main checkout form
  return (
    <Container className="py-5">
      <h1 className="text-center mb-5">{t('checkout.title')}</h1>
      
      {/* Show error alerts at the top */}
      {(submitError || formValidationError) && (
        <Alert variant="danger" className="mb-4">
          {submitError || formValidationError}
        </Alert>
      )}

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
            {/* Cart Contents */}
            <CartProducts 
              items={cartItems}
              totalPrice={totalPrice}
              onAdd={addOneToCart}
              onRemove={removeFromCart}
              onRemoveAll={removeAllFromCart}
            />

            {/* Customer & Delivery Information */}
            <Row>
              <Col lg={6}>
                {/* Customer Information */}
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
              </Col>
              
              <Col lg={6}>
                {/* Delivery Options */}
                <DeliveryOptions 
                  formData={formData}
                  handleChange={handleChange}
                />

                {/* Delivery Cost Calculator */}
                {formData.deliveryType === 'ADDRESS' && (
                  <DeliveryCostCalculator
                    deliveryType={formData.deliveryType}
                    postalCode={formData.postalCode}
                    canton={formData.canton || 'GE'} // Default canton
                    onCostCalculated={handleDeliveryCostCalculated}
                  />
                )}
              </Col>
            </Row>

            {/* Order Summary Card */}
            <Card className="mb-4 mt-4">
              <Card.Header>
                <h5 className="mb-0">{t('checkout.order_summary')}</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>{t('checkout.subtotal')}:</span>
                  <span>{totalPrice.toFixed(2)} CHF</span>
                </div>
                
                {deliveryCost > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>{t('checkout.delivery_cost')}:</span>
                    <span>{deliveryCost.toFixed(2)} CHF</span>
                  </div>
                )}
                
                <div className="d-flex justify-content-between fw-bold fs-5 mt-3">
                  <span>{t('checkout.total')}:</span>
                  <span>{finalPrice.toFixed(2)} CHF</span>
                </div>
              </Card.Body>
            </Card>

            {/* Submit Button */}
            <div className="d-grid gap-2">
              <Button
                type="submit"
                size="lg"
                variant="primary"
                disabled={isSubmitting || !deliveryCalculation.isValid}
              >
                {isSubmitting ? t('checkout.processing') : t('checkout.submit_order')}
              </Button>
              
              {/* Minimum order warning */}
              {!deliveryCalculation.isValid && (
                <Alert variant="warning" className="mt-2">
                  {deliveryCalculation.message}
                </Alert>
              )}
            </div>
          </div>
        </Form>
      )}
    </Container>
  );
};

export default CheckoutPage;