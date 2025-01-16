import './App.css';
import Home from './components/Home';
import NotFound from './components/NotFound';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import ProductDetails from './components/ProductDetails';
import ScrollToTop from './components/ScrollToTop';
import Menu2 from './components/Menu2';
import AdminDashboard from './components/admin/AdminDashboard';
import OrdersPanel from './components/admin/panels/OrdersPanel';
import CustomersPanel from './components/admin/panels/CustomersPanel';
import ProductsPanel from './components/admin/panels/ProductsPanel';
import ReportsPanel from './components/admin/panels/ReportsPanel';
import { Navigate } from 'react-router-dom';
import Register from './components/Register';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import CheckoutPage from './components/ChackoutPage';
import DeliveryPage from './components/DeliveryPage';
import DeliveryPanel from './components/admin/panels/DeliveryPanel';
import PrivateRoute from './components/PrivateRoute';
import OrderHistory from './components/OrderHistory';
import UserProfile from './components/UserProfile';
import AboutUs from './components/aboutus/AboutUs';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';



function App() {
  return (
    <AuthProvider>
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


              {/* <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } 
              /> */}

              <Route 
                path="/client" 
                element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                } 
              />

<Route
  path="/orders"
  element={
    <PrivateRoute>
      <OrderHistory />
    </PrivateRoute>
  }
/>
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <PrivateRoute adminOnly>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              >
              
                <Route index element={<Navigate to="/admin/orders" replace />} />
                <Route path="orders" element={<OrdersPanel />} />
                <Route path="customers" element={<CustomersPanel />} />
                <Route path="products" element={<ProductsPanel />} />
                <Route path="reports" element={<ReportsPanel />} />
                <Route path="delivery" element={<DeliveryPanel />} />
              </Route>

              {/* Public Routes */}
              <Route path="/aboutus" element={<AboutUs />} />
              <Route path="/delivery" element={<DeliveryPage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
