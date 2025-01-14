import React, { useState } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { LogIn, UserPlus, ShoppingBag } from 'lucide-react';

const AuthChoice = ({ onChoice, onLogin, onRegister }) => {
  const [showBenefits, setShowBenefits] = useState(false);

  const handleGuestCheckout = () => {
    if (!showBenefits) {
      setShowBenefits(true);
      return;
    }
    onChoice('guest');
  };

  if (showBenefits) {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Create an account for better shopping experience</Card.Title>
          
          <Alert variant="info" className="mt-3">
            <h6 className="mb-2">Benefits of registration:</h6>
            <ul className="mb-0">
              <li>Track all your orders in one place</li>
              <li>Save your delivery addresses</li>
              <li>Faster checkout process</li>
              <li>Special offers for registered customers</li>
              <li>Order history and reordering</li>
            </ul>
          </Alert>

          <div className="d-grid gap-2 mt-4">
            <Button
              variant="success"
              onClick={onRegister}
              className="d-flex align-items-center justify-content-center gap-2"
            >
              <UserPlus size={20} />
              Register Now
            </Button>

            <Button
              variant="outline-primary"
              onClick={() => onChoice('guest')}
              className="d-flex align-items-center justify-content-center gap-2"
            >
              <ShoppingBag size={20} />
              Continue as Guest
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Body>
        <Card.Title>Choose how to proceed with your order</Card.Title>
        
        <div className="d-grid gap-2 mt-4">
          <Button
            variant="primary"
            onClick={onLogin}
            className="d-flex align-items-center justify-content-center gap-2"
          >
            <LogIn size={20} />
            Sign In
          </Button>

          <Button
            variant="success"
            onClick={onRegister}
            className="d-flex align-items-center justify-content-center gap-2"
          >
            <UserPlus size={20} />
            Register
          </Button>

          <Button
            variant="outline-primary"
            onClick={handleGuestCheckout}
            className="d-flex align-items-center justify-content-center gap-2"
          >
            <ShoppingBag size={20} />
            Checkout as Guest
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AuthChoice;