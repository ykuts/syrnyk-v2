// src/components/AddToCartAnimation.js 
import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (isActive && animatedImageRef.current) {
      const element = animatedImageRef.current;
      
      // Set the initial position
      element.style.top = `${sourcePosition.top}px`;
      element.style.left = `${sourcePosition.left}px`;
      
      // Calculate and set the animation variables based on target position
      const deltaX = targetPosition.left - sourcePosition.left;
      const deltaY = targetPosition.top - sourcePosition.top;
      
      element.style.setProperty('--end-x', `${deltaX}px`);
      element.style.setProperty('--end-y', `${deltaY}px`);
      
      // Add the animation class to start the movement
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
  }, [isActive, sourcePosition, targetPosition, onAnimationComplete, productId]); // Added productId to dependencies

  if (!isActive || !productImage) return null;

  return (
    <img
      ref={animatedImageRef}
      src={productImage}
      alt="Product flying to cart"
      className="animated-product-image"
      data-product-id={productId}
    />
  );
};

export default AddToCartAnimation;