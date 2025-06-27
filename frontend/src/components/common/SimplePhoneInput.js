// src/components/common/SimplePhoneInput.js
import React, { useState, useCallback, useRef } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Phone configurations for different countries - UPDATED WITH CLEAN FORMATS
const PHONE_CONFIGS = {
  '380': { // Ukraine
    code: '+380',
    pattern: /^\+380\d{9}$/, // +380 + 9 digits = 12 digits total
    name: 'Ukraine',
    format: (value) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 3) return `+${digits}`;
      if (digits.length <= 5) return `+${digits.slice(0, 3)} ${digits.slice(3)}`;
      if (digits.length <= 8) return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
      if (digits.length <= 10) return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
      return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
    }
  },
  '41': { // Switzerland  
    code: '+41',
    pattern: /^\+41\d{9}$/, // +41 + 9 digits = 11 digits total
    name: 'Switzerland',
    format: (value) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 2) return `+${digits}`;
      if (digits.length <= 4) return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
      if (digits.length <= 7) return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`;
      if (digits.length <= 9) return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
      return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
    }
  },
  '33': { // France
    code: '+33',
    pattern: /^\+33\d{9}$/, // +33 + 9 digits = 11 digits total
    name: 'France',
    format: (value) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 2) return `+${digits}`;
      if (digits.length <= 3) return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
      if (digits.length <= 5) return `+${digits.slice(0, 2)} ${digits.slice(2, 3)} ${digits.slice(3)}`;
      if (digits.length <= 7) return `+${digits.slice(0, 2)} ${digits.slice(2, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
      if (digits.length <= 9) return `+${digits.slice(0, 2)} ${digits.slice(2, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
      return `+${digits.slice(0, 2)} ${digits.slice(2, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
    }
  },
  '1': { // United States
    code: '+1',
    pattern: /^\+1\d{10}$/, // +1 + 10 digits = 11 digits total
    name: 'United States',
    format: (value) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 1) return `+${digits}`;
      if (digits.length <= 4) return `+${digits.slice(0, 1)} ${digits.slice(1)}`;
      if (digits.length <= 7) return `+${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4)}`;
      return `+${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
    }
  }
};

/**
 * Simple Phone Input Component
 * Custom formatting without external libraries
 * No focus loss, easy deletion
 */
const SimplePhoneInput = ({
  name = 'phone',
  value = '',
  onChange,
  onValidationChange,
  isInvalid = false,
  readOnly = false,
  disabled = false,
  required = false,
  className = '',
  placeholder = 'Phone',
  ...props
}) => {
  const { t } = useTranslation();
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');
  const inputRef = useRef(null);

  // Detect country based on phone number input
  const detectCountryFromInput = useCallback((phoneNumber) => {
    if (!phoneNumber || phoneNumber === '+') {
      return null;
    }

    // Remove + and any formatting
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Check each country code
    for (const [countryCode, config] of Object.entries(PHONE_CONFIGS)) {
      if (digits.startsWith(countryCode)) {
        return countryCode;
      }
    }
    
    return null;
  }, []);

  // Format phone number
  const formatPhoneNumber = useCallback((inputValue, cursorPosition = 0) => {
    // Always ensure it starts with +
    if (!inputValue.startsWith('+')) {
      inputValue = '+' + inputValue.replace(/^\+*/, '');
    }

    // If just +, return it
    if (inputValue === '+') {
      return { formattedValue: '+', newCursorPosition: 1 };
    }

    // Detect country
    const country = detectCountryFromInput(inputValue);
    
    let formattedValue;
    if (country && PHONE_CONFIGS[country]) {
      // Use country-specific formatting
      formattedValue = PHONE_CONFIGS[country].format(inputValue);
    } else {
      // Just keep digits after +
      const digits = inputValue.replace(/\D/g, '');
      formattedValue = digits ? `+${digits}` : '+';
    }

    // Calculate new cursor position
    const lengthDiff = formattedValue.length - inputValue.length;
    const newCursorPosition = Math.max(1, cursorPosition + lengthDiff);

    return { formattedValue, newCursorPosition };
  }, [detectCountryFromInput]);

  // Validate phone number
  const validatePhoneNumber = useCallback((phoneNumber) => {
    if (!phoneNumber || phoneNumber === '+') {
      return { isValid: true, message: '' };
    }

    const country = detectCountryFromInput(phoneNumber);
    if (!country) {
      // If no country detected but has more than just +, it might be invalid
      const digits = phoneNumber.replace(/\D/g, '');
      if (digits.length > 3) {
        return { isValid: false, message: 'Неподдерживаемый код страны' };
      }
      return { isValid: true, message: '' }; // Still typing
    }

    const config = PHONE_CONFIGS[country];
    if (!config) {
      return { isValid: false, message: 'Неподдерживаемая страна' };
    }

    // Get only digits for validation
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Check length requirements
    let requiredLength;
    switch (country) {
      case '380': requiredLength = 12; break; // +380 + 9 digits
      case '41': requiredLength = 11; break;  // +41 + 9 digits  
      case '33': requiredLength = 11; break;  // +33 + 9 digits
      case '1': requiredLength = 11; break;   // +1 + 10 digits
      default: requiredLength = 10; break;
    }

    // Clean the phone number for validation - remove all non-digits except +
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    const isValidFormat = config.pattern.test(cleanPhone);
    
    // Also check if we have enough digits
    const hasEnoughDigits = digits.length >= requiredLength;
    const isComplete = digits.length === requiredLength;
    
    if (!hasEnoughDigits) {
      return { isValid: true, message: '' }; // Still typing
    }
    
    return {
      isValid: isValidFormat && isComplete,
      message: (isValidFormat && isComplete) ? '' : `Введите полный номер для ${config.name}`
    };
  }, [detectCountryFromInput, t]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const inputElement = e.target;
    const inputValue = inputElement.value;
    const cursorPosition = inputElement.selectionStart;

    // Handle backspace/delete when at the beginning or when trying to delete +
    if (inputValue === '' || (!inputValue.startsWith('+') && inputValue.length === 0)) {
      const emptyValue = '+';
      
      // Validate
      const validation = validatePhoneNumber(emptyValue);
      setIsValid(validation.isValid);
      setValidationMessage(validation.message);

      if (onValidationChange) {
        onValidationChange(validation.isValid, validation.message);
      }

      if (onChange) {
        onChange({
          target: {
            name: name,
            value: emptyValue
          }
        });
      }

      // Set cursor position after +
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(1, 1);
        }
      }, 0);
      
      return;
    }

    // Format the input
    const { formattedValue, newCursorPosition } = formatPhoneNumber(inputValue, cursorPosition);

    // Validate the phone number
    const validation = validatePhoneNumber(formattedValue);
    setIsValid(validation.isValid);
    setValidationMessage(validation.message);

    // Call external validation callback if provided
    if (onValidationChange) {
      onValidationChange(validation.isValid, validation.message);
    }

    // Call the main onChange handler
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: formattedValue
        }
      });
    }

    // Set cursor position
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  }, [name, onChange, onValidationChange, formatPhoneNumber, validatePhoneNumber]);

  // Handle key down for special cases
  const handleKeyDown = useCallback((e) => {
    const inputElement = e.target;
    const cursorPosition = inputElement.selectionStart;
    const inputValue = inputElement.value;

    // Prevent deleting the + at the beginning
    if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPosition <= 1) {
      e.preventDefault();
      return;
    }

    // Handle Backspace more intelligently
    if (e.key === 'Backspace' && cursorPosition > 1) {
      const newValue = inputValue.slice(0, cursorPosition - 1) + inputValue.slice(cursorPosition);
      
      // If this would leave us with just + or empty, reset to +
      if (newValue.length <= 1 || newValue.replace(/\D/g, '').length === 0) {
        e.preventDefault();
        
        if (onChange) {
          onChange({
            target: {
              name: name,
              value: '+'
            }
          });
        }
        
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setSelectionRange(1, 1);
          }
        }, 0);
      }
    }
  }, [name, onChange]);

  // Handle focus - ensure cursor is after +
  const handleFocus = useCallback((e) => {
    const inputElement = e.target;
    if (inputElement.value === '' || inputElement.value === '+') {
      setTimeout(() => {
        inputElement.setSelectionRange(1, 1);
      }, 0);
    }
  }, []);

  const displayValue = value || '+';

  return (
    <div className="phone-input-container">
      <InputGroup>
        <InputGroup.Text>
          <Phone size={18} />
        </InputGroup.Text>
        <Form.Control
          ref={inputRef}
          type="tel"
          name={name}
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="+"
          isInvalid={isInvalid || !isValid}
          readOnly={readOnly}
          disabled={disabled}
          required={required}
          className={className}
          {...props}
        />
      </InputGroup>
      
      {/* Validation Feedback */}
      {(!isValid && validationMessage) && (
        <div className="invalid-feedback d-block">
          {validationMessage}
        </div>
      )}
    </div>
  );
};

// Hook for phone validation
const useSimplePhoneValidation = () => {
  const [isValid, setIsValid] = useState(true);
  const [message, setMessage] = useState('');

  const handleValidationChange = useCallback((valid, msg) => {
    setIsValid(valid);
    setMessage(msg);
  }, []);

  return {
    isValid,
    message,
    handleValidationChange
  };
};

// Utility function to clean phone number for API calls
const cleanPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  // Remove all spaces and keep only digits and +
  return phoneNumber.replace(/[^\d+]/g, '');
};

export default SimplePhoneInput;
export { useSimplePhoneValidation, cleanPhoneNumber };