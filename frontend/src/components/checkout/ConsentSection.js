// src/components/checkout/ConsentSection.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Modal } from 'react-bootstrap';
import { FileText, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import './ConsentSection.css';

// Import templates
import {
  dataProcessingTermsTemplates,
  consentCheckboxText,
  marketingConsentText,
  requiredConsentError,
  languageNames,
  uiTexts
} from '../../templates/dataProcessingTemplates';

/**
 * Data processing consent section for account creation
 */
const ConsentSection = ({ 
  dataConsentAccepted, 
  marketingConsent, 
  language, 
  handleChange 
}) => {
  const { i18n } = useTranslation();
  
  // Terms and language state
  const [showTerms, setShowTerms] = useState(false);
  const [termsLanguage, setTermsLanguage] = useState(language || i18n.language || 'uk');
  const [validation, setValidation] = useState({
    isValid: true,
    message: ''
  });

  // Validate consent
  useEffect(() => {
    setValidation({
      isValid: !!dataConsentAccepted,
      message: !dataConsentAccepted
        ? (requiredConsentError[termsLanguage] || requiredConsentError.uk)
        : ''
    });
  }, [dataConsentAccepted, termsLanguage]);

  // Sync terms language with i18n language when it changes
  useEffect(() => {
    setTermsLanguage(i18n.language);
  }, [i18n.language]);

  // Get UI texts based on selected language
  const getUIText = (key) => {
    return uiTexts[termsLanguage]?.[key] || uiTexts.uk[key];
  };

  // View terms handler
  const handleViewTerms = () => {
    setShowTerms(true);
  };

  // Handle language change in the modal
  const handleTermsLanguageChange = (e) => {
    const newLang = e.target.value;
    setTermsLanguage(newLang);
  };

  // Handle consent acceptance from modal
  const handleAcceptTerms = () => {
    handleChange({
      target: {
        name: 'dataConsentAccepted',
        type: 'checkbox',
        checked: true
      }
    });
    setShowTerms(false);
  };

  return (
    <>
    
      <Card className="mb-4 consent-section border-0">
        <Card.Body className="py-3">
          <h6 className="d-flex align-items-center mb-3">
            <FileText size={18} className="me-2" />
            {getUIText('privacyTitle')}
          </h6>

          <Form.Group className="mb-3 text-start">
            <Form.Check
              type="checkbox"
              id="dataConsentAccepted"
              name="dataConsentAccepted"
              checked={dataConsentAccepted || false}
              onChange={handleChange}
              required
              isInvalid={!validation.isValid}
              label={
                <>
                  {consentCheckboxText[termsLanguage] || consentCheckboxText.uk}{' '}
                  <Button
                    variant="link"
                    className="p-0 align-baseline text-decoration-underline"
                    onClick={handleViewTerms}
                  >
                    {getUIText('termsLinkText')}
                  </Button>
                  <span className="required-asterisk">*</span>
                </>
              }
            />
            {!validation.isValid && (
              <div className="text-danger small mt-1">
                {validation.message}
              </div>
            )}
            <Form.Control.Feedback type="invalid">
              {requiredConsentError[language] || requiredConsentError.uk}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-2 text-start">
            <Form.Check
              type="checkbox"
              id="marketingConsent"
              name="marketingConsent"
              checked={marketingConsent || false}
              onChange={handleChange}
              label={marketingConsentText[termsLanguage] || marketingConsentText.uk}
            />
          </Form.Group>

          <div className="privacy-note">
            <p className="mb-0">
              {getUIText('privacyNote')}
            </p>
          </div>
        </Card.Body>
      </Card>
    
      

      {/* Data Processing Terms Modal */}
      <Modal
        show={showTerms}
        onHide={() => setShowTerms(false)}
        size="lg"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>{getUIText('modalTitle')}</Modal.Title>
          <div className="ms-auto">
            <Form.Select
              size="sm"
              value={termsLanguage}
              onChange={handleTermsLanguageChange}
              style={{ width: 'auto' }}
            >
              {Object.keys(dataProcessingTermsTemplates).map(lang => (
                <option key={lang} value={lang}>
                  {languageNames[lang] || lang}
                </option>
              ))}
            </Form.Select>
          </div>
        </Modal.Header>
        <Modal.Body>
          <ReactMarkdown>
            {dataProcessingTermsTemplates[termsLanguage] || dataProcessingTermsTemplates.uk}
          </ReactMarkdown>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowTerms(false)}
          >
            {getUIText('closeButton')}
          </Button>
          <Button
            variant="primary"
            onClick={handleAcceptTerms}
            disabled={dataConsentAccepted}
          >
            {dataConsentAccepted ? (
              <span className="d-flex align-items-center">
                <Check size={16} className="me-1" /> {getUIText('alreadyAccepted')}
              </span>
            ) : getUIText('acceptButton')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ConsentSection;