import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LoginForm.css';

function LoginForm({ closeModal }) {
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
        // After successful login, redirect based on role
        const role = result.user.role;
        if (role === 'CLIENT') {
          navigate('/client');
        } else if (role === 'ADMIN') {
          navigate('/admin');
        }
        closeModal();
      } else {
        setError(result.error || 'Invalid credentials, please try again or register.');
      }
    } catch (error) {
      setError('An error occurred during login. Please try again.');
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
    // Добавьте здесь логику для восстановления пароля
    console.log('Forgot password clicked');
  };

  return (
    <Form onSubmit={handleLogin} className="p-3">
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      <Form.Group className="mb-4">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Введіть email"
          required
          className="form-control-lg"
          disabled={loading}
        />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Пароль</Form.Label>
        <InputGroup>
          <Form.Control
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введіть пароль"
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
        <Form.Check
          type="checkbox"
          label="Запам'ятати мене"
          className="custom-checkbox"
          disabled={loading}
        />
        <a 
          href="/" 
          className="text-decoration-none"
          onClick={handleForgotPassword}
        >
          Забули пароль?
        </a>
      </div>

      <Button 
        variant="primary" 
        type="submit" 
        className="w-100 py-2 mb-3 btn-lg"
        disabled={loading}
      >
        {loading ? 'Вхід...' : 'Увійти'}
      </Button>
      
      <div className="text-center">
        <span className="text-muted">Немає акаунту? </span>
        <a 
          href="/" 
          className="text-decoration-none"
          onClick={handleRegisterClick}
        >
          Зареєструватися
        </a>
      </div>
    </Form>
  );
}

export default LoginForm;