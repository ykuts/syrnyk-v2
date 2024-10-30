// src/components/Profile.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/users/login', { email, password });
        
console.log(response.data);
const { user, token, message } = response.data;
const role = user.role;
console.log("role = ", role);
      if (role === 'CLIENT') {
        navigate('/client');
      } else if (role === 'ADMIN') {
        navigate('/admin');
      }
    } catch (error) {
      setError('Invalid credentials, please try again or register.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
        {error && <p>{error}</p>}
      </form>
      <button onClick={() => navigate('/register')}>Register</button>
    </div>
  );
};

export default Profile;
