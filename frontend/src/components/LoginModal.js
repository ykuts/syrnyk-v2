import React from 'react';
import Modal from 'react-bootstrap/Modal';
import LoginForm from './LoginForm';
import { useTranslation } from 'react-i18next';

const LoginModal = ({ show, onHide, onLoginSuccess, returnUrl }) => {
  const { t } = useTranslation('auth');
  const handleLoginSuccess = () => {
    onHide();
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('login.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <LoginForm 
          closeModal={onHide} 
          onLoginSuccess={handleLoginSuccess}
          returnUrl={returnUrl}
        />
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;