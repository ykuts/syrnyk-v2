import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Spinner,
  Alert
} from 'react-bootstrap';


const CustomersPanel = () => {
  const [users, setUsers] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          Ошибка: {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Управління клієнтами</h2>
        
      </div>

      

     
    </Container>
  );
};

export default CustomersPanel;