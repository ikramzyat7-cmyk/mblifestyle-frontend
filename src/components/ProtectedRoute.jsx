import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { currentUser, loadingUser } = useAuth();

  // Attend que la vérification du token soit terminée
  if (loadingUser) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '14px',
        color: '#888'
      }}>
        Vérification en cours...
      </div>
    );
  }

  // Si pas d'utilisateur valide → redirige vers login
  if (!currentUser) {
    return <Navigate to="/mb-gestion-2026" replace />;
  }

  return children;
}

export default ProtectedRoute;