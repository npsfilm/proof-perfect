import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start exit animation
    setIsAnimating(true);
    
    // Wait for animation to complete before updating content
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsAnimating(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname, children]);

  return (
    <div
      className={`transition-all duration-300 ${
        isAnimating
          ? 'opacity-0 translate-y-2'
          : 'opacity-100 translate-y-0 animate-fade-in'
      }`}
    >
      {displayChildren}
    </div>
  );
}
