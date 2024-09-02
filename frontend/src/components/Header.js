
import Image from 'react-bootstrap/esm/Image';

const Header = () => {
    return ( 
        <div>
            
        <Image src="/assets/logo2.png" alt="logo" fluid className='logo-header'/>
        
        {/* <OrderBox /> */}
        <div  className="blue-bg text-white w-100">
            
            <Image src="/assets/streaks.png" alt="streaks" fluid></Image> 
        </div>
        
        </div>
     );
}
 
export default Header;