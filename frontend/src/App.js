import './App.css';
import Home from './components/Home';
import NotFound from './components/NotFound';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import ProductDetails from './components/ProductDetails';
import Menu from './components/Menu';


function App() {
  return (
    <Router>
      <div className="app">
        
        <div>
        <Menu />
       
        </div>
                
        
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            {/* <Route path="/delivery" element={<DeliveryDetails />} /> */}
            <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer/>
      </div>
    </Router>
    
  );
}

export default App;
