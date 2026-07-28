import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      api.get('/me')
        .then((res) => {
          setCurrentUser(res.data);
          setLoadingUser(false);
        })
        .catch(() => {
          setCurrentUser(null);
          setLoadingUser(false);
        });
    } else {
      setLoadingUser(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, loadingUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}