// src/components/checkout/CustomerInfoForm.js
import React, { useState, useEffect } from 'react';
import { Form, Card, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import PasswordFields from './PasswordFields';
import ConsentSection from './ConsentSection';
import SimplePhoneInput, { useSimplePhoneValidation } from '../common/SimplePhoneInput';
import './CustomerInfoForm.css';

/**
 * Customer information form component for checkout
 * Handles personal details and optional account creation for guest checkout
 */
const CustomerInfoForm = ({
  formData,
  handleChange,
  isAuthenticated,
  isGuest,
  createAccount,
  onCreateAccountChange
}) => {
  const { t } = useTranslation(['checkout', 'auth']);

  // Use phone validation hook
  const { isValid: isPhoneValid, message: phoneMessage, handleValidationChange } = useSimplePhoneValidation();

  // Handle create account checkbox change
  const handleCreateAccountChange = (e) => {
    const { checked } = e.target;
    onCreateAccountChange(checked);

    // Clear account-related fields when unchecking
    if (!checked) {
      handleChange({ target: { name: 'password', value: '' } });
      handleChange({ target: { name: 'confirmPassword', value: '' } });
      handleChange({ target: { name: 'dataConsentAccepted', type: 'checkbox', checked: false } });
      handleChange({ target: { name: 'marketingConsent', type: 'checkbox', checked: false } });
    }
  };

  return (
    <section className="mb-5">
      <h4 className="mb-3">{t('checkout.customer_info')}</h4>
      <Card className="register-form-labels">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-start">
                  {t('customer.first_name')}
                  <span className="required-asterisk">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  readOnly={isAuthenticated}
                  className={isAuthenticated ? 'bg-light' : ''}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-start">
                  {t('customer.last_name')}
                  <span className="required-asterisk">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  readOnly={isAuthenticated}
                  className={isAuthenticated ? 'bg-light' : ''}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="text-start">
              E-mail
              <span className="required-asterisk">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              readOnly={isAuthenticated}
              className={isAuthenticated ? 'bg-light' : ''}
            />
          </Form.Group>

          {/* Phone input with Smart Phone Input */}
          <Form.Group className="mb-3 ">
            <Form.Label className="text-start">
              {t('customer.phone', 'Телефон')}
             <span className="required-asterisk">*</span>
            </Form.Label>
            <SimplePhoneInput
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onValidationChange={handleValidationChange}
              isInvalid={!isPhoneValid}
              readOnly={isAuthenticated}
              className={isAuthenticated ? 'bg-light' : ''}
              required
              placeholder="+"
            />
            {/* {!isPhoneValid && phoneMessage && (
              <div className="invalid-feedback d-block">
                {phoneMessage}
              </div>
            )} */}
            {!isAuthenticated && (
              <Form.Text className="text-muted">
                {t('register.phone_hint', "Будь ласка, вкажіть номер телефону, який прив'язаний до WhatsApp")}
              </Form.Text>
            )}
          </Form.Group>

          {/* Account creation option for guest checkout */}
          {isGuest && (
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="create-account"
                name="createAccount"
                style={{
                  '--bs-border-color': '#495057',
                  textAlign: 'left',
                }}
                label={t('customer.create_account')}
                checked={createAccount}
                onChange={handleCreateAccountChange}
              />
            </Form.Group>
          )}

          {/* Password fields and consent for account creation */}
          {isGuest && createAccount && (
            <>
              <PasswordFields
                password={formData.password}
                confirmPassword={formData.confirmPassword}
                handleChange={handleChange}
              />

              <ConsentSection
                dataConsentAccepted={formData.dataConsentAccepted}
                marketingConsent={formData.marketingConsent}
                language={formData.language}
                handleChange={handleChange}
              />
            </>
          )}
        </Card.Body>
      </Card>

      {isAuthenticated && (
        <Form.Text className="text-muted">
          {t('customer.profile_update_note')}
        </Form.Text>
      )}
    </section>
  );
};

export default CustomerInfoForm;