import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { getApiUrl } from '../config';
import { useTranslation } from 'react-i18next';

const ForgotPassword = () => {
  const { t } = useTranslation('auth');;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl('/api/users/request-password-reset'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Помилка запиту на скидання пароля');
      }
    } catch (error) {
      setError('Виникла помилка. Будь ласка, спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container className="py-5">
        <div className="mx-auto" style={{ maxWidth: '500px' }}>
          <Alert variant="success">
          {t('password_reset.request.success')}
          </Alert>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="mx-auto" style={{ maxWidth: '500px' }}>
        <h2 className="text-center mb-4">{t('password_reset.request.title')}</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>{t('password_reset.request.email')}</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('password_reset.request.email')}
              required
              disabled={loading}
            />
            <Form.Text className="text-muted">
              {t('password_reset.request.email_hint')}
            </Form.Text>
          </Form.Group>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-100"
            disabled={loading}
          >
            {loading ? t('password_reset.request.loading') : t('password_reset.request.submit')}
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default ForgotPassword;