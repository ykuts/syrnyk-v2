import { useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../context/CartContext';
import { apiClient } from '../utils/api';

/**
 * Component that synchronizes cart items with the current language
 * This component doesn't render anything, it just performs the sync logic
 */
const CartLanguageSync = () => {
  const { i18n } = useTranslation();
  const { cartItems, setCartItems } = useContext(CartContext);
  
  // Reference to track the last processed language
  const lastProcessedLang = useRef(i18n.language);
  
  // Update cart items when language changes
  useEffect(() => {
    // Skip if cart is empty
    if (cartItems.length === 0) return;
    
    // Skip if language hasn't changed
    if (lastProcessedLang.current === i18n.language) return;
    
    // Update reference
    lastProcessedLang.current = i18n.language;
    
    console.log(`Language changed to ${i18n.language}, updating cart items`);
    
    const updateCartWithCurrentLanguage = async () => {
      try {
        // For each item in cart, fetch its updated data with current language
        const updatedItems = await Promise.all(
          cartItems.map(async (item) => {
            try {
              // Fetch product with current language
              const updatedProduct = await apiClient.get(`/products/${item.id}?lang=${i18n.language}`);
              
              // Return updated item with new language data but preserve quantity
              return {
                ...updatedProduct,
                quantity: item.quantity,
                // Ensure price is preserved as a number to avoid calculation issues
                price: Number(updatedProduct.price || item.price)
              };
            } catch (error) {
              console.error(`Error updating cart item ${item.id}:`, error);
              return item; // Return original item if update fails
            }
          })
        );
        
        // Update cart state with translated items
        setCartItems(updatedItems);
        
        // Update localStorage
        localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      } catch (error) {
        console.error('Error updating cart with current language:', error);
      }
    };
    
    updateCartWithCurrentLanguage();
  }, [i18n.language, cartItems, setCartItems]);

  // This component doesn't render anything
  return null;
};

export default CartLanguageSync;