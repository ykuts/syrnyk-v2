
import Image from 'react-bootstrap/esm/Image';

const Header = () => {
    return ( 
        <div>
            
        <Image src="/assets/logo2.png" alt="logo" fluid className='logo-header'/>
        
        {/* <OrderBox /> */}
        <div  className="blue-bg text-white w-100">

        <picture>
      {/* Изображение для мобильных устройств */}
      <source media="(max-width: 768px)" srcSet="/assets/streaks-mobile.png" />

      {/* Изображение для планшетов */}
      <source media="(max-width: 992px)" srcSet="/assets/streaks-tablet.png" />

      {/* Изображение для десктопов */}
      <source media="(min-width: 993px)" srcSet="/assets/streaks-desktop.png" />

      {/* Фолбэк изображение на случай, если браузер не поддерживает <picture> */}
      <Image src="/assets/streaks-desktop.png" alt="streaks" fluid />
    </picture>
            
            {/* <Image src="/assets/streaks.png" alt="streaks" fluid></Image>  */}
        </div>
        
        </div>
     );
}
 
export default Header;