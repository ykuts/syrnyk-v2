import React from 'react';
import { useAnimation } from '../context/AnimationContext';
import AddToCartAnimation from './AddToCartAnimation';

const AnimationWrapper = () => {
  const { animationState, resetAnimation } = useAnimation();
  
  return (
    <AddToCartAnimation
      isActive={animationState.isActive}
      productImage={animationState.productImage}
      productId={animationState.productId}
      sourcePosition={animationState.sourcePosition}
      targetPosition={animationState.targetPosition}
      onAnimationComplete={resetAnimation}
    />
  );
};

export default AnimationWrapper;