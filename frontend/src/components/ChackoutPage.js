// src/components/CheckoutPage.js
import { useState, useContext, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Alert, Container, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../utils/api';
import { loadUserPreferences } from '../utils/userPreferences';
import { cleanPhoneNumber } from '../components/common/SimplePhoneInput';


// Components
import AuthChoice from './AuthChoice';
import CustomerInfoForm from './checkout/CustomerInfoForm';
import CartProducts from './CartProducts';
import DeliveryOptions from './checkout/DeliveryOptions';
import DeliveryCostCalculator from './DeliveryCostCalculator';
import OrderSummary from './checkout/OrderSummary';
import PaymentMethodSelector from './PaymentMethodSelector';

/**
 * Main checkout page component
 * Manages the checkout flow and combines all checkout-related components
 */
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
    canton: 'VD',
    street: '',
    house: '',
    apartment: '',
    city: '',
    postalCode: '',

    // Station delivery
    stationId: '',
    deliveryDate: '',

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

  // TWINT payment confirmation
  const [twintPaymentConfirmed, setTwintPaymentConfirmed] = useState(false);
  const [twintPaymentOption, setTwintPaymentOption] = useState('');

  const handleTwintPaymentOptionChange = (option) => {
    setTwintPaymentOption(option);
  };

  // Handle TWINT confirmation change
  const handleTwintConfirmationChange = (isConfirmed) => {
    setTwintPaymentConfirmed(isConfirmed);
  };

  // Handler for TWINT comment changes
  const handleTwintCommentChange = (twintComment) => {
    // Get existing notes without TWINT comment
    const existingNotes = formData.notesClient || '';
    const notesWithoutTwint = existingNotes.replace(/TWINT:[^\n]*\n?/g, '').trim();

    // Add new TWINT comment if provided
    const updatedNotes = twintComment
      ? `${notesWithoutTwint}\n${twintComment}`.trim()
      : notesWithoutTwint;

    // Update form data
    handleChange({
      target: {
        name: 'notesClient',
        value: updatedNotes
      }
    });
  };

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

  useEffect(() => {
    console.log('=== CHECKOUT PAGE DEBUG ===');
    console.log('Delivery type:', formData.deliveryType);
    console.log('Total price:', totalPrice);
    console.log('Delivery calculation:', deliveryCalculation);
    console.log('Submit button disabled:', isSubmitDisabled());
    console.log('==========================');
  }, [formData.deliveryType, totalPrice, deliveryCalculation]);

  // Handle delivery cost calculation
  const handleDeliveryCostCalculated = (calculationResult) => {

    console.log('=== DELIVERY COST CALCULATED ===');
    console.log('Calculation result:', calculationResult);
    console.log('Delivery type:', formData.deliveryType);
    console.log('Total price:', totalPrice);
    console.log('================================');

    // Update the delivery calculation state
    if (calculationResult.deliveryType === formData.deliveryType) {
      // Update the delivery calculation state
      setDeliveryCalculation(calculationResult);

      // Update the form data with the calculated cost
      setFormData(prev => ({
        ...prev,
        deliveryCost: calculationResult.cost
      }));
    } else {
      console.log('⚠️ Ignoring outdated calculation result');
    }
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

    // Reset TWINT confirmation when switching away from TWINT
    if (name === 'paymentMethod') {
      if (value !== 'TWINT' && twintPaymentConfirmed) {
        setTwintPaymentConfirmed(false);
      }
      // Also reset TWINT confirmation when switching to TWINT 
      // (user will need to select radio option)
      if (value === 'TWINT') {
        setTwintPaymentConfirmed(false);
      }
    }


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

  // Update submit button disabled condition
  const isSubmitDisabled = () => {
    // Base conditions
    const baseDisabled = isSubmitting || !deliveryCalculation.isValid;

    // Additional TWINT condition
    const twintDisabled = formData.paymentMethod === 'TWINT' && (twintPaymentOption === '' || twintPaymentOption === undefined);

    const result = baseDisabled || twintDisabled;
    // Debug logging
    console.log('=== SUBMIT BUTTON DEBUG ===');
    console.log('isSubmitting:', isSubmitting);
    console.log('deliveryCalculation.isValid:', deliveryCalculation.isValid);
    console.log('deliveryCalculation:', deliveryCalculation);
    console.log('baseDisabled:', baseDisabled);
    console.log('twintDisabled:', twintDisabled);
    console.log('final result (disabled):', result);
    console.log('===========================');

    return baseDisabled || twintDisabled;
  };

  // Validate the form before submission
  const validateForm = () => {
    let isValid = true;
    let errorMessage = '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+[1-9]\d{6,14}$/;

    // Basic required field validation with specific messages
    if (!formData.firstName?.trim()) {
      errorMessage = t('validation.first_name_required', { ns: 'auth' });
      isValid = false;
    } else if (!formData.lastName?.trim()) {
      errorMessage = t('validation.last_name_required', { ns: 'auth' });
      isValid = false;
    } else if (!formData.email?.trim()) {
      errorMessage = t('validation.email_required', { ns: 'auth' });
      isValid = false;
    } else if (!formData.phone?.trim()) {
      errorMessage = t('validation.phone_required', { ns: 'auth' });
      isValid = false;
    }

    // Email validation
    else if (!emailRegex.test(formData.email)) {
      errorMessage = t('validation.invalid_email');
      isValid = false;
    }

    // Phone validation
    else if (!formData.phone?.trim() || formData.phone === '+') {
      errorMessage = t('validation.invalid_phone');
      isValid = false;
    }

    // Payment method validation
    else if (!formData.paymentMethod) {
      errorMessage = t('validation.payment_method_required');
      isValid = false;
    }

    // TWINT specific validation
    else if (formData.paymentMethod === 'TWINT' &&
      (twintPaymentOption === '' || twintPaymentOption === undefined)) {
      errorMessage = t('validation.twint_option_required', 'Please select a TWINT payment option');
      isValid = false;
    }

    // Delivery validation based on type
    else if (formData.deliveryType === 'ADDRESS') {
      if (!formData.street?.trim()) {
        errorMessage = t('validation.street_required');
        isValid = false;
      } else if (!formData.house?.trim()) {
        errorMessage = t('validation.house_required');
        isValid = false;
      } else if (!formData.city?.trim()) {
        errorMessage = t('validation.city_required');
        isValid = false;
      } else if (!formData.postalCode?.trim()) {
        errorMessage = t('validation.postal_code_required');
        isValid = false;
      } else if (!/^\d{4}$/.test(formData.postalCode)) {
        errorMessage = t('validation.invalid_postal_code');
        isValid = false;
      } else if (!deliveryCalculation.isValid) {
        errorMessage = deliveryCalculation.message || t('validation.delivery_not_available');
        isValid = false;
      }
    } else if (formData.deliveryType === 'RAILWAY_STATION') {
      console.log('=== RAILWAY VALIDATION ===');
      console.log('Station ID:', formData.stationId);
      console.log('Total price:', totalPrice);
      console.log('Delivery calculation:', deliveryCalculation);
      console.log('=========================');

      if (!formData.stationId) {
        errorMessage = t('validation.station_required');
        isValid = false;
      }
    } else if (formData.deliveryType === 'PICKUP') {
      if (!formData.storeId) {
        errorMessage = t('validation.store_required');
        isValid = false;
      }
    }

    // Delivery date and time validation
    else if (!formData.deliveryDate) {
      errorMessage = t('validation.delivery_date_required');
      isValid = false;
    }

    // Time slot validation only for pickup
    else if (formData.deliveryType === 'PICKUP' && !formData.deliveryTimeSlot) {
      errorMessage = t('validation.delivery_time_required');
      isValid = false;
    }

    // Account creation validation
    else if (isGuest && createAccount) {
      if (!formData.password || formData.password.length === 0) {
        errorMessage = t('register.validation.password_required', { ns: 'auth' });
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        errorMessage = t('register.validation.passwords_mismatch', { ns: 'auth' });
        isValid = false;
      } else if (!formData.dataConsentAccepted) {
        errorMessage = t('register.validation.consent_required', { ns: 'auth' });
        isValid = false;
      }
    }

    setFormValidationError(isValid ? null : errorMessage);
    return isValid;
  };

  // Prepare time from time slot string
  const prepareTimeFromSlot = (dateString, timeSlotString) => {
    if (!timeSlotString) return dateString;

    // If time slot is in format "09:00-12:00", extract the start time
    const startTime = timeSlotString.split('-')[0].trim();

    // Create a new date object from delivery date
    const date = new Date(dateString);

    // Parse time components
    const [hours, minutes] = startTime.split(':').map(Number);

    // Set time components
    date.setHours(hours, minutes, 0, 0);

    return date.toISOString();
  };

  useEffect(() => {
    // Force recalculation when total price changes
    console.log('🔄 Total price changed, forcing delivery calculation...');

    // Принудительно пересчитать стоимость доставки
    const DELIVERY_MINIMUMS = {
      PICKUP: 0,
      RAILWAY_STATION: 20,
      ADDRESS: 100
    };

    const minimumOrder = DELIVERY_MINIMUMS[formData.deliveryType] || 0;
    let cost = 0;
    let isValid = true;
    let message = '';

    switch (formData.deliveryType) {
      case 'PICKUP':
        cost = 0;
        isValid = true;
        message = 'Безкоштовний самовивіз';
        break;

      case 'RAILWAY_STATION':
        cost = 0;
        if (totalPrice < minimumOrder) {
          isValid = false;
          const needed = minimumOrder - totalPrice;
          message = `Мінімальне замовлення для доставки на ЖД станцію - ${minimumOrder} CHF. Додайте ще продукції на ${needed.toFixed(2)} CHF.`;
        } else {
          isValid = true;
          message = 'Безкоштовна доставка на ЖД станцію';
        }
        break;

      case 'ADDRESS':
        if (totalPrice < minimumOrder) {
          isValid = false;
          const needed = minimumOrder - totalPrice;
          message = `Мінімальне замовлення для адресної доставки - ${minimumOrder} CHF. Додайте ще продукції на ${needed.toFixed(2)} CHF.`;
          cost = 0;
        } else if (totalPrice >= 200) {
          cost = 0;
          isValid = true;
          message = 'Безкоштовна доставка для замовлень від 200 CHF';
        } else {
          cost = 10;
          isValid = true;
          message = `Вартість доставки: ${cost} CHF`;
        }
        break;
    }

    console.log('🎯 Manual calculation result:', { cost, isValid, message, deliveryType: formData.deliveryType, totalPrice });

    // Обновить состояние
    setDeliveryCalculation({
      cost,
      isValid,
      message,
      minimumOrderAmount: minimumOrder,
      deliveryType: formData.deliveryType
    });

    setFormData(prev => ({
      ...prev,
      deliveryCost: cost
    }));

  }, [totalPrice, formData.deliveryType]);

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
        deliveryTimeSlot: formData.deliveryTimeSlot,
        // Add TWINT confirmation data
        ...(formData.paymentMethod === 'TWINT' && {
          twintPaymentConfirmed: twintPaymentConfirmed,
          twintConfirmationTime: new Date().toISOString()
        }),
        userLanguage: i18n.language
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
            meetingTime: formData.deliveryDate,
          };
          break;

        case 'PICKUP':
          orderData.pickupDelivery = {
            storeId: parseInt(formData.storeId),
            pickupTime: prepareTimeFromSlot(formData.deliveryDate, formData.deliveryTimeSlot)
          };
          break;

        default:
          throw new Error(`Invalid delivery type: ${formData.deliveryType}`);
      }

      const cleanedOrderData = {
        ...orderData,
        phone: cleanPhoneNumber(orderData.phone)
      };

      console.log('Sending order data:', cleanedOrderData);

      // Make the API call to create order
      const response = await apiClient.post('/orders', cleanedOrderData);
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

  // Handle notes change
  const handleNotesChange = (e) => {
    setFormData(prev => ({
      ...prev,
      notesClient: e.target.value
    }));
  };

  // Render loading state
  if (loading) {
    return <Container className="py-5 text-center"><p>{t('general.loading', { ns: 'common' })}</p></Container>;
  }

  // Render empty cart state
  if (cartItems.length === 0 && !submitSuccess) {
    return (
      <Container className="py-5 text-center">
        <h2>{t('cart.empty', { ns: 'common' })}</h2>
        <Button variant="primary" className="mt-3" onClick={() => navigate('/')}>
          {t('cart.continueShopping', { ns: 'common' })}
        </Button>
      </Container>
    );
  }

  // Render success state
  if (submitSuccess) {
    return (
      <Container className="py-5 text-center">
        <h2 className="text-success mb-4">{t('checkout.order_success')}</h2>
        <p>{t('checkout.order_success_message')}</p>
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

            {/* Customer Information */}
            <CustomerInfoForm
              formData={formData}
              handleChange={handleChange}
              isAuthenticated={!!user}
              isGuest={isGuest}
              createAccount={createAccount}
              onCreateAccountChange={setCreateAccount}
            />

            {/* Delivery Options */}
            <DeliveryOptions
              formData={formData}
              handleChange={handleChange}
              railwayStations={railwayStations}
            />

            {/* Payment Method */}
            <section className="mb-5">
              <h4 className="mb-3">{t('checkout.payment_method')}</h4>
              <PaymentMethodSelector
                selectedMethod={formData.paymentMethod}
                onChange={handleChange}
                onTwintConfirmationChange={handleTwintConfirmationChange}
                onTwintCommentChange={handleTwintCommentChange}
                onTwintPaymentOptionChange={handleTwintPaymentOptionChange}
              />
            </section>

            {/* Order Notes */}
            {/* The order notes section will now automatically include TWINT payment details */}
            <section className="mb-5">
              <h4 className="mb-3">{t('checkout.order_notes')}</h4>
              <Card>
                <Card.Body>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notesClient"
                    value={formData.notesClient}
                    onChange={handleChange}
                    placeholder={t('checkout.order_notes')}
                  />
                  <Form.Text className="text-muted">
                    {t('checkout.order_notes_hint', 'Автоматично додається інформація про спосіб оплати TWINT')}
                  </Form.Text>
                </Card.Body>
              </Card>
            </section>

            {/* Delivery Cost Calculator */}
            <DeliveryCostCalculator
              deliveryType={formData.deliveryType}
              postalCode={formData.postalCode}
              canton={formData.canton || 'VD'}
              onCostCalculated={handleDeliveryCostCalculated}
            />


            {/* Order Summary Card */}
            <OrderSummary
              subtotal={totalPrice}
              deliveryCost={deliveryCost}
              finalPrice={finalPrice}
            />

            {/* Submit Button */}
            <div className="d-grid gap-2">
              <Button
                type="submit"
                size="lg"
                variant="danger"
                disabled={isSubmitDisabled()}
              >
                {isSubmitting ? t('checkout.processing') : t('checkout.submit_order')}
              </Button>

              {/* Minimum order warning */}
              {/* {!deliveryCalculation.isValid && (
                <Alert variant="warning" className="mt-2">
                  {deliveryCalculation.message}
                </Alert>
              )} */}
            </div>
          </div>
        </Form>
      )}
    </Container>
  );
};

export default CheckoutPage;