import Products from './Products';
import Header from './Header';



const Home = () => {
    return (
        <div>
            
            <Header />
            <div className='blue-bg'>
                <Products />
            </div>


            
        </div>

    );
}

export default Home;