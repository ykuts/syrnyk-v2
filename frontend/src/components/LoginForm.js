import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginForm({ closeModal }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    <form onSubmit={handleLogin}>
      <h2>Вход</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Войти</button>
    </form>
  );
}

export default LoginForm;