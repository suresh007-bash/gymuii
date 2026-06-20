import { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../data/mockUsers';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('synnoviq_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [allUsers, setAllUsers] = useState(() => {
    const saved = localStorage.getItem('synnoviq_all_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  useEffect(() => {
    if (user) localStorage.setItem('synnoviq_user', JSON.stringify(user));
    else localStorage.removeItem('synnoviq_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('synnoviq_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  const login = (email, password) => {
    const found = allUsers.find(u => u.email === email && u.password === password);
    if (found) {
      if (found.blocked) return { success: false, error: 'Your account has been temporarily blocked. Please contact the administrator.' };
      setUser(found); return { success: true, user: found };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const register = (userData) => {
    const exists = allUsers.find(u => u.email === userData.email);
    if (exists) return { success: false, error: 'Email already exists' };
    const newUser = { ...userData, id: 'u' + Date.now(), joinDate: new Date().toISOString().split('T')[0] };
    setAllUsers(prev => [...prev, newUser]);
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => { setUser(null); };

  const promoteUser = (userId, newRole, extra = {}) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole, ...extra } : u));
    // Don't update the logged-in user's role to prevent ProtectedRoute redirect
  };

  const blockUser = (userId) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, blocked: true, blockedAt: new Date().toISOString().split('T')[0] } : u));
  };

  const unblockUser = (userId) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, blocked: false, blockedAt: null } : u));
  };

  const addUser = (userData) => {
    const newUser = { ...userData, id: 'u' + Date.now(), password: userData.password || '12345678', requirePasswordChange: userData.requirePasswordChange !== undefined ? userData.requirePasswordChange : true, joinDate: new Date().toISOString().split('T')[0] };
    setAllUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (userId, updates) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (user?.id === userId) setUser(prev => ({ ...prev, ...updates }));
  };

  const deleteUser = (userId) => {
    setAllUsers(prev => prev.filter(u => u.id !== userId));
  };

  const getUsersByRole = (role) => allUsers.filter(u => u.role === role);
  const getUsersByGym = (gymId) => allUsers.filter(u => u.gymId === gymId);
  const getTrainerClients = (trainerId) => allUsers.filter(u => u.role === 'client' && u.trainerId === trainerId && !u.blocked);
  const getOwnerClients = (ownerId) => {
    const owner = allUsers.find(u => u.id === ownerId);
    if (!owner) return [];
    return allUsers.filter(u => u.role === 'client' && u.gymId === owner.gymId && !u.blocked);
  };
  const getOwnerTrainers = (ownerId) => {
    const owner = allUsers.find(u => u.id === ownerId);
    if (!owner) return [];
    return allUsers.filter(u => u.role === 'trainer' && u.gymId === owner.gymId && !u.blocked);
  };
  const getDirectClients = (ownerId) => {
    const owner = allUsers.find(u => u.id === ownerId);
    if (!owner) return [];
    return allUsers.filter(u => u.role === 'client' && u.gymId === owner.gymId && !u.trainerId && !u.blocked);
  };

  return (
    <AuthContext.Provider value={{ user, allUsers, login, register, logout, promoteUser, blockUser, unblockUser, addUser, updateUser, deleteUser, getUsersByRole, getUsersByGym, getTrainerClients, getOwnerClients, getOwnerTrainers, getDirectClients }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
