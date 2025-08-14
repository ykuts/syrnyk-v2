import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Alert, Spinner, Button, Card } from 'react-bootstrap';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../utils/api';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const { setUser } = useAuth();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const token = searchParams.get('token');

  useEffect(() => {
    let isCancelled = false;

    const verifyEmail = async () => {
    if (!token) {
      if (!isCancelled) {
        setStatus('error');
        setMessage(t('login.verification.invalidLink'));
      }
      return;
    }

    console.log('🔗 Making request to verify email with token:', token);

    try {
      const data = await apiClient.get('/users/verify-email', {
        params: { token }
      });

      if (!isCancelled) {
        console.log('📥 Response data:', data);
        setStatus('success');
        setMessage(data.message);
        setUserInfo(data.user);
        
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
          
          setTimeout(() => {
            if (!isCancelled) {
              navigate('/');
            }
          }, 3000);
        }
      }

    } catch (err) {
      if (!isCancelled) {
        console.error('❌ Verification error:', err);
        
        // Проверяем, не является ли это ошибкой уже подтвержденного пользователя
        if (err.message && err.message.includes('already verified')) {
          setStatus('success');
          setMessage(t('login.verification.alreadyVerified', 'Email is already verified!'));
        } else {
          setStatus('error');
          setMessage(err.message || t('login.verification.networkError'));
        }
      }
    }
  };

  verifyEmail();

  // Cleanup function
  return () => {
    isCancelled = true;
  };
}, [token]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <Card className="text-center">
            <Card.Body className="py-5">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <h4>{t('login.verification.verifying')}</h4>
              <p className="text-muted">{t('login.verification.pleaseWait')}</p>
            </Card.Body>
          </Card>
        );

      case 'success':
        return (
          <Card className="text-center border-success">
            <Card.Body className="py-5">
              <CheckCircle size={64} className="text-success mb-3" />
              <h3 className="text-success mb-3">
                {t('login.verification.success')}
              </h3>
              <Alert variant="success">{message}</Alert>
              
              {userInfo && (
                <p className="mb-4">
                  {t('login.verification.welcomeMessage', { name: userInfo.firstName })}
                </p>
              )}
              
              {/* <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => navigate('/client')}
                >
                  {t('login.verification.goToProfile')}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigate('/')}
                >
                  {t('login.verification.goToHome')}
                </Button>
              </div> */}
              
              <small className="text-muted d-block mt-3">
                {t('login.verification.autoRedirect')}
              </small>
            </Card.Body>
          </Card>
        );

      case 'error':
        return (
          <Card className="text-center border-danger">
            <Card.Body className="py-5">
              <XCircle size={64} className="text-danger mb-3" />
              <h3 className="text-danger mb-3">
                {t('login.verification.error')}
              </h3>
              <Alert variant="danger">{message}</Alert>
              
              {/* <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/register')}
                >
                  {t('login.verification.backToRegister')}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigate('/login')}
                >
                  {t('login.verification.goToLogin')}
                </Button>
              </div> */}
            </Card.Body>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="text-center mb-4">
            <Mail size={48} className="text-primary mb-3" />
            <h2>{t('login.verification.title')}</h2>
          </div>
          {renderContent()}
        </div>
      </div>
    </Container>
  );
};

export default EmailVerification;