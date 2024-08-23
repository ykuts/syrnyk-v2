import Button from 'react-bootstrap/Button';
import WelcomeAboutSection from './WelcomeAboutSection';
import data from "../data/about.json"
import Review from './Review';
import Order from './Order';

const Home = () => {
    return (
        <div> 
        <div className='blue-bg'>
            <h1>Home page</h1>
            <Button variant="primary">Primary</Button>{' '}
            <h2>Продукція</h2>
            <p>сир кисломолочний</p>
            <p>голубці</p>
            <p>сирки в шоколаді</p>
            <p>сирники</p>
            <p>йогурт</p>
            </div>
         <WelcomeAboutSection data={data.filter((item) => item.id)}/>
        {/*<Products />
        <Delivery /> */}
        <Review />
        <Order /> 

        </div>

     );
}
 
export default Home;