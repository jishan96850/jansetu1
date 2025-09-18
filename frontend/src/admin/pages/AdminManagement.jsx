import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi } from '../../services/api';

const AdminManagement = () => {
  const { admin } = useAdminAuth();
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    location: {
      state: admin?.location.state || '',
      district: admin?.location.district || '',
      block: admin?.location.block || '',
      village: ''
    }
  });

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  const fetchSubAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getSubAdmins();
      
      if (response.data.success) {
        const admins = response.data.data.admins || [];
        setSubAdmins(Array.isArray(admins) ? admins : []);
      } else {
        setError('Failed to fetch sub-admins');
        setSubAdmins([]);
      }
    } catch (error) {
      setError('Error loading sub-admins');
      setSubAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await adminApi.createSubAdmin(formData);
      
      if (response.data.success) {
        alert('Sub-admin created successfully!');
        setShowCreateForm(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          role: '',
          location: {
            state: admin?.location.state || '',
            district: admin?.location.district || '',
            block: admin?.location.block || '',
            village: ''
          }
        });
        fetchSubAdmins();
      } else {
        alert(response.data.message || 'Failed to create sub-admin');
      }
    } catch (error) {
      alert('Error creating sub-admin: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteAdmin = async (adminId, adminName) => {
    if (!confirm(`Are you sure you want to delete admin "${adminName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await adminApi.deleteAdmin(adminId);
      
      if (response.data.success) {
        alert('Admin deleted successfully!');
        fetchSubAdmins(); // Refresh the list
      } else {
        alert(response.data.message || 'Failed to delete admin');
      }
    } catch (error) {
      alert('Error deleting admin: ' + (error.response?.data?.message || error.message));
    }
  };

  const getRoleEmoji = (role) => {
    switch (role) {
      case 'StateAdmin': return '🏛️';
      case 'DistrictAdmin': return '🏢';
      case 'BlockAdmin': return '🏘️';
      case 'VillageAdmin': return '🏠';
      default: return '👤';
    }
  };

  const getAvailableRoles = () => {
    switch (admin?.role) {
      case 'StateAdmin':
        return [
          { value: 'DistrictAdmin', label: 'District Admin' }
        ];
      case 'DistrictAdmin':
        return [
          { value: 'BlockAdmin', label: 'Block Admin' }
        ];
      case 'BlockAdmin':
        return [
          { value: 'VillageAdmin', label: 'Village Admin' }
        ];
      default:
        return [];
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Management</h1>
          <p className="text-gray-600">Create and manage sub-administrators</p>
        </div>
        
        {getAvailableRoles().length > 0 && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Create Sub-Admin
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
        >
          <div className="flex items-center">
            <span className="text-xl mr-2">⚠️</span>
            <span>{error}</span>
            <button 
              onClick={fetchSubAdmins}
              className="ml-auto text-sm bg-red-200 hover:bg-red-300 px-3 py-1 rounded"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}

      {/* Current Admin Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6 mb-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Admin Profile</h2>
        <div className="flex items-center space-x-4">
          <div className="text-3xl">{getRoleEmoji(admin?.role)}</div>
          <div>
            <h3 className="font-medium text-gray-900">{admin?.name}</h3>
            <p className="text-sm text-gray-600">{admin?.email}</p>
            <p className="text-sm text-gray-500">
              {admin?.role} - {admin?.location.state}
              {admin?.location.district && `, ${admin.location.district}`}
              {admin?.location.block && `, ${admin.location.block}`}
              {admin?.location.village && `, ${admin.location.village}`}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Sub-Admins List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md"
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Sub-Administrators ({subAdmins.length})
            </h2>
            <button
              onClick={fetchSubAdmins}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading sub-admins...</p>
          </div>
        ) : subAdmins.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sub-Admins</h3>
            <p className="text-gray-600 mb-4">You haven't created any sub-administrators yet.</p>
            {getAvailableRoles().length > 0 && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Sub-Admin
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {Array.isArray(subAdmins) && subAdmins.map((subAdmin) => (
              <div key={subAdmin._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getRoleEmoji(subAdmin.role)}</div>
                    <div>
                      <h3 className="font-medium text-gray-900">{subAdmin.name}</h3>
                      <p className="text-sm text-gray-600">{subAdmin.email}</p>
                      <p className="text-sm text-gray-500">
                        {subAdmin.role} - {subAdmin.location.state}
                        {subAdmin.location.district && `, ${subAdmin.location.district}`}
                        {subAdmin.location.block && `, ${subAdmin.location.block}`}
                        {subAdmin.location.village && `, ${subAdmin.location.village}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        Created: {formatDate(subAdmin.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subAdmin.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subAdmin.isActive ? 'Active' : 'Inactive'}
                    </span>
                    
                    <button 
                      onClick={() => handleDeleteAdmin(subAdmin._id, subAdmin.name)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create Admin Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Create Sub-Administrator</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Role</option>
                  {getAvailableRoles().map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              
              {/* Location Fields */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Location</h3>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.location.state}
                    onChange={(e) => setFormData({
                      ...formData, 
                      location: {...formData.location, state: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                {(formData.role === 'DistrictAdmin' || formData.role === 'BlockAdmin' || formData.role === 'VillageAdmin') && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">District</label>
                    <input
                      type="text"
                      value={formData.location.district}
                      onChange={(e) => setFormData({
                        ...formData, 
                        location: {...formData.location, district: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}
                
                {(formData.role === 'BlockAdmin' || formData.role === 'VillageAdmin') && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Block</label>
                    <input
                      type="text"
                      value={formData.location.block}
                      onChange={(e) => setFormData({
                        ...formData, 
                        location: {...formData.location, block: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}
                
                {formData.role === 'VillageAdmin' && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Village</label>
                    <input
                      type="text"
                      value={formData.location.village}
                      onChange={(e) => setFormData({
                        ...formData, 
                        location: {...formData.location, village: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;