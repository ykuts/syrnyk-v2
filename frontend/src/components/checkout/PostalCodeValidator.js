// src/components/checkout/PostalCodeValidator.js
import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../utils/api';

/**
 * PostalCodeValidator component that validates Swiss postal codes
 * and fetches city information during checkout
 *
 * @param {Object} props - Component props
 * @param {string} props.postalCode - The current postal code value
 * @param {Function} props.onChange - Handler for postal code changes
 * @param {Function} props.onValidation - Callback when validation is complete
 */
const PostalCodeValidator = ({ postalCode, onChange, onValidation }) => {
  const { t } = useTranslation(['checkout', 'common']);
  const [isValid, setIsValid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [city, setCity] = useState(null);
  const [error, setError] = useState(null);

  // Validate postal code format
  const validateFormat = (code) => {
    // Swiss postal codes are 4 digits
    const swissPostalCodeRegex = /^[1-9]\d{3}$/;
    return swissPostalCodeRegex.test(code);
  };

  // Effect to validate postal code
  useEffect(() => {
    // Reset validation state when postal code changes
    setIsValid(null);
    setCity(null);
    setError(null);

    // Skip validation for empty or short postal codes
    if (!postalCode || postalCode.length < 4) return;

    // First check format
    const formatValid = validateFormat(postalCode);
    if (!formatValid) {
      setIsValid(false);
      setError(t('checkout.invalid_postal_code_format'));
      onValidation(false, null);
      return;
    }

    // If format is valid, check if it exists in our delivery zones
    const checkPostalCode = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/delivery/cities/${postalCode}`);
        
        if (response) {
          setIsValid(true);
          setCity(response);
          onValidation(true, response);
        } else {
          setIsValid(false);
          setError(t('checkout.postal_code_not_served'));
          onValidation(false, null);
        }
      } catch (err) {
        console.error('Error validating postal code:', err);
        setIsValid(false);
        
        // Different error message based on status code
        if (err.response?.status === 404) {
          setError(t('checkout.postal_code_not_served'));
        } else {
          setError(t('checkout.postal_code_validation_error'));
        }
        
        onValidation(false, null);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the API call to avoid excessive requests
    const timeoutId = setTimeout(() => {
      checkPostalCode();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [postalCode, onValidation, t]);

  // Render validation icon
  const renderValidationIcon = () => {
    if (isLoading) {
      return <Spinner animation="border" size="sm" />;
    }
    
    if (isValid === true) {
      return <Check size={18} color="green" />;
    }
    
    if (isValid === false) {
      return <X size={18} color="red" />;
    }
    
    return null;
  };

  return (
    <div>
      <Form.Group className="mb-3">
        <Form.Label>{t('checkout.postal_code')}</Form.Label>
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="1234"
            value={postalCode}
            onChange={(e) => onChange(e.target.value)}
            isValid={isValid === true}
            isInvalid={isValid === false}
            maxLength={4}
          />
          <InputGroup.Text>
            {renderValidationIcon()}
          </InputGroup.Text>
        </InputGroup>
        {isValid === false && error && (
          <Form.Text className="text-danger">
            {error}
          </Form.Text>
        )}
      </Form.Group>

      {isValid && city && (
        <Alert variant="success" className="mb-3">
          <strong>{city.name}</strong> {t('checkout.in_delivery_zone')}
          {city.freeThreshold && (
            <div className="mt-1">
              {t('checkout.free_delivery_threshold', { threshold: city.freeThreshold })}
            </div>
          )}
        </Alert>
      )}
    </div>
  );
};

export default PostalCodeValidator;
