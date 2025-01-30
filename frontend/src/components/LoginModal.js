import React from 'react';
import Modal from 'react-bootstrap/Modal';
import LoginForm from './LoginForm';

const LoginModal = ({ show, onHide, onLoginSuccess, returnUrl }) => {
  const handleLoginSuccess = () => {
    onHide();
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Увійти</Modal.Title>
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