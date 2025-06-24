// components/ChangePassword.js
import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { apiClient } from '../utils/api';
import { useTranslation } from 'react-i18next';

const ChangePassword = () => {
  const { t } = useTranslation(['auth', 'common']);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError(t('auth_required', { ns: 'common' }));
        return;
      }

      // Validate passwords match
      if (formData.newPassword !== formData.confirmPassword) {
        setError(t('validation.passwords_mismatch', { ns: 'auth' }));
        return;
      }

      // Validate password length
      if (formData.newPassword.length < 8) {
        setError(t('validation.password_min_length', { ns: 'auth' }));
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

      setSuccess(t('change_password.success'));
      // Clear form after successful change
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Password change error:', err);
      
      // Handle specific error cases
      if (err.message?.includes('Current password is incorrect')) {
        setError(t('change_password.current_password_incorrect'));
      } else {
        setError(err.message || t('change_password.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Error alert */}
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}
      
      {/* Success alert */}
      {success && (
        <Alert variant="success" onClose={() => setSuccess('')} dismissible>
          {success}
        </Alert>
      )}

      {/* Current Password Field */}
      <Form.Group className="mb-3">
        <Form.Label>{t('change_password.current_password')}</Form.Label>
        <Form.Control
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          required
          disabled={loading}
          placeholder={t('change_password.current_password')}
        />
      </Form.Group>

      {/* New Password Field */}
      <Form.Group className="mb-3">
        <Form.Label>{t('change_password.new_password')}</Form.Label>
        <Form.Control
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          required
          disabled={loading}
          minLength={8}
          placeholder={t('change_password.new_password')}
        />
        <Form.Text className="text-muted">
          {t('validation.password_requirements', { ns: 'auth' })}
        </Form.Text>
      </Form.Group>

      {/* Confirm New Password Field */}
      <Form.Group className="mb-3">
        <Form.Label>{t('change_password.confirm_password')}</Form.Label>
        <Form.Control
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          disabled={loading}
          placeholder={t('change_password.confirm_password')}
        />
      </Form.Group>

      {/* Submit Button */}
      <Button 
        type="submit" 
        variant="primary"
        disabled={loading}
      >
        {loading ? t('change_password.loading') : t('change_password.submit')}
      </Button>
    </Form>
  );
};

export default ChangePassword;