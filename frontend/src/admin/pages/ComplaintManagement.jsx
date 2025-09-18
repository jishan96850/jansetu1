import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi } from '../../services/api';

const ComplaintManagement = () => {
  const { admin } = useAdminAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalRecords: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: ''
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, [filters, pagination.current]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getComplaints({
        ...filters,
        page: pagination.current,
        limit: 10
      });
      
      if (response.data.success) {
        setComplaints(response.data.data.complaints || []);
        setPagination(response.data.data.pagination || { current: 1, total: 1, totalRecords: 0 });
      } else {
        setError('Failed to fetch complaints');
      }
    } catch (error) {
      setError('Error loading complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      const response = await adminApi.updateComplaintStatus(complaintId, newStatus, 'Status updated by admin');
      
      if (response.data.success) {
        // Refresh complaints list
        fetchComplaints();
        setSelectedComplaint(null);
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      alert('Error updating complaint status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complaint Management</h1>
        <p className="text-gray-600">Manage and track citizen complaints</p>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6 mb-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Road">Road</option>
              <option value="Water">Water</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Traffic">Traffic</option>
              <option value="Health">Health</option>
              <option value="Public Safety">Public Safety</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search complaints..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </motion.div>

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
              onClick={fetchComplaints}
              className="ml-auto text-sm bg-red-200 hover:bg-red-300 px-3 py-1 rounded"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}

      {/* Complaints List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md"
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Complaints ({pagination.totalRecords})
            </h2>
            <button
              onClick={fetchComplaints}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Complaints Found</h3>
            <p className="text-gray-600">No complaints match your current filters.</p>
            <p className="text-gray-400 text-sm mt-2">Debug: complaints.length = {complaints.length}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {complaints.map((complaint, index) => {
              // Safety check for required fields
              if (!complaint || !complaint._id) {
                return null;
              }
              
              try {
                return (
                  <div key={complaint._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {complaint.title || 'No Title'}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status || 'Pending')}`}>
                            {complaint.status || 'Pending'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority || 'Medium')}`}>
                            {complaint.priority || 'Medium'}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{complaint.description || 'No description'}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                          <div>
                            <span className="font-medium">Category:</span> {complaint.category || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Location:</span> {complaint.address || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Submitted:</span> {complaint.createdAt ? formatDate(complaint.createdAt) : 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">ID:</span> {complaint.publicId || complaint._id?.slice(-8) || 'N/A'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4 space-y-2">
                        <select
                          value={complaint.status || 'Pending'}
                          onChange={(e) => handleStatusUpdate(complaint._id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        
                        <button
                          onClick={() => setSelectedComplaint(complaint)}
                          className="block w-full px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              } catch (error) {
                return (
                  <div key={`error-${index}`} className="p-4 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-600">Error rendering complaint #{index + 1}</p>
                  </div>
                );
              }
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && complaints.length > 0 && pagination.total > 1 && (
          <div className="p-6 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {((pagination.current - 1) * 10) + 1} to {Math.min(pagination.current * 10, pagination.totalRecords)} of {pagination.totalRecords} complaints
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                  disabled={pagination.current === 1}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(pagination.total)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setPagination(prev => ({ ...prev, current: index + 1 }))}
                    className={`px-3 py-1 text-sm rounded ${
                      pagination.current === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                  disabled={pagination.current === pagination.total}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Complaint Details</h2>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Title</h3>
                <p className="text-gray-600">{selectedComplaint.title}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Description</h3>
                <p className="text-gray-600">{selectedComplaint.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Status</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Priority</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedComplaint.priority)}`}>
                    {selectedComplaint.priority}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Address</h3>
                <p className="text-gray-600">{selectedComplaint.address}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Submitted</h3>
                <p className="text-gray-600">{formatDate(selectedComplaint.createdAt)}</p>
              </div>
              
              {selectedComplaint.photo && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Photo</h3>
                  <img 
                    src={selectedComplaint.photo} 
                    alt="Complaint" 
                    className="max-w-full h-auto rounded-lg border"
                    onError={(e) => {
                      // Replace broken image with placeholder
                      e.target.src = `data:image/svg+xml;base64,${btoa(`
                        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                          <rect width="100%" height="100%" fill="#f3f4f6"/>
                          <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">
                            📷 Photo Not Found
                          </text>
                          <text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="12" fill="#9ca3af">
                            Original image was removed during cleanup
                          </text>
                          <text x="50%" y="70%" text-anchor="middle" font-family="Arial" font-size="12" fill="#9ca3af">
                            ${selectedComplaint.title.substring(0, 30)}...
                          </text>
                        </svg>
                      `)}`;
                      e.target.className = "max-w-full h-auto rounded-lg border border-amber-200 bg-amber-50";
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ComplaintManagement;