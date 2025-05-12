import React, { useState } from 'react';
import { Form, Button, Tabs, Tab, Row, Col, Alert } from 'react-bootstrap';

const StationTranslationsForm = ({ translations, availableLanguages, onChange }) => {
  const [activeTab, setActiveTab] = useState('uk');
  const [error, setError] = useState(null);

  // Initialize translations for available languages if not provided
  const initTranslations = () => {
    const initialTranslations = { ...translations };
    availableLanguages.forEach(lang => {
      if (!initialTranslations[lang]) {
        initialTranslations[lang] = { name: '', meetingPoint: '' };
      }
    });
    return initialTranslations;
  };

  const [translationData, setTranslationData] = useState(initTranslations);

  const handleChange = (lang, field, value) => {
    setTranslationData(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value
      }
    }));

    // Call parent onChange with updated translations
    const updatedTranslations = {
      ...translationData,
      [lang]: {
        ...translationData[lang],
        [field]: value
      }
    };
    onChange(updatedTranslations);
  };

  // Helper to get language display names
  const getLanguageName = (code) => {
    const langNames = {
      uk: 'Українська',
      en: 'English',
      fr: 'Français'
    };
    return langNames[code] || code;
  };

  return (
    <div className="mb-4">
      <h5 className="mb-3">Translations</h5>
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        {availableLanguages.map(lang => (
          <Tab key={lang} eventKey={lang} title={getLanguageName(lang)}>
            <Form.Group className="mb-3">
              <Form.Label>Name ({getLanguageName(lang)})</Form.Label>
              <Form.Control
                type="text"
                value={translationData[lang]?.name || ''}
                onChange={(e) => handleChange(lang, 'name', e.target.value)}
                placeholder={`Station name in ${getLanguageName(lang)}`}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Meeting Point ({getLanguageName(lang)})</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={translationData[lang]?.meetingPoint || ''}
                onChange={(e) => handleChange(lang, 'meetingPoint', e.target.value)}
                placeholder={`Meeting point details in ${getLanguageName(lang)}`}
              />
            </Form.Group>
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default StationTranslationsForm;