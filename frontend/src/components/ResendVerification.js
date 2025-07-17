import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../utils/api';

const ResendVerification = () => {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(t('login.verification.emailRequired'));
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await apiClient.post('/users/resend-verification', {
        email: email.trim()
      });

      setMessage(data.message);
      setEmail(''); // Clear form
    } catch (err) {
      console.error('Resend verification error:', err);
      setError(err.message || t('login.verification.networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Mail size={48} className="text-primary mb-3" />
                <h3>{t('login.verification.resendTitle')}</h3>
                <p className="text-muted">
                  {t('login.verification.resendDescription')}
                </p>
              </div>

              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('login.email')}</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('login.verification.emailPlaceholder')}
                    required
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={loading}
                  >
                    {loading ? t('login.loading') : t('login.verification.resendButton')}
                  </Button>
                </div>
              </Form>

              <hr />
              
              <div className="text-center">
                <p className="mb-0">
                  <a href="/login" className="text-decoration-none">
                    {t('login.verification.backToLogin')}
                  </a>
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default ResendVerification;