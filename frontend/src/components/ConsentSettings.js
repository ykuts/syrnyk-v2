import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { apiClient } from '../../utils/api';
import ReactMarkdown from 'react-markdown';
import { consentCheckboxText, marketingConsentText } from '../../templates/dataProcessingTermsTemplate';

const ConsentSettings = ({ user }) => {
  const [consentData, setConsentData] = useState({
    dataConsentAccepted: user?.dataConsentAccepted || false,
    marketingConsent: user?.marketingConsent || false
  });
  
  const [termsData, setTermsData] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [termsLanguage, setTermsLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTerms, setIsLoadingTerms] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Get browser language or default to English
  useEffect(() => {
    // Get browser language code (e.g. 'en-US' -> 'en')
    const browserLang = navigator.language.split('-')[0];
    // Check if we support this language
    if (termsData && termsData.supportedLanguages.includes(browserLang)) {
      setTermsLanguage(browserLang);
    }
  }, [termsData]);
  
  // Fetch data processing terms
  useEffect(() => {
    const fetchTerms = async () => {
      setIsLoadingTerms(true);
      try {
        const response = await apiClient.get('/users/data-processing-terms');
        setTermsData(response);
      } catch (error) {
        console.error('Error fetching terms:', error);
      } finally {
        setIsLoadingTerms(false);
      }
    };

    fetchTerms();
  }, []);
  
  // Update local state when user prop changes
  useEffect(() => {
    if (user) {
      setConsentData({
        dataConsentAccepted: user.dataConsentAccepted || false,
        marketingConsent: user.marketingConsent || false
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setConsentData({
      ...consentData,
      [name]: checked
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const response = await apiClient.put('/users/consent', consentData, headers);
      
      setMessage({
        type: 'success',
        text: 'Your consent settings have been updated successfully.'
      });
    } catch (error) {
      console.error('Error updating consent:', error);
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Error updating your consent settings. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTerms = () => {
    setShowTerms(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Data Privacy Settings</h5>
      </Card.Header>
      <Card.Body>
        {message.text && (
          <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible>
            {message.text}
          </Alert>
        )}
        
        {user?.dataConsentDate && (
          <div className="mb-3">
            <p className="text-muted mb-1">
              <small>You accepted the data processing terms (version {user.dataConsentVersion || 'unknown'}) on:</small>
            </p>
            <p className="mb-0">
              <strong>{formatDate(user.dataConsentDate)}</strong>
            </p>
          </div>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="dataConsentAccepted"
              name="dataConsentAccepted"
              checked={consentData.dataConsentAccepted}
              onChange={handleChange}
              label={
                <>
                  {consentCheckboxText[termsLanguage] || consentCheckboxText.en} <Button 
                    variant="link" 
                    className="p-0 align-baseline" 
                    onClick={handleViewTerms}
                  >
                    {termsLanguage === 'en' ? 'data processing terms' : ''}
                  </Button>
                </>
              }
            />
            <Form.Text className="text-muted">
              This consent is required to use our services.
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Check
              type="checkbox"
              id="marketingConsent"
              name="marketingConsent"
              checked={consentData.marketingConsent}
              onChange={handleChange}
              label={marketingConsentText[termsLanguage] || marketingConsentText.en}
            />
            <Form.Text className="text-muted">
              You can opt out of marketing communications at any time.
            </Form.Text>
          </Form.Group>
          
          <div className="text-muted small mb-3">
            <p className="mb-1">
              Your personal data is processed in accordance with the Swiss Federal Act on 
              Data Protection (FADP/DSG). For more information about how we handle your data, 
              please view our <Button 
                variant="link" 
                className="p-0 align-baseline" 
                onClick={handleViewTerms}
              >
                data processing terms
              </Button>.
            </p>
          </div>
          
          <Button 
            variant="primary" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Updating...
              </>
            ) : 'Update Consent Settings'}
          </Button>
        </Form>
      </Card.Body>
      
      {/* Data Processing Terms Modal */}
      <Modal 
        show={showTerms} 
        onHide={() => setShowTerms(false)} 
        size="lg"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>Data Processing Terms</Modal.Title>
          <div className="ms-auto">
            <Form.Select
              size="sm"
              value={termsLanguage}
              onChange={e => setTermsLanguage(e.target.value)}
              style={{ width: 'auto' }}
            >
              {termsData && termsData.supportedLanguages.map(lang => (
                <option key={lang} value={lang}>
                  {getLangName(lang)}
                </option>
              ))}
            </Form.Select>
          </div>
        </Modal.Header>
        <Modal.Body>
          {isLoadingTerms ? (
            <div className="text-center p-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : termsData ? (
            <ReactMarkdown>
              {termsData.content[termsLanguage]}
            </ReactMarkdown>
          ) : (
            <Alert variant="warning">
              Failed to load data processing terms. Please try again.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowTerms(false)}
          >
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              setConsentData({
                ...consentData,
                dataConsentAccepted: true
              });
              setShowTerms(false);
            }}
            disabled={consentData.dataConsentAccepted}
          >
            {consentData.dataConsentAccepted ? 'Already Accepted' : 'Accept Terms'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

// Helper function to get full language name from code
const getLangName = (code) => {
  const langNames = {
    en: 'English',
    de: 'Deutsch',
    fr: 'Français',
    it: 'Italiano',
    uk: 'Українська'
  };
  return langNames[code] || code;
};

export default ConsentSettings;