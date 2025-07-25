// src/components/CheckoutPage.js
import { useState, useContext, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Alert, Container, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../utils/api';
import { loadUserPreferences, applyUserPreferencesToCheckout  } from '../utils/userPreferences';
import { cleanPhoneNumber } from '../components/common/SimplePhoneInput';
import { useScrollToTop } from '../hooks/useScrollToTop';


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

  // Validation
  const [fieldValidation, setFieldValidation] = useState({
    firstName: { isValid: true, message: '' },
    lastName: { isValid: true, message: '' },
    email: { isValid: true, message: '' },
    phone: { isValid: true, message: '' },
    paymentMethod: { isValid: true, message: '' },
    deliveryType: { isValid: true, message: '' },
    // Address fields
    street: { isValid: true, message: '' },
    house: { isValid: true, message: '' },
    city: { isValid: true, message: '' },
    postalCode: { isValid: true, message: '' },
    // Station delivery
    stationId: { isValid: true, message: '' },
    // Pickup delivery
    storeId: { isValid: true, message: '' },
    // Date and time
    deliveryDate: { isValid: true, message: '' },
    deliveryTimeSlot: { isValid: true, message: '' },
    // Account creation
    password: { isValid: true, message: '' },
    confirmPassword: { isValid: true, message: '' },
    dataConsentAccepted: { isValid: true, message: '' },
    // TWINT
    twintOption: { isValid: true, message: '' }
  });

  // Checkout flow states
  const [checkoutStep, setCheckoutStep] = useState('initial');
  const [isGuest, setIsGuest] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);

  // Data states
  const [railwayStations, setRailwayStations] = useState([]);
  const [loading, setLoading] = useState(true);

  /* // Initialize form data with defaults
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
  }); */

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
    canton: 'VD', // Default canton
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
    pickupTime: '',

    // Payment and other info
    paymentMethod: '',
    notesClient: '',
    language: i18n.language,

    // Consent fields for account creation
    dataConsentAccepted: false,
    marketingConsent: false,

    // Calculated fields
    deliveryCost: 0
  });

  // Other state variables...
  const [deliveryCalculation, setDeliveryCalculation] = useState({
    isValid: true,
    cost: 0,
    message: '',
    minimumOrderAmount: 0,
    deliveryType: 'PICKUP'
  });

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formValidationError, setFormValidationError] = useState(null);

  // Автопрокрутка при успехе или ошибке
  useScrollToTop(submitSuccess);
  useScrollToTop(!!submitError);
  /* const [deliveryCalculation, setDeliveryCalculation] = useState({
    cost: 0,
    isValid: true,
    message: ''
  }); */

  // TWINT payment confirmation
  const [twintPaymentConfirmed, setTwintPaymentConfirmed] = useState(false);
  const [twintPaymentOption, setTwintPaymentOption] = useState('');
  const [twintAdminComment, setTwintAdminComment] = useState(''); // TWINT status for admin

  const handleTwintPaymentOptionChange = (option) => {
    setTwintPaymentOption(option);
  };

  // Handle TWINT confirmation change
  const handleTwintConfirmationChange = (isConfirmed) => {
    setTwintPaymentConfirmed(isConfirmed);
  };

  /* // Handler for TWINT comment changes
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
  }; */

  // Handler for TWINT admin comment (hidden from client)
  const handleTwintCommentChange = (twintStatus) => {
    setTwintAdminComment(twintStatus);
  };

  // Function to prepare admin notes by combining client comment + TWINT status
  const prepareAdminNotes = () => {
    const clientComment = formData.notesClient?.trim() || '';
    const twintComment = twintAdminComment?.trim() || '';

    // Combine client comment and TWINT status for admin
    const adminNotes = [];

    /* if (clientComment) {
      adminNotes.push(`Коментар клієнта: ${clientComment}`);
    } */

    if (twintComment) {
      adminNotes.push(`TWINT статус: ${twintComment}`);
    }

    return adminNotes.join('\n');
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

                // Apply user preferences to form data using the utility function
                setFormData(prev => {
                  const updatedFormData = applyUserPreferencesToCheckout(prev, userPrefs);
                  console.log('Applied user preferences to form:', updatedFormData);
                  return updatedFormData;
                });
              } else {
                console.log('No user preferences found, using defaults');
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

  // Add this useEffect after the existing ones to trigger validation when address is loaded from preferences
useEffect(() => {
  // Trigger postal code validation when address delivery preferences are loaded
  if (formData.deliveryType === 'ADDRESS' && 
      formData.postalCode && 
      formData.canton && 
      !loading) {
    
    console.log('🔍 Triggering postal code validation for loaded preferences:', {
      postalCode: formData.postalCode,
      canton: formData.canton,
      deliveryType: formData.deliveryType
    });

    // Simulate a delivery cost calculation to trigger validation
    // This will cause the AddressDeliveryCheckout component to validate the postal code
    setDeliveryCalculation(prev => ({
      ...prev,
      // Reset validation to trigger re-calculation
      isValid: true,
      message: 'Checking postal code...',
      deliveryType: 'ADDRESS'
    }));
  }
}, [formData.deliveryType, formData.postalCode, formData.canton, loading]);

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

  
  // Handle address delivery validation
  const handleAddressDeliveryValidation = (validationResult) => {
  console.log('Address delivery validation result:', validationResult);
  
  // Update delivery calculation with address-specific validation
  setDeliveryCalculation(prev => ({
    ...prev,
    isValid: validationResult.isValid,
    message: validationResult.message,
    minimumOrderAmount: validationResult.minimumOrderAmount || 0,
    deliveryType: validationResult.deliveryType
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

      // Clear validation for delivery-specific fields when delivery type changes
      setFieldValidation(prev => ({
        ...prev,
        street: { isValid: true, message: '' },
        house: { isValid: true, message: '' },
        city: { isValid: true, message: '' },
        postalCode: { isValid: true, message: '' },
        stationId: { isValid: true, message: '' },
        storeId: { isValid: true, message: '' }
      }));

    } else {
      // General case for all other fields
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }

    // Real-time validation for specific fields (skip phone as it's handled by SimplePhoneInput)
    if (name !== 'phone' && name !== 'preferredDeliveryType') {
      validateField(name, newValue);
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

  useEffect(() => {
  if (submitSuccess) {
    // Прокрутка к верху при успешном заказе
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}, [submitSuccess]);

  // Validate the form before submission
  /* const validateForm = () => {
    let isValid = true;
    let errorMessage = '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+[1-9]\d{9,14}$/;

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

    // Strict phone validation
  else if (!formData.phone?.trim() || 
           formData.phone === '+' || 
           !phoneRegex.test(cleanPhoneNumber(formData.phone))) {
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

    setFormValidationError(isValid ? '' : errorMessage);
    return isValid;
  }; */

  const validateForm = () => {
    let isValid = true;
    let newValidation = { ...fieldValidation };

    // Reset all validations
    Object.keys(newValidation).forEach(key => {
      newValidation[key] = { isValid: true, message: '' };
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+[1-9]\d{9,14}$/;

    // Basic required field validation
    if (!formData.firstName?.trim()) {
      newValidation.firstName = {
        isValid: false,
        message: t('validation.first_name_required', { ns: 'auth' })
      };
      isValid = false;
    }

    if (!formData.lastName?.trim()) {
      newValidation.lastName = {
        isValid: false,
        message: t('validation.last_name_required', { ns: 'auth' })
      };
      isValid = false;
    }

    if (!formData.email?.trim()) {
      newValidation.email = {
        isValid: false,
        message: t('validation.email_required', { ns: 'auth' })
      };
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newValidation.email = {
        isValid: false,
        message: t('validation.invalid_email')
      };
      isValid = false;
    }

    if (!formData.phone?.trim()) {
      newValidation.phone = {
        isValid: false,
        message: t('validation.phone_required', { ns: 'auth' })
      };
      isValid = false;
    } else if (formData.phone === '+' || !phoneRegex.test(cleanPhoneNumber(formData.phone))) {
      newValidation.phone = {
        isValid: false,
        message: t('validation.invalid_phone')
      };
      isValid = false;
    }

    // Payment method validation
    if (!formData.paymentMethod) {
      newValidation.paymentMethod = {
        isValid: false,
        message: t('validation.payment_method_required')
      };
      isValid = false;
    }

    // TWINT specific validation
    if (formData.paymentMethod === 'TWINT' &&
      (twintPaymentOption === '' || twintPaymentOption === undefined)) {
      newValidation.twintOption = {
        isValid: false,
        message: t('validation.twint_option_required', 'Please select a TWINT payment option')
      };
      isValid = false;
    }

    // Delivery validation based on type
    if (formData.deliveryType === 'ADDRESS') {
      if (!formData.street?.trim()) {
        newValidation.street = {
          isValid: false,
          message: t('validation.street_required')
        };
        isValid = false;
      }

      if (!formData.house?.trim()) {
        newValidation.house = {
          isValid: false,
          message: t('validation.house_required')
        };
        isValid = false;
      }

      if (!formData.city?.trim()) {
        newValidation.city = {
          isValid: false,
          message: t('validation.city_required')
        };
        isValid = false;
      }

      if (!formData.postalCode?.trim()) {
        newValidation.postalCode = {
          isValid: false,
          message: t('validation.postal_code_required')
        };
        isValid = false;
      } else if (!/^\d{4}$/.test(formData.postalCode)) {
        newValidation.postalCode = {
          isValid: false,
          message: t('validation.invalid_postal_code')
        };
        isValid = false;
      }

      if (!deliveryCalculation.isValid) {
        // Don't mark specific field as invalid, just show general error
        setFormValidationError(deliveryCalculation.message || t('validation.delivery_not_available'));
        isValid = false;
      }
    } else if (formData.deliveryType === 'RAILWAY_STATION') {
      if (!formData.stationId) {
        newValidation.stationId = {
          isValid: false,
          message: t('validation.station_required')
        };
        isValid = false;
      }
    } else if (formData.deliveryType === 'PICKUP') {
      if (!formData.storeId) {
        newValidation.storeId = {
          isValid: false,
          message: t('validation.store_required')
        };
        isValid = false;
      }
    }

    // Delivery date validation
    if (!formData.deliveryDate) {
      newValidation.deliveryDate = {
        isValid: false,
        message: t('validation.delivery_date_required')
      };
      isValid = false;
    }

    // Time slot validation only for pickup
    if (formData.deliveryType === 'PICKUP' && !formData.deliveryTimeSlot) {
      newValidation.deliveryTimeSlot = {
        isValid: false,
        message: t('validation.delivery_time_required')
      };
      isValid = false;
    }

    // Account creation validation
    if (isGuest && createAccount) {
      if (!formData.password || formData.password.length === 0) {
        newValidation.password = {
          isValid: false,
          message: t('register.validation.password_required', { ns: 'auth' })
        };
        isValid = false;
      }

      if (formData.password !== formData.confirmPassword) {
        newValidation.confirmPassword = {
          isValid: false,
          message: t('register.validation.passwords_mismatch', { ns: 'auth' })
        };
        isValid = false;
      }

      if (!formData.dataConsentAccepted) {
        newValidation.dataConsentAccepted = {
          isValid: false,
          message: t('register.validation.consent_required', { ns: 'auth' })
        };
        isValid = false;
      }
    }

    // Update validation state
    setFieldValidation(newValidation);

    // Clear form validation error if no general errors
    if (isValid) {
      setFormValidationError(null);
    }

    return isValid;
  };

  // Validate individual fields on change
  const validateField = (name, value) => {
    let isValid = true;
    let message = '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+[1-9]\d{9,14}$/;

    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value?.trim()) {
          isValid = false;
          message = name === 'firstName'
            ? t('validation.first_name_required', { ns: 'auth' })
            : t('validation.last_name_required', { ns: 'auth' });
        }
        break;

      case 'email':
        if (!value?.trim()) {
          isValid = false;
          message = t('validation.email_required', { ns: 'auth' });
        } else if (!emailRegex.test(value)) {
          isValid = false;
          message = t('validation.invalid_email');
        }
        break;

      case 'phone':
        if (!value?.trim() || value === '+') {
          isValid = false;
          message = t('validation.phone_required', { ns: 'auth' });
        } else if (!phoneRegex.test(cleanPhoneNumber(value))) {
          isValid = false;
          message = t('validation.invalid_phone');
        }
        break;

      case 'street':
        if (formData.deliveryType === 'ADDRESS' && !value?.trim()) {
          isValid = false;
          message = t('validation.street_required');
        }
        break;

      case 'house':
        if (formData.deliveryType === 'ADDRESS' && !value?.trim()) {
          isValid = false;
          message = t('validation.house_required');
        }
        break;

      case 'city':
        if (formData.deliveryType === 'ADDRESS' && !value?.trim()) {
          isValid = false;
          message = t('validation.city_required');
        }
        break;

      case 'postalCode':
        if (formData.deliveryType === 'ADDRESS') {
          if (!value?.trim()) {
            isValid = false;
            message = t('validation.postal_code_required');
          } else if (!/^\d{4}$/.test(value)) {
            isValid = false;
            message = t('validation.invalid_postal_code');
          }
        }
        break;

      case 'stationId':
        if (formData.deliveryType === 'RAILWAY_STATION' && !value) {
          isValid = false;
          message = t('validation.station_required');
        }
        break;

      case 'deliveryDate':
        if (!value) {
          isValid = false;
          message = t('validation.delivery_date_required');
        }
        break;

      case 'deliveryTimeSlot':
        if (formData.deliveryType === 'PICKUP' && !value) {
          isValid = false;
          message = t('validation.delivery_time_required');
        }
        break;

      case 'password':
        if (isGuest && createAccount && (!value || value.length === 0)) {
          isValid = false;
          message = t('register.validation.password_required', { ns: 'auth' });
        }
        break;

      case 'confirmPassword':
        if (isGuest && createAccount && value !== formData.password) {
          isValid = false;
          message = t('register.validation.passwords_mismatch', { ns: 'auth' });
        }
        break;

      default:
        break;
    }

    setFieldValidation(prev => ({
      ...prev,
      [name]: { isValid, message }
    }));

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

    let cost = 0;
  let isValid = true;
  let message = '';
  let minimumOrder = 0;

  switch (formData.deliveryType) {
    case 'PICKUP':
      cost = 0;
      isValid = true;
      minimumOrder = 0;
      message = 'Free pickup - no minimum order required';
      break;

    case 'RAILWAY_STATION':
      cost = 0;
      isValid = true;
      minimumOrder = 0;
      message = 'Free railway station delivery';
      break;

    case 'ADDRESS':
      cost = 0; // Always free delivery
      
      // For ADDRESS delivery, the actual validation will come from AddressDeliveryCheckout
      // This is just a fallback calculation
      // Don't override the validation from AddressDeliveryCheckout component
      
      // Skip manual calculation for ADDRESS if we already have validation from component
       if (formData.postalCode && formData.canton) {
        // Don't override validation from AddressDeliveryCheckout component
        // Just ensure we have the correct delivery type set
        setDeliveryCalculation(prev => ({
          ...prev,
          deliveryType: 'ADDRESS',
          cost: 0
        }));
        
        setFormData(prev => ({
          ...prev,
          deliveryCost: 0
        }));
        
        // Exit early to let AddressDeliveryCheckout handle the rest
        return;
      }
      
      // Fallback calculation only
      if (totalPrice >= 200) {
        isValid = true;
        minimumOrder = 200;
        message = 'Free delivery for orders over 200 CHF';
      } else {
        isValid = false;
        minimumOrder = 200;
        const needed = 200 - totalPrice;
        message = `Minimum order for address delivery is 200 CHF. Add ${needed.toFixed(2)} CHF more to your cart.`;
      }
      break;
  }

    console.log('🎯 Manual calculation result:', { cost, isValid, message, deliveryType: formData.deliveryType, totalPrice });

    // Only update if this is not ADDRESS delivery or if we don't have existing validation
  if (formData.deliveryType !== 'ADDRESS' || !deliveryCalculation.message) {
    setDeliveryCalculation({
      cost,
      isValid,
      message,
      minimumOrderAmount: minimumOrder,
      deliveryType: formData.deliveryType
    });
  }

    setFormData(prev => ({
      ...prev,
      deliveryCost: cost
    }));

  }, [totalPrice, formData.deliveryType, formData.postalCode, formData.canton]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;

    // Clear previous errors
    setSubmitError(null);
    setFormValidationError(null);

    // Validate form
    if (!validateForm()) {
      // Find first invalid field and scroll to it
      const firstInvalidField = Object.keys(fieldValidation).find(
        key => !fieldValidation[key].isValid
      );

      if (firstInvalidField) {
        const element = document.querySelector(`[name="${firstInvalidField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      setFormValidationError(t('register.validation.fix_errors', { ns: 'auth' }));
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        deliveryType: formData.deliveryType,
        totalAmount: totalPrice,
        paymentMethod: formData.paymentMethod,
        notesClient: formData.notesClient || '',
        notesAdmin: prepareAdminNotes(),
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSubmitSuccess(true);
      clearCart();
      
    } catch (error) {
      console.error('Order submission error:', error);
      setSubmitError(error.message || 'Failed to create order');
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to show error message
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
              fieldValidation={fieldValidation} // Add this
            />

            {/* Delivery Options */}
            <DeliveryOptions
              formData={formData}
              handleChange={handleChange}
              railwayStations={railwayStations}
              onAddressValidation={handleAddressDeliveryValidation}
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