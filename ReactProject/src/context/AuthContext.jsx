// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Create the Context (The Brain)
export const AuthContext = createContext();

// 2. Create the Provider (The wrapper that shares the brain with your app)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 3. Check the backpack on page load
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUser(JSON.parse(storedUserInfo));
    }
  }, []);

  // 4. The Login Function
  const login = (userData) => {
    setUser(userData); // Save to React state
    localStorage.setItem('userInfo', JSON.stringify(userData)); // Save to browser backpack
    navigate('/'); // Send them to the dashboard
  };

  // 5. The Logout Function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('userInfo', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};