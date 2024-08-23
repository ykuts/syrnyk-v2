import './App.css';
import Home from './components/Home';
import NotFound from './components/NotFound';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import AboutDetails from './components/AboutDetails';
import Footer from './components/Footer';


function App() {
  return (
    <Router>
      <div className="app">
        
        <div>
        <Header />
        </div>
                
        
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about/:id" element={<AboutDetails />} />
            {/* <Route path="/delivery" element={<DeliveryDetails />} /> */}
            <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer/>
      </div>
    </Router>
    
  );
}

export default App;
