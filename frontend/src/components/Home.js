import Button from 'react-bootstrap/Button';
import Products from './Products';


const Home = () => {
    return (
        <div> 
        <div className='blue-bg'>
            <h1>Home page</h1>
            <Button variant="primary">Primary</Button>{' '}
            <Products />
            
            </div>
         
        

        </div>

     );
}
 
export default Home;