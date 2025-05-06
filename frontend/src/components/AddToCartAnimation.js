import React, { useEffect, useRef, useState } from 'react';
import './Animation.css';

const AddToCartAnimation = ({
  isActive,
  productImage,
  productId,
  sourcePosition,
  targetPosition,
  onAnimationComplete
}) => {
  const animatedImageRef = useRef(null);
  
  // Add a state to track image loading errors
  const [imageError, setImageError] = useState(false);
  
  // Default fallback image
  const defaultImageUrl = '/assets/default-product.png';

  useEffect(() => {
    if (isActive && animatedImageRef.current) {
      const element = animatedImageRef.current;
      
      // First, remove any existing animation class to reset
      element.classList.remove('fly-to-cart');
      
      // IMPORTANT: For fixed positioning, we use viewport-relative coordinates
      element.style.top = `${sourcePosition.top - window.scrollY}px`;
      element.style.left = `${sourcePosition.left - window.scrollX}px`;
      
      // Calculate deltas for animation
      const deltaX = targetPosition.left - sourcePosition.left;
      const deltaY = targetPosition.top - sourcePosition.top;
      
      console.log('Animation deltas:', { deltaX, deltaY });
      
      // Set the CSS variables for animation
      element.style.setProperty('--end-x', `${deltaX}px`);
      element.style.setProperty('--end-y', `${deltaY}px`);
      
      // Force a reflow before adding the animation class
      void element.offsetWidth;
      
      // Now add the animation class to start the movement
      element.classList.add('fly-to-cart');
      
      // Add the bounce animation to cart icon
      const cartIcon = document.querySelector('.cart-icon-container');
      if (cartIcon) {
        setTimeout(() => {
          cartIcon.classList.add('cart-animation-active');
        }, 600); // Delay to match when item arrives at cart
        
        setTimeout(() => {
          cartIcon.classList.remove('cart-animation-active');
        }, 1100);
      }
      
      // Clean up animation when it's done
      const animationDuration = 800; // Match this with CSS duration
      setTimeout(() => {
        onAnimationComplete();
      }, animationDuration);
    }
  }, [isActive, sourcePosition, targetPosition, onAnimationComplete, productId]);

  // Don't render anything if animation is not active
  if (!isActive) return null;
  
  // Handle case when no valid product image is provided
  const imgSrc = productImage || defaultImageUrl;

  return (
    <img
      ref={animatedImageRef}
      src={imgSrc}
      alt="Product"
      className="animated-product-image"
      data-product-id={productId}
      onError={(e) => {
        console.error('Failed to load animation image:', imgSrc);
        e.target.src = defaultImageUrl; // Fallback to default image
        setImageError(true);
      }}
      style={{
        // Ensure image is properly sized and hidden when not in use
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        visibility: isActive ? 'visible' : 'hidden',
      }}
    />
  );
};

export default AddToCartAnimation;