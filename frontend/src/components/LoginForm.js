import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LoginForm.css';
import { useTranslation } from 'react-i18next';


function LoginForm({ closeModal, onLoginSuccess, returnUrl }) {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      
      const result = await login(email, password);
      
      if (result.success) {
        // Close modal first
        closeModal();

        // Handle successful login with different scenarios
        if (onLoginSuccess) {
          // If we have a success callback (e.g., for checkout flow)
          onLoginSuccess();
        } else if (returnUrl) {
          // If we have a specific return URL
          navigate(returnUrl);
        } else {
          // Default redirect based on role
          const role = result.user.role;
          if (role === 'CLIENT') {
            navigate('/client');
          } else if (role === 'ADMIN') {
            navigate('/admin');
          }
        }
      } else {
        setError(result.error || t('login.error'));
      }
    } catch (error) {
      setError(t('errors.general', { ns: 'common' }));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    closeModal();
    navigate('/register');
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    closeModal();
    navigate('/forgot-password');
  };

  return (
    <Form onSubmit={handleLogin} className="p-3">
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      <Form.Group className="mb-4">
        <Form.Label>{t('login.email')}</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('login.email')}
          required
          className="form-control-lg"
          disabled={loading}
        />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>{t('login.password')}</Form.Label>
        <InputGroup>
          <Form.Control
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('login.password')}
            required
            className="form-control-lg"
            disabled={loading}
          />
          <Button 
            variant="outline-secondary"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </Button>
        </InputGroup>
      </Form.Group>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <a 
          href="/" 
          className="text-decoration-none"
          onClick={handleForgotPassword}
        >
          {t('login.forgot_password')}
        </a>
      </div>

      <Button 
        variant="primary" 
        type="submit" 
        className="w-100 py-2 mb-3 btn-lg"
        disabled={loading}
      >
        {loading ? t('login.loading') : t('login.submit')}
      </Button>
      
      <div className="text-center">
        <span className="text-muted">{t('login.no_account')} </span>
        <a 
          href="/" 
          className="text-decoration-none"
          onClick={handleRegisterClick}
        >
          {t('login.register')}
        </a>
      </div>
    </Form>
  );
}

export default LoginForm;