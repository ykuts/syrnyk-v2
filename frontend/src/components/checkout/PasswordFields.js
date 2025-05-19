// src/components/checkout/PasswordFields.js
import React from 'react';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

/**
 * Password fields component with validation for account creation
 */
const PasswordFields = ({ password, confirmPassword, handleChange }) => {
  const { t } = useTranslation(['checkout', 'auth']);
  
  // Password validation
  const isPasswordValid = (pwd) => {
    return pwd && pwd.length >= 8 && /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(pwd);
  };
  
  const isPasswordInvalid = password && !isPasswordValid(password);
  const isConfirmPasswordInvalid = confirmPassword && password !== confirmPassword;

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>{t('customer.password')}</Form.Label>
        <Form.Control
          type="password"
          name="password"
          placeholder={`${t('customer.password')} (${t('register.password_requirements.length', { ns: 'auth' })})`}
          value={password || ''}
          onChange={handleChange}
          required
          minLength={8}
          isInvalid={isPasswordInvalid}
        />
        <Form.Control.Feedback type="invalid">
          {t('register.validation.password_requirements', { ns: 'auth' })}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          {t('register.password_requirements.title', { ns: 'auth' })}
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>{t('register.confirm_password', { ns: 'auth' })}</Form.Label>
        <Form.Control
          type="password"
          name="confirmPassword"
          placeholder={t('register.confirm_password', { ns: 'auth' })}
          value={confirmPassword || ''}
          onChange={handleChange}
          required
          isInvalid={isConfirmPasswordInvalid}
        />
        <Form.Control.Feedback type="invalid">
          {t('register.validation.passwords_mismatch', { ns: 'auth' })}
        </Form.Control.Feedback>
      </Form.Group>
    </>
  );
};

export default PasswordFields;