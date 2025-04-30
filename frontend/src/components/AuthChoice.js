import React, { useState } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { LogIn, UserPlus, ShoppingBag } from 'lucide-react';
import LoginModal from './LoginModal';
import { useTranslation } from 'react-i18next';

const AuthChoice = ({ onChoice, onRegister }) => {
  const [showBenefits, setShowBenefits] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { t } = useTranslation('checkout');
  const handleGuestCheckout = () => {
    if (!showBenefits) {
      setShowBenefits(true);
      return;
    }
    onChoice('guest');
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  // Render benefits screen when user attempts to checkout as guest
  if (showBenefits) {
    return (
      <>
        <Card>
          <Card.Body>
            <Card.Title>{t('auth_choice.benefits_title')}</Card.Title>
            
            <Alert variant="info" className="mt-3 text-start">
              <h6 className="mb-2">{t('auth_choice.benefits_title2')}</h6>
              <ul className="mb-0">
                <li>{t('auth_choice.benefits.0')}</li>
                <li>{t('auth_choice.benefits.1')}</li>
                <li>{t('auth_choice.benefits.2')}</li>
                <li>{t('auth_choice.benefits.3')}</li>
                <li>{t('auth_choice.benefits.4')}</li>
              </ul>
            </Alert>

            <div className="d-grid gap-2 mt-4">
              <Button
                variant="success"
                onClick={onRegister}
                className="d-flex align-items-center justify-content-center gap-2"
              >
                <UserPlus size={20} />
                {t('buttons.register', { ns: 'common' })}
              </Button>

              <Button
                variant="outline-primary"
                onClick={() => onChoice('guest')}
                className="d-flex align-items-center justify-content-center gap-2"
              >
                <ShoppingBag size={20} />
                {t('buttons.continueAsGuest', { ns: 'common' })}
              </Button>
            </div>
          </Card.Body>
        </Card>

        <LoginModal 
          show={showLoginModal} 
          onHide={() => setShowLoginModal(false)}
          onLoginSuccess={() => onChoice('form')}
        />
      </>
    );
  }

  // Initial authentication choice screen
  return (
    <>
      <Card>
        <Card.Body>
          <Card.Title>Оберіть спосіб оформлення замовлення</Card.Title>
          
          <div className="d-grid gap-2 mt-4">
            <Button
              variant="primary"
              onClick={handleLoginClick}
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

      <LoginModal 
        show={showLoginModal} 
        onHide={() => setShowLoginModal(false)}
        onLoginSuccess={() => onChoice('form')}
      />
    </>
  );
};

export default AuthChoice;