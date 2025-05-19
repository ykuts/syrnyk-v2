// src/components/checkout/CustomerInfoForm.js
import React, { useState, useEffect } from 'react';
import { Form, Card, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import PasswordFields from './PasswordFields';
import ConsentSection from './ConsentSection';

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
      <Card>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  name="firstName"
                  placeholder={t('customer.first_name')}
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
                <Form.Control
                  type="text"
                  name="lastName"
                  placeholder={t('customer.last_name')}
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
            <Form.Control
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              readOnly={isAuthenticated}
              className={isAuthenticated ? 'bg-light' : ''}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="tel"
              name="phone"
              placeholder="+XXX XXXXXXXX"
              value={formData.phone}
              onChange={handleChange}
              required
              readOnly={isAuthenticated}
              className={isAuthenticated ? 'bg-light' : ''}
            />
            {!isAuthenticated && (
              <Form.Text className="text-muted">
                {t('customer.phone_note')}
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