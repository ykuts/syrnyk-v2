import './App.css';
import Home from './components/Home';
import NotFound from './components/NotFound';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import ProductDetails from './components/ProductDetails';
import ScrollToTop from './components/ScrollToTop';
import Menu2 from './components/Menu2';
import Profile from './components/Profile';
import ClientPage from './components/ClientPage';
import AdminPage from './components/AdminPage';
import Register from './components/Register';
import { CartProvider } from './context/CartContext';



function App() {
  return (
    <CartProvider>
    <Router>
      <ScrollToTop />
      <div className="app">
        
        <div>
        <Menu2 />
       
        </div>
                
        
        <Routes>
        
            <Route path="/" element={<Home />} />

            <Route path="/products/:id" element={<ProductDetails />} />
            {/* <Route path="/delivery" element={<DeliveryDetails />} /> */}
            <Route path="/profile" element={<Profile />} />
        <Route path="/client" element={<ClientPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer/>
      </div>
    </Router>
    </CartProvider>
    
  );
}

export default App;
