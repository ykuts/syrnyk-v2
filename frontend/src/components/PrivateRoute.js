import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Можно добавить компонент загрузки
    return <div>Loading...</div>;
  }

  if (!user) {
    // Если пользователь не авторизован, перенаправляем на страницу входа
    return <Navigate to="/" />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    // Если требуются права админа, но у пользователя их нет
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;