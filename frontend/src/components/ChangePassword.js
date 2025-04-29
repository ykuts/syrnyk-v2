// components/ChangePassword.js
import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { apiClient } from '../utils/api';
import { useTranslation } from 'react-i18next';


const ChangePassword = () => {
  const { t } = useTranslation(['common', 'changePassword']);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Validate passwords
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      if (formData.newPassword.length < 8) {
        setError('New password must be at least 8 characters long');
        return;
      }

      // Send request to change password
      await apiClient.put(
        '/users/password',
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      );

      setSuccess('Password successfully changed');
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Password change error:', err);
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess('')} dismissible>
          {success}
        </Alert>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Current Password</Form.Label>
        <Form.Control
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>New Password</Form.Label>
        <Form.Control
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          required
          disabled={loading}
          minLength={8}
        />
        <Form.Text className="text-muted">
          Password must be at least 8 characters long
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Confirm New Password</Form.Label>
        <Form.Control
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </Form.Group>

      <Button 
        type="submit" 
        variant="primary"
        disabled={loading}
      >
        {loading ? 'Changing Password...' : 'Change Password'}
      </Button>
    </Form>
  );
};

export default ChangePassword;