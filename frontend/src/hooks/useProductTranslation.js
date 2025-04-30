import { useTranslation } from 'react-i18next';

/**
 * Custom hook for handling product translations
 * @param {Object} product - The product object with translations
 * @returns {Object} - Methods to get translated fields
 */
export const useProductTranslation = (product) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  
  /**
   * Gets a translated field value with fallback to the default product field
   * @param {string} field - Field name to translate
   * @returns {string} - Translated content or fallback
   */
  const getField = (field) => {
    if (!product) return '';
    
    // Try to get field from translations
    if (product.translations && 
        product.translations[currentLang] && 
        product.translations[currentLang][field]) {
      return product.translations[currentLang][field];
    }
    
    // Fallback to product's default field
    return product[field] || '';
  };
  
  return {
    getField,
    // Convenience methods for common fields
    getName: () => getField('name'),
    getDescription: () => getField('description'),
    getDescriptionFull: () => getField('descriptionFull'),
    getWeight: () => getField('weight'),
    getUmovy: () => getField('umovy'),
    getRecipe: () => getField('recipe')
  };
};