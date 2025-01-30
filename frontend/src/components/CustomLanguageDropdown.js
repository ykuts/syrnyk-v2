import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CustomLanguageDropdown = () => {
  // State for managing dropdown visibility
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { i18n } = useTranslation();
  
  // Options for the dropdown
  const options = [
    { value: 'ua', label: 'UA' },
    { value: 'en', label: 'EN' },
    { value: 'fr', label: 'FR' }
  ];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle option selection
  const handleSelect = (optionValue) => {
    i18n.changeLanguage(optionValue);
    setIsOpen(false);
  };

  // Find current selected option
  const selectedOption = options.find(option => option.value === i18n.language) || options[0];

  return (
    <div 
      ref={dropdownRef}
      style={{ position: 'relative', display: 'inline-block' }}
      className="language-dropdown"
    >
      {/* Mobile view - horizontal list */}
      <div className="mobile-language-selector">
        {options.map(option => (
          <div
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`language-option ${option.value === selectedOption.value ? 'active' : ''}`}
          >
            {option.label}
          </div>
        ))}
      </div>

      {/* Desktop dropdown */}
      <div className="desktop-language-selector">
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            cursor: 'pointer',
            userSelect: 'none',
            textAlign: 'center',
            padding: '6px 12px',
          }}
        >
          {selectedOption.label}
        </div>

        {isOpen && (
          <div 
            style={{
              position: 'absolute',
              right: 0,
              marginTop: '4px',
              backgroundColor: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 1000
            }}
          >
            {options.map(option => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomLanguageDropdown;