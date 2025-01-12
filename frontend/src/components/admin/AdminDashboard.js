import { Container, Nav, Row, Col } from 'react-bootstrap';
import { Boxes, Users, ShoppingCart, Truck } from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const activeKey = location.pathname.split('/')[2] || 'orders';
  
  const handleSelect = (key) => {
    navigate(`/admin/${key}`);
  };
  
  return (
    <Container fluid className="p-0">
      <Row className="m-0">
        <Col md={2} className="p-0 min-vh-100 bg-light border-end">
          <div className="p-3 bg-primary text-white">
            <h4 className="mb-0">Адмін панель</h4>
          </div>
          <Nav
            variant="pills"
            className="flex-column mt-3"
            activeKey={activeKey}
            onSelect={handleSelect}
          >
            <Nav.Item>
              <Nav.Link
                eventKey="orders"
                className="d-flex align-items-center gap-2 px-3 py-2"
              >
                <ShoppingCart size={20} />
                Замовлення
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="customers"
                className="d-flex align-items-center gap-2 px-3 py-2"
              >
                <Users size={20} />
                Клієнти
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="products"
                className="d-flex align-items-center gap-2 px-3 py-2"
              >
                <Boxes size={20} />
                Продукція
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="delivery"
                className="d-flex align-items-center gap-2 px-3 py-2"
              >
                <Truck size={20} />
                Управління доставкою
              </Nav.Link>
            </Nav.Item>
            {/* <Nav.Item>
              <Nav.Link
                eventKey="reports"
                className="d-flex align-items-center gap-2 px-3 py-2"
              >
                <BarChart2 size={20} />
                Звіти
              </Nav.Link>
            </Nav.Item> */}
          </Nav>
        </Col>
        
        <Col md={10} className="p-3">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;