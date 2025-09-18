import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi } from '../../services/api';

const AdminDashboard = () => {
  const { admin } = useAdminAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDashboardAnalytics();
      
      if (response.data.success) {
        setAnalytics(response.data.data);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (error) {
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
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

  const getRoleTitle = (role) => {
    switch (role) {
      case 'StateAdmin': return 'State Administrator';
      case 'DistrictAdmin': return 'District Administrator';
      case 'BlockAdmin': return 'Block Administrator';
      case 'VillageAdmin': return 'Village Administrator';
      default: return 'Administrator';
    }
  };

  const getLocationString = (location, role) => {
    switch (role) {
      case 'StateAdmin':
        return location.state;
      case 'DistrictAdmin':
        return `${location.district}, ${location.state}`;
      case 'BlockAdmin':
        return `${location.block}, ${location.district}, ${location.state}`;
      case 'VillageAdmin':
        return `${location.village}, ${location.block}, ${location.district}, ${location.state}`;
      default:
        return 'Unknown Location';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 lg:mb-6 p-3 lg:p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
        >
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-lg lg:text-xl">⚠️</span>
            <span className="flex-1 text-sm lg:text-base">{error}</span>
            <button 
              onClick={fetchDashboardData}
              className="text-xs lg:text-sm bg-red-200 hover:bg-red-300 px-2 lg:px-3 py-1 rounded whitespace-nowrap"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}

      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-4 lg:mb-6"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 lg:p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="text-2xl lg:text-4xl">{getRoleEmoji(admin?.role)}</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-3xl font-bold truncate">Welcome, {admin?.name}!</h1>
              <p className="text-blue-100 mt-1 text-xs sm:text-sm lg:text-base">
                {getRoleTitle(admin?.role)}
              </p>
              <p className="text-blue-200 text-xs sm:text-sm lg:text-base truncate">
                {getLocationString(admin?.location, admin?.role)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 lg:mb-6"
      >
        {/* Total Complaints */}
        <div className="bg-white rounded-lg shadow-md p-3 lg:p-4 border-l-4 border-blue-500">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="text-base lg:text-xl text-blue-500">📊</div>
              {loading && <div className="w-8 h-4 bg-gray-200 animate-pulse rounded"></div>}
            </div>
            <div>
              <p className="text-gray-600 text-xs lg:text-sm mb-1">Total</p>
              {!loading && (
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {analytics?.overview?.total || 0}
                </p>
              )}
              {analytics?.overview?.trends?.month !== undefined && (
                <p className={`text-xs ${analytics.overview.trends.month >= 0 ? 'text-green-500' : 'text-red-500'} hidden sm:block`}>
                  {analytics.overview.trends.month >= 0 ? '↗️' : '↘️'} {Math.abs(analytics.overview.trends.month).toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-lg shadow-md p-3 lg:p-4 border-l-4 border-green-500">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="text-base lg:text-xl text-green-500">✅</div>
              {loading && <div className="w-8 h-4 bg-gray-200 animate-pulse rounded"></div>}
            </div>
            <div>
              <p className="text-gray-600 text-xs lg:text-sm mb-1">Resolved</p>
              {!loading && (
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {analytics?.distributions?.status?.find(s => s.status === 'Resolved')?.count || 0}
                </p>
              )}
              {analytics?.performance?.resolutionStats?.totalResolved && (
                <p className="text-xs text-gray-500 hidden lg:block">
                  Avg: {analytics.performance.resolutionStats.avgResolutionTime?.toFixed(1) || 0}h
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-lg shadow-md p-3 lg:p-4 border-l-4 border-yellow-500">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="text-base lg:text-xl text-yellow-500">⏳</div>
              {loading && <div className="w-8 h-4 bg-gray-200 animate-pulse rounded"></div>}
            </div>
            <div>
              <p className="text-gray-600 text-xs lg:text-sm mb-1">Pending</p>
              {!loading && (
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {analytics?.distributions?.status?.find(s => s.status === 'Pending')?.count || 0}
                </p>
              )}
              <p className="text-xs text-gray-500 hidden lg:block">
                Today: {analytics?.overview?.today || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Critical Priority */}
        <div className="bg-white rounded-lg shadow-md p-3 lg:p-4 border-l-4 border-red-500">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="text-base lg:text-xl text-red-500">🔥</div>
              {loading && <div className="w-8 h-4 bg-gray-200 animate-pulse rounded"></div>}
            </div>
            <div>
              <p className="text-gray-600 text-xs lg:text-sm mb-1">Critical</p>
              {!loading && (
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {analytics?.distributions?.priority?.find(p => p.priority === 'Critical')?.count || 0}
                </p>
              )}
              <p className="text-xs text-gray-500 hidden lg:block">
                High: {analytics?.distributions?.priority?.find(p => p.priority === 'High')?.count || 0}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions & Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
      >
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Quick Actions</h3>
          <div className="space-y-2 lg:space-y-3">
            <Link
              to="/admin/complaints"
              className="flex items-center p-2 lg:p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <span className="text-lg lg:text-xl mr-2 lg:mr-3">📋</span>
              <span className="text-blue-700 font-medium text-sm lg:text-base">Manage Complaints</span>
            </Link>
            <Link
              to="/admin/analytics"
              className="flex items-center p-2 lg:p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <span className="text-lg lg:text-xl mr-2 lg:mr-3">📈</span>
              <span className="text-green-700 font-medium text-sm lg:text-base">View Analytics</span>
            </Link>
            {admin?.role !== 'VillageAdmin' && (
              <Link
                to="/admin/admins"
                className="flex items-center p-2 lg:p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <span className="text-lg lg:text-xl mr-2 lg:mr-3">👥</span>
                <span className="text-purple-700 font-medium text-sm lg:text-base">Manage Admins</span>
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Recent Activity</h3>
          <div className="space-y-2 lg:space-y-3">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center p-2 lg:p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-200 rounded-full mr-2 lg:mr-3"></div>
                    <div className="flex-1">
                      <div className="w-3/4 h-3 lg:h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="w-1/2 h-2 lg:h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : analytics?.recentActivity?.length > 0 ? (
              analytics.recentActivity.slice(0, 3).map((activity, index) => (
                <div key={activity.id || index} className="flex items-center p-2 lg:p-3 bg-gray-50 rounded-lg">
                  <span className="text-base lg:text-lg mr-2 lg:mr-3">
                    {activity.action === 'LOGIN' ? '🔑' : 
                     activity.action === 'COMPLAINT_UPDATE' ? '📝' :
                     activity.action === 'ADMIN_CREATE' ? '👤' : '📋'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs lg:text-sm font-medium text-gray-900 truncate">
                      {activity.admin?.name || 'Unknown'} {activity.action.toLowerCase().replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center p-2 lg:p-3 bg-gray-50 rounded-lg">
                <span className="text-xs lg:text-sm text-gray-600">No recent activities found</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;