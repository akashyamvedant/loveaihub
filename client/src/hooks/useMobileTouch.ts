import { useEffect, useState } from 'react';

interface TouchGesture {
  startX: number;
  startY: number;
  startTime: number;
}

export const useMobileTouch = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setIsMobile(mobile);
      setIsTouch(touch);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const handleLongPress = (callback: () => void, delay = 500) => {
    let pressTimer: NodeJS.Timeout;
    
    const start = (e: TouchEvent | MouseEvent) => {
      pressTimer = setTimeout(() => {
        callback();
      }, delay);
    };
    
    const cancel = () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
      }
    };
    
    return {
      onTouchStart: start,
      onTouchEnd: cancel,
      onTouchMove: cancel,
      onMouseDown: start,
      onMouseUp: cancel,
      onMouseLeave: cancel,
    };
  };

  const handleSwipe = (
    onSwipeLeft?: () => void,
    onSwipeRight?: () => void,
    onSwipeUp?: () => void,
    onSwipeDown?: () => void,
    threshold = 50
  ) => {
    let gesture: TouchGesture | null = null;
    
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      gesture = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
      };
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!gesture) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - gesture.startX;
      const deltaY = touch.clientY - gesture.startY;
      const deltaTime = Date.now() - gesture.startTime;
      
      // Must be a quick gesture (less than 500ms)
      if (deltaTime > 500) return;
      
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      
      // Horizontal swipe
      if (absDeltaX > absDeltaY && absDeltaX > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
      // Vertical swipe
      else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
      
      gesture = null;
    };
    
    return {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
    };
  };

  const addTouchFeedback = (element: HTMLElement) => {
    if (!isTouch) return;
    
    const addRipple = (e: TouchEvent) => {
      const rect = element.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        pointer-events: none;
        transform: scale(0);
        animation: ripple 0.6s linear;
        left: ${x - 10}px;
        top: ${y - 10}px;
        width: 20px;
        height: 20px;
      `;
      
      element.style.position = 'relative';
      element.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    };
    
    element.addEventListener('touchstart', addRipple);
    
    return () => {
      element.removeEventListener('touchstart', addRipple);
    };
  };

  return {
    isMobile,
    isTouch,
    handleLongPress,
    handleSwipe,
    addTouchFeedback,
  };
};

// CSS for ripple effect
const rippleStyles = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = rippleStyles;
  document.head.appendChild(style);
}
