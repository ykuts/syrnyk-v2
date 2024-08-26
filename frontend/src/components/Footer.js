import React from 'react';
import Image from 'react-bootstrap/esm/Image';

const Footer = () => {
    return ( 
      <div  className="blue-bg text-white w-100">

      {/* <div className='text-center p-3' style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
        &copy; {new Date().getFullYear()} Copyright:{' '}
        <a className='text-white' href='https://ykn-portfolio.netlify.app/'>
          YKStudio
        </a> */}

        
            
            <Image src="/assets/streaks-bottom.png" alt="streaks" fluid></Image> 
        </div>
      
    
     );
}
 
export default Footer;