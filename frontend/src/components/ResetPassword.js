import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getApiUrl } from '../config';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Пароль повинен містити щонайменше 8 символів');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl('/api/users/reset-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Пароль успішно змінено. Будь ласка, увійдіть з новим паролем.');
        navigate('/');
      } else {
        setError(data.message || 'Помилка під час зміни пароля');
      }
    } catch (error) {
      setError('Виникла помилка. Будь ласка, спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
        Недійсний або відсутній токен скидання. Будь ласка, запитайте скидання пароля знову.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="mx-auto" style={{ maxWidth: '500px' }}>
        <h2 className="text-center mb-4">Встановити новий пароль</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Новий парольd</Form.Label>
            <Form.Control
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Введіть новий пароль"
              required
              minLength={8}
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-4">
          <Form.Label>Підтвердження нового пароля</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Підтвердіть новий пароль"
            required
            minLength={8}
            disabled={loading}
          />
        </Form.Group>

        <Button 
          type="submit" 
          variant="primary" 
          className="w-100"
          disabled={loading}
        >
          {loading ? 'Скидання...' : 'Скинути пароль'}
        </Button>
        </Form>
      </div>
    </Container>
  );
};

export default ResetPassword;