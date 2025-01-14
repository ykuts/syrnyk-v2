import React, { useState } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { LogIn, UserPlus, ShoppingBag } from 'lucide-react';

// Component for choosing authentication method and displaying registration benefits
const AuthChoice = ({ onChoice, onLogin, onRegister }) => {
  const [showBenefits, setShowBenefits] = useState(false);

  const handleGuestCheckout = () => {
    if (!showBenefits) {
      setShowBenefits(true);
      return;
    }
    onChoice('guest');
  };

  // Render benefits screen when user attempts to checkout as guest
  if (showBenefits) {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Створіть обліковий запис для кращого досвіду покупок</Card.Title>
          
          <Alert variant="info" className="mt-3">
            <h6 className="mb-2">Переваги реєстрації:</h6>
            <ul className="mb-0">
              <li>Відстежуйте всі свої замовлення в одному місці</li>
              <li>Зберігайте свої адреси доставки</li>
              <li>Швидший процес оформлення замовлення</li>
              <li>Спеціальні пропозиції для зареєстрованих клієнтів</li>
              <li>Історія замовлень та повторне замовлення</li>
            </ul>
          </Alert>

          <div className="d-grid gap-2 mt-4">
            <Button
              variant="success"
              onClick={onRegister}
              className="d-flex align-items-center justify-content-center gap-2"
            >
              <UserPlus size={20} />
              Зареєструватися
            </Button>

            <Button
              variant="outline-primary"
              onClick={() => onChoice('guest')}
              className="d-flex align-items-center justify-content-center gap-2"
            >
              <ShoppingBag size={20} />
              Продовжити як гість
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  // Initial authentication choice screen
  return (
    <Card>
      <Card.Body>
        <Card.Title>Оберіть спосіб оформлення замовлення</Card.Title>
        
        <div className="d-grid gap-2 mt-4">
          <Button
            variant="primary"
            onClick={onLogin}
            className="d-flex align-items-center justify-content-center gap-2"
          >
            <LogIn size={20} />
            Увійти
          </Button>

          <Button
            variant="success"
            onClick={onRegister}
            className="d-flex align-items-center justify-content-center gap-2"
          >
            <UserPlus size={20} />
            Зареєструватися
          </Button>

          <Button
            variant="outline-primary"
            onClick={handleGuestCheckout}
            className="d-flex align-items-center justify-content-center gap-2"
          >
            <ShoppingBag size={20} />
            Оформити як гість
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AuthChoice;