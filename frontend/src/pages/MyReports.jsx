import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMyReports } from '../services/api';
import EscalationTimer from '../components/EscalationTimer';
import AdminLevelDisplay from '../components/AdminLevelDisplay';

const MyReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await getMyReports(token);
        setReports(data);
      } catch (err) {
        // Failed to fetch reports
      }
    };
    fetchReports();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-xl border border-green-100">
          <button
            onClick={() => navigate('/dashboard')}
            className="group flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
          >
            <span className="mr-2 text-lg group-hover:animate-pulse">⬅️</span>
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            📋 My Reports
          </h1>
          <div className="w-40"></div> {/* Spacer for centering */}
        </div>

        {/* Reports Grid */}
        <div className="mb-6">
          {reports.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white rounded-2xl shadow-xl border border-green-100"
            >
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Reports Found</h3>
              <p className="text-gray-600 mb-6">You haven't submitted any reports yet.</p>
              <button
                onClick={() => navigate('/dashboard/reports')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🚀 Create Your First Report
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report, index) => (
                <motion.div
                  key={report._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, boxShadow: '0 15px 35px rgba(0,0,0,0.1)' }}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 hover:border-green-200 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 leading-tight">{report.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 leading-relaxed">{report.description}</p>

                  <div className="space-y-3">
                    {report.photo ? (
                      <div>
                        <img
                          src={report.photo}
                          alt="Report"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            // Replace broken image with placeholder
                            e.target.src = `data:image/svg+xml;base64,${btoa(`
                              <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                                <rect width="100%" height="100%" fill="#f3f4f6"/>
                                <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">
                                  📷 Photo Not Found
                                </text>
                                <text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="12" fill="#9ca3af">
                                  Original image was removed
                                </text>
                                <text x="50%" y="70%" text-anchor="middle" font-family="Arial" font-size="12" fill="#9ca3af">
                                  ${report.title.substring(0, 25)}...
                                </text>
                              </svg>
                            `)}`;
                            e.target.className = "w-full h-32 object-cover rounded-lg border border-amber-200 bg-amber-50";
                          }}
                        />
                        <p className="text-xs text-gray-400 mt-1">📎 Photo attached</p>
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">📷 No photo available</span>
                      </div>
                    )}

                    {report.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2">📍</span>
                        <span>{report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}</span>
                      </div>
                    )}

                    {report.address && (
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2">🏠</span>
                        <span>{report.address}</span>
                      </div>
                    )}

                    {/* Administrative Location Details */}
                    {report.administrativeLocation && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="text-sm font-medium text-blue-800 mb-2">📍 Administrative Details</div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                          {report.administrativeLocation.state && (
                            <div><span className="font-medium">State:</span> {report.administrativeLocation.state}</div>
                          )}
                          {report.administrativeLocation.district && (
                            <div><span className="font-medium">District:</span> {report.administrativeLocation.district}</div>
                          )}
                          {report.administrativeLocation.block && (
                            <div><span className="font-medium">Block:</span> {report.administrativeLocation.block}</div>
                          )}
                          {report.administrativeLocation.village && (
                            <div><span className="font-medium">Village:</span> {report.administrativeLocation.village}</div>
                          )}
                          {report.administrativeLocation.landmark && (
                            <div><span className="font-medium">Landmark:</span> {report.administrativeLocation.landmark}</div>
                          )}
                          {report.administrativeLocation.pincode && (
                            <div><span className="font-medium">PIN:</span> {report.administrativeLocation.pincode}</div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-400 border-t pt-3">
                      <span className="mr-2">📅</span>
                      <span>{new Date(report.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>

                    {/* Admin Level Display */}
                    <div className="border-t pt-3">
                      <AdminLevelDisplay 
                        assignedLevel={report.assignedLevel || 'village'}
                        escalationHistory={report.escalationHistory}
                      />
                    </div>

                    {/* Escalation Timer */}
                    <div className="border-t pt-3">
                      <EscalationTimer 
                        createdAt={report.createdAt}
                        assignedLevel={report.assignedLevel || 'village'}
                        status={report.status}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReports;