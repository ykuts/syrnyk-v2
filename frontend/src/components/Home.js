import Button from 'react-bootstrap/Button';
import Products from './Products';
import Header from './Header';


const Home = () => {
    return (
        <div> 
        <Header />
        <div className='blue-bg'>
            {/* <h1>Home page</h1>
            <Button variant="primary">Primary</Button>{' '} */}
            <Products />
            
            </div>
         
        

        </div>

     );
}
 
export default Home;