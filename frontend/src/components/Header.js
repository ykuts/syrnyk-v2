// Header.js
import Image from 'react-bootstrap/esm/Image';
import './Header.css';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Header = () => {
  const location = useLocation();
  const isMainPage = location.pathname === '/';
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Add window resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return ( 
    <div>
      {/* Show logo only on main page */}
      {isMainPage && (
        <div className={isMobile ? "mobile-logo-container" : "desktop-logo-container"}>
          <Image 
            src="/assets/logo2.png" 
            alt="logo" 
            fluid 
            className={isMobile ? 'mobile-logo' : 'desktop-logo'} 
          />
        </div>
      )}
            
      <div className="blue-bg text-white w-100">
        <picture>
          <source media="(max-width: 768px)" srcSet="/assets/streaks-mobile.png" />
          <source media="(max-width: 992px)" srcSet="/assets/streaks-tablet.png" />
          <source media="(min-width: 993px)" srcSet="/assets/streaks-desktop.png" />
          <Image src="/assets/streaks-desktop.png" alt="streaks" fluid />
        </picture>
      </div>
    </div>
  );
}
 
export default Header;