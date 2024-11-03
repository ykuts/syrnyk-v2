import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {Form, Button, InputGroup } from 'react-bootstrap';
import { Eye, EyeOff } from 'lucide-react';
import './LoginForm.css';

function LoginForm({ closeModal }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/users/login', { email, password });
      const { user } = response.data;
      const role = user.role;

      if (role === 'CLIENT') {
        navigate('/client');
      } else if (role === 'ADMIN') {
        navigate('/admin');
      }

      closeModal(); // Закрыть модальное окно после успешного входа

    } catch (error) {
      setError('Invalid credentials, please try again or register.');
    }
  };

  return (
    <Form onSubmit={handleLogin} className="p-3">
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
          />
          <Button 
            variant="outline-secondary"
            onClick={() => setShowPassword(!showPassword)}
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
        />
        <a href="#" className="text-decoration-none">Забули пароль?</a>
      </div>

      <Button 
        variant="primary" 
        type="submit" 
        className="w-100 py-2 mb-3 btn-lg"
      >
        Увійти
      </Button>
      
      <div className="text-center">
        <span className="text-muted">Немає акаунту? </span>
        <a href="#" className="text-decoration-none">Зареєструватися</a>
      </div>
    </Form>
    
  );
}

export default LoginForm;