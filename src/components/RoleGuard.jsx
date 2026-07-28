import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function RoleGuard({ children, allow }) {
  const { currentUser, loadingUser } = useAuth();

  if (loadingUser) return null;

  if (!currentUser || !allow.includes(currentUser.role)) {
    return <Navigate to="/admin/commandes" />;
  }

  return children;
}

export default RoleGuard;