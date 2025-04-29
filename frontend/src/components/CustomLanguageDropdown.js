import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CustomLanguageDropdown = () => {
  // State for managing dropdown visibility
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { i18n } = useTranslation();
  
  // Options for the dropdown
  const options = [
    { value: 'uk', label: 'UA', fullName: 'Українська' },
    { value: 'en', label: 'EN', fullName: 'English' },
    { value: 'fr', label: 'FR', fullName: 'Français' }
  ];

  // Set initial language based on browser or previously saved preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng') || 'uk';
    if (savedLanguage && i18n.language !== savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

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

  // Handle keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;
      
      if (event.key === 'Escape') {
        setIsOpen(false);
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        
        const currentIndex = options.findIndex(option => option.value === i18n.language);
        let newIndex;
        
        if (event.key === 'ArrowDown') {
          newIndex = (currentIndex + 1) % options.length;
        } else {
          newIndex = (currentIndex - 1 + options.length) % options.length;
        }
        
        i18n.changeLanguage(options[newIndex].value);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, i18n, options]);

  // Handle option selection
  const handleSelect = (optionValue) => {
    i18n.changeLanguage(optionValue);
    localStorage.setItem('i18nextLng', optionValue);
    setIsOpen(false);
  };

  // Find current selected option
  const selectedOption = options.find(option => option.value === i18n.language) || options[0];

  return (
    <div 
      ref={dropdownRef}
      style={{ position: 'relative', display: 'inline-block' }}
      className="language-dropdown"
      aria-label="Language selection"
      role="region"
    >
      {/* Mobile view - horizontal list */}
      <div className="mobile-language-selector">
        {options.map(option => (
          <div
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`language-option ${option.value === selectedOption.value ? 'active' : ''}`}
            role="button"
            aria-pressed={option.value === selectedOption.value}
            tabIndex={0}
            aria-label={`Switch to ${option.fullName}`}
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
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          role="button"
          tabIndex={0}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`Selected language: ${selectedOption.fullName}`}
          className={`selected-language ${isOpen ? 'open' : ''}`}
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
            className="dropdown-menu show"
            role="listbox"
            aria-activedescendant={`lang-option-${selectedOption.value}`}
          >
            {options.map(option => (
              <div
                key={option.value}
                id={`lang-option-${option.value}`}
                onClick={() => handleSelect(option.value)}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  transition: 'background-color 0.2s',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(option.value);
                  }
                }}
                className={`dropdown-item ${option.value === selectedOption.value ? 'active' : ''}`}
                role="option"
                aria-selected={option.value === selectedOption.value}
                tabIndex={0}
                /* onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'} */
              >
                {option.label} - {option.fullName}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomLanguageDropdown;