import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi } from '../../services/api';

const Analytics = () => {
  const { admin } = useAdminAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDashboardAnalytics();
      
      if (response.data.success) {
        setAnalytics(response.data.data);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (error) {
      setError('Error loading analytics data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '↗️' : '↘️'} {Math.abs(change).toFixed(1)}% from last period
            </p>
          )}
        </div>
        <div className={`text-3xl p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  const ChartCard = ({ title, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights and reports</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
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
              onClick={fetchAnalytics}
              className="ml-auto text-sm bg-red-200 hover:bg-red-300 px-3 py-1 rounded"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Complaints"
          value={analytics?.overview?.total || 0}
          change={analytics?.overview?.trends?.month}
          icon="📊"
          color="bg-blue-100 text-blue-600"
        />
        
        <StatCard
          title="Resolved Today"
          value={analytics?.distributions?.status?.find(s => s.status === 'Resolved')?.count || 0}
          icon="✅"
          color="bg-green-100 text-green-600"
        />
        
        <StatCard
          title="Pending"
          value={analytics?.distributions?.status?.find(s => s.status === 'Pending')?.count || 0}
          icon="⏳"
          color="bg-yellow-100 text-yellow-600"
        />
        
        <StatCard
          title="Critical Priority"
          value={analytics?.distributions?.priority?.find(p => p.priority === 'Critical')?.count || 0}
          icon="🔥"
          color="bg-red-100 text-red-600"
        />
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution */}
        <ChartCard title="Status Distribution">
          <div className="space-y-3">
            {analytics?.distributions?.status?.map((item, index) => {
              const total = analytics.overview.total || 1;
              const percentage = ((item.count / total) * 100).toFixed(1);
              const colors = {
                'Pending': 'bg-yellow-500',
                'In Progress': 'bg-blue-500', 
                'Resolved': 'bg-green-500',
                'Rejected': 'bg-red-500'
              };
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${colors[item.status] || 'bg-gray-500'}`}></div>
                    <span className="text-sm font-medium text-gray-700">{item.status}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{item.count}</div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                  </div>
                </div>
              );
            }) || <p className="text-gray-500 text-center py-4">No data available</p>}
          </div>
        </ChartCard>

        {/* Category Distribution */}
        <ChartCard title="Category Distribution">
          <div className="space-y-3">
            {analytics?.distributions?.category?.map((item, index) => {
              const total = analytics.overview.total || 1;
              const percentage = ((item.count / total) * 100).toFixed(1);
              const colors = [
                'bg-purple-500', 'bg-indigo-500', 'bg-pink-500', 'bg-orange-500',
                'bg-teal-500', 'bg-cyan-500', 'bg-lime-500', 'bg-emerald-500'
              ];
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`}></div>
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{item.count}</div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                  </div>
                </div>
              );
            }) || <p className="text-gray-500 text-center py-4">No data available</p>}
          </div>
        </ChartCard>
      </div>

      {/* Priority Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ChartCard title="Priority Breakdown">
          <div className="space-y-3">
            {analytics?.distributions?.priority?.map((item, index) => {
              const total = analytics.overview.total || 1;
              const percentage = ((item.count / total) * 100).toFixed(1);
              const colors = {
                'Critical': 'bg-red-500',
                'High': 'bg-orange-500',
                'Medium': 'bg-yellow-500',
                'Low': 'bg-green-500'
              };
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${colors[item.priority] || 'bg-gray-500'}`}></div>
                    <span className="text-sm font-medium text-gray-700">{item.priority}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{item.count}</div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                  </div>
                </div>
              );
            }) || <p className="text-gray-500 text-center py-4">No data available</p>}
          </div>
        </ChartCard>

        {/* Performance Metrics */}
        <ChartCard title="Performance Metrics">
          <div className="space-y-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analytics?.performance?.resolutionStats?.avgResolutionTime?.toFixed(1) || 0}h
              </div>
              <div className="text-sm text-gray-600">Avg Resolution Time</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analytics?.performance?.resolutionStats?.totalResolved || 0}
              </div>
              <div className="text-sm text-gray-600">Total Resolved</div>
            </div>
          </div>
        </ChartCard>

        {/* Location Summary */}
        <ChartCard title="Administrative Summary">
          <div className="space-y-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-lg font-semibold text-purple-600">{admin?.location.state}</div>
              <div className="text-sm text-gray-600">State</div>
            </div>
            
            {admin?.location.district && (
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-lg font-semibold text-indigo-600">{admin.location.district}</div>
                <div className="text-sm text-gray-600">District</div>
              </div>
            )}
            
            {admin?.location.block && (
              <div className="text-center p-4 bg-cyan-50 rounded-lg">
                <div className="text-lg font-semibold text-cyan-600">{admin.location.block}</div>
                <div className="text-sm text-gray-600">Block</div>
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Recent Activity */}
      <ChartCard title="Recent Activity Summary">
        <div className="text-center py-8">
          {analytics?.recentActivity?.length > 0 ? (
            <div className="space-y-2">
              {analytics.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">
                    {activity.admin?.name || 'Unknown'} {activity.action.toLowerCase().replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(activity.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-600">No recent activity</p>
            </div>
          )}
        </div>
      </ChartCard>
    </div>
  );
};

export default Analytics;