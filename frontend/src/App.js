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
import AdminDashboard from './components/admin/AdminDashboard';
import OrdersPanel from './components/admin/panels/OrdersPanel';
import CustomersPanel from './components/admin/panels/CustomersPanel';
import ProductsPanel from './components/admin/panels/ProductsPanel';
import ReportsPanel from './components/admin/panels/ReportsPanel';
import { Navigate } from 'react-router-dom';
import Register from './components/Register';
import { CartProvider } from './context/CartContext';
import CheckoutPage from './components/ChackoutPage';
import DeliveryPage from './components/DeliveryPage';
import DeliveryPanel from './components/admin/panels/DeliveryPanel';




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
            <Route path="/profile" element={<Profile />} />
        <Route path="/client" element={<ClientPage />} />
        {/* Админ маршруты */}
      <Route path="/admin" element={<AdminDashboard />}>
        <Route index element={<Navigate to="/admin/orders" replace />} />
        <Route path="orders" element={<OrdersPanel />} />
        <Route path="customers" element={<CustomersPanel />} />
        <Route path="products" element={<ProductsPanel />} />
        <Route path="reports" element={<ReportsPanel />} />
        <Route path="delivery" element={<DeliveryPanel />} />
      </Route>
      <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer/>
      </div>
    </Router>
    </CartProvider>
    
  );
}

export default App;
