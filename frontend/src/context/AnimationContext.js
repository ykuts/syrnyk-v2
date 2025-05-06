// src/context/AnimationContext.js
import React, { createContext, useState, useContext } from 'react';

const AnimationContext = createContext(null);

export const AnimationProvider = ({ children }) => {
  const [animationState, setAnimationState] = useState({
    isActive: false,
    productImage: '',
    productId: null,
    sourcePosition: { top: 0, left: 0 },
    targetPosition: { top: 0, left: 0 }
  });

  const triggerAnimation = (productImage, productId, sourcePosition, targetPosition) => {
    console.log("Animation triggered:", { productImage, productId, sourcePosition, targetPosition });
    setAnimationState({
      isActive: true,
      productImage,
      productId,
      sourcePosition,
      targetPosition
    });
  };

  const resetAnimation = () => {
    console.log("Animation reset");
    // Using a small timeout to ensure animation is complete before resetting
    setTimeout(() => {
      setAnimationState({
        isActive: false,
        productImage: '',
        productId: null,
        sourcePosition: { top: 0, left: 0 },
        targetPosition: { top: 0, left: 0 }
      });
    }, 50);
  };

  return (
    <AnimationContext.Provider value={{ animationState, triggerAnimation, resetAnimation }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (context === null) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};