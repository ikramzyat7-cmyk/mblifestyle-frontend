import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem('admin_token');
  if (!token) return <Navigate to="/login" />;

  return children;
}

export default ProtectedRoute;