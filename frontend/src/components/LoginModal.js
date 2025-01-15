import React from 'react';
import Modal from 'react-bootstrap/Modal';
import LoginForm from './LoginForm';

// Reusable login modal component that can be used across the application
const LoginModal = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Увійти</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <LoginForm closeModal={onHide} />
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;