import axios from 'axios';

// Configure axios defaults
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_BASE_URL;

// Add request interceptor to include admin token
axios.interceptors.request.use(
  (config) => {
    const adminToken = sessionStorage.getItem('adminToken');
    if (adminToken && config.url.includes('/api/admin/')) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
      console.error('Network error - check if backend is running');
    }
    
    if (error.response?.status === 401) {
      // Clear tokens on unauthorized
      sessionStorage.removeItem('adminToken');
      localStorage.removeItem('token');
    }
    
    return Promise.reject(error);
  }
);

// User API functions
export const getMyReports = async (token) => {
  const res = await axios.get('/api/reports', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getAllIssues = async (token) => {
  const res = await axios.get('/api/reports', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const submitIssue = async (data, token) => {
  const res = await axios.post('/api/reports', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const updateIssueStatus = async (id, status, token) => {
  const res = await axios.patch(`/api/reports/${id}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Public stats API
export const getPublicStats = async () => {
  try {
    const res = await axios.get('/api/stats/public');
    return res.data;
  } catch (error) {
    return {
      success: false,
      data: {
        totalReported: 0,
        totalResolved: 0,
        resolutionRate: 0
      }
    };
  }
};

// Admin API functions
export const adminApi = {
  // Authentication
  login: async (email, password) => {
    return axios.post('/api/admin/auth/login', { email, password });
  },

  logout: async () => {
    return axios.post('/api/admin/auth/logout');
  },

  getProfile: async () => {
    return axios.get('/api/admin/auth/profile');
  },

  changePassword: async (currentPassword, newPassword) => {
    return axios.post('/api/admin/auth/change-password', {
      currentPassword,
      newPassword
    });
  },

  // Admin Management
  createSubAdmin: async (adminData) => {
    return axios.post('/api/admin/create-sub-admin', adminData);
  },

  getSubAdmins: async () => {
    return axios.get('/api/admin/sub-admins');
  },

  updateAdmin: async (adminId, updateData) => {
    return axios.put(`/api/admin/update-admin/${adminId}`, updateData);
  },

  deleteAdmin: async (adminId) => {
    return axios.delete(`/api/admin/delete-admin/${adminId}`);
  },

  // Complaint Management
  getComplaints: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/admin/complaints${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await axios.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getComplaintById: async (id) => {
    return axios.get(`/api/admin/complaints/${id}`);
  },

  updateComplaintStatus: async (id, status, notes = '') => {
    return axios.put(`/api/admin/complaints/${id}/status`, { status, notes });
  },

  assignComplaint: async (id, assignedTo) => {
    return axios.put(`/api/admin/complaints/${id}/assign`, { assignedTo });
  },

  getComplaintStats: async () => {
    return axios.get('/api/admin/complaints-stats');
  },

  // Analytics
  getDashboardAnalytics: async () => {
    return axios.get('/api/admin/analytics/dashboard');
  },

  getComplaintsTrend: async (period = '7d') => {
    return axios.get(`/api/admin/analytics/trends?period=${period}`);
  },

  getLocationStats: async () => {
    return axios.get('/api/admin/analytics/locations');
  }
};