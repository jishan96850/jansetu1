import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../../services/api';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(sessionStorage.getItem('adminToken'));

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (token) {
        const response = await adminApi.getProfile();
        if (response.data.success) {
          setAdmin(response.data.data.admin); // Fixed: accessing nested admin data
        } else {
          logout();
        }
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await adminApi.login(email, password);
      
      if (response.data.success) {
        const { token: newToken, admin: adminData } = response.data.data; // Fixed: accessing nested data
        
        sessionStorage.setItem('adminToken', newToken);
        setToken(newToken);
        setAdmin(adminData);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.data.message || 'Login failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await adminApi.logout();
      }
    } catch (error) {
    } finally {
      sessionStorage.removeItem('adminToken');
      setToken(null);
      setAdmin(null);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await adminApi.changePassword(currentPassword, newPassword);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const hasPermission = (requiredRoles = []) => {
    if (!admin) return false;
    if (requiredRoles.length === 0) return true;
    return requiredRoles.includes(admin.role);
  };

  const canManageLocation = (targetLocation) => {
    if (!admin) return false;
    
    // StateAdmin can manage all locations in their state
    if (admin.role === 'StateAdmin') {
      return targetLocation.state === admin.location.state;
    }
    
    // DistrictAdmin can manage locations in their district
    if (admin.role === 'DistrictAdmin') {
      return targetLocation.state === admin.location.state &&
             targetLocation.district === admin.location.district;
    }
    
    // BlockAdmin can manage locations in their block
    if (admin.role === 'BlockAdmin') {
      return targetLocation.state === admin.location.state &&
             targetLocation.district === admin.location.district &&
             targetLocation.block === admin.location.block;
    }
    
    // VillageAdmin can only manage their village
    if (admin.role === 'VillageAdmin') {
      return targetLocation.state === admin.location.state &&
             targetLocation.district === admin.location.district &&
             targetLocation.block === admin.location.block &&
             targetLocation.village === admin.location.village;
    }
    
    return false;
  };

  const value = {
    admin,
    loading,
    login,
    logout,
    changePassword,
    hasPermission,
    canManageLocation,
    isAuthenticated: !!admin
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};