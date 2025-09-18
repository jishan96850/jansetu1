import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: '', name: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser({ 
          email: res.data.email, 
          name: res.data.name || res.data.email.split('@')[0] 
        });
        setIsLoading(false);
      } catch (err) {
        navigate('/');
      }
    };
    fetchUser();

    // Update time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleReportIssue = () => {
    navigate('/dashboard/reports');
  };

  const handleShowReports = () => {
    navigate('/dashboard/showreport');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0, y: 50 },
    visible: { 
      scale: 1, 
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.7,
        ease: "easeOut"
      }
    },
    hover: { 
      scale: 1.03,
      y: -15,
      rotateY: 5,
      boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      x: [-5, 5, -5],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <motion.div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 font-medium"
          >
            Loading your dashboard...
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-4 max-w-xs mx-auto"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-20 -left-20 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-2xl lg:blur-3xl"
          animate={{ 
            x: [0, 50, -25, 0],
            y: [0, -25, 50, 0],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-20 -right-20 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-2xl lg:blur-3xl"
          animate={{ 
            x: [0, -50, 25, 0],
            y: [0, 25, -50, 0],
            scale: [1, 0.8, 1.3, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/4 left-1/4 w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-r from-indigo-200/15 to-blue-200/15 rounded-full blur-xl lg:blur-2xl"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.5, 1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/3 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-r from-pink-200/15 to-purple-200/15 rounded-full blur-xl"
          variants={floatingVariants}
          animate="animate"
        />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 p-6 lg:p-8"
      >
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 lg:mb-12"
        >
          <div className="mb-6 xl:mb-0 w-full xl:w-auto">
            <motion.h1 
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {getGreeting()}, {user.name}! 
              <motion.span
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="inline-block ml-2"
              >
                👋
              </motion.span>
            </motion.h1>
            <motion.p 
              className="text-gray-600 text-base sm:text-lg lg:text-xl mt-2"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Welcome back to your dashboard
            </motion.p>
            <motion.div 
              className="text-xs sm:text-sm text-gray-500 mt-2 lg:mt-3"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.span
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} • {currentTime.toLocaleTimeString()}
              </motion.span>
            </motion.div>
          </div>

          {/* Profile Menu */}
          <motion.div 
            className="relative w-full xl:w-auto"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center justify-between xl:justify-start space-x-3 bg-white/80 backdrop-blur-xl p-3 lg:p-4 rounded-2xl shadow-lg border border-white/20 hover:bg-white/90 transition-all duration-300 w-full xl:w-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <i className="fas fa-user text-white text-sm lg:text-lg"></i>
                </motion.div>
                <div className="text-left">
                  <div className="font-semibold text-gray-800 text-sm lg:text-base truncate max-w-32 sm:max-w-none">{user.name}</div>
                  <div className="text-xs lg:text-sm text-gray-600 truncate max-w-40 sm:max-w-none">{user.email}</div>
                </div>
              </div>
              <motion.i 
                className="fas fa-chevron-down text-gray-400 xl:block"
                animate={{ rotate: showProfileMenu ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute right-0 mt-2 w-full xl:w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-2 z-50"
                >
                  <motion.button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Main Action Cards */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-12"
        >
          {/* Report Issue Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            onClick={handleReportIssue}
            className="bg-white/80 backdrop-blur-xl p-6 lg:p-8 rounded-3xl shadow-xl border border-white/20 cursor-pointer group relative overflow-hidden min-h-[280px] lg:min-h-[320px]"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <motion.div 
                  className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  variants={floatingVariants}
                  animate="animate"
                >
                  <i className="fas fa-plus text-white text-xl lg:text-2xl"></i>
                </motion.div>
                <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-3 lg:mb-4">Report New Issue</h3>
                <p className="text-gray-600 text-sm lg:text-base mb-6 lg:mb-8 leading-relaxed">Create a new report for civic issues in your area. Help make your community better with detailed reporting.</p>
              </div>
              <motion.div 
                className="flex items-center text-blue-600 font-semibold text-sm lg:text-base"
                whileHover={{ x: 8 }}
                transition={{ duration: 0.3 }}
              >
                <span>Get Started</span>
                <motion.i 
                  className="fas fa-arrow-right ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            </div>
            <motion.div
              className="absolute -top-10 -right-10 w-20 h-20 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-200/10 to-purple-200/10 rounded-full blur-xl lg:blur-2xl"
              animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-5 -left-5 w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-200/10 to-blue-200/10 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* My Reports Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            onClick={handleShowReports}
            className="bg-white/80 backdrop-blur-xl p-6 lg:p-8 rounded-3xl shadow-xl border border-white/20 cursor-pointer group relative overflow-hidden min-h-[280px] lg:min-h-[320px]"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <motion.div 
                  className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6"
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  variants={floatingVariants}
                  animate="animate"
                >
                  <i className="fas fa-list text-white text-xl lg:text-2xl"></i>
                </motion.div>
                <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-3 lg:mb-4">My Reports</h3>
                <p className="text-gray-600 text-sm lg:text-base mb-6 lg:mb-8 leading-relaxed">View and track all your submitted reports. Monitor progress and updates from local authorities.</p>
              </div>
              <motion.div 
                className="flex items-center text-green-600 font-semibold text-sm lg:text-base"
                whileHover={{ x: 8 }}
                transition={{ duration: 0.3 }}
              >
                <span>View Reports</span>
                <motion.i 
                  className="fas fa-arrow-right ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                />
              </motion.div>
            </div>
            <motion.div
              className="absolute -bottom-10 -left-10 w-20 h-20 lg:w-32 lg:h-32 bg-gradient-to-br from-green-200/10 to-emerald-200/10 rounded-full blur-xl lg:blur-2xl"
              animate={{ scale: [1, 1.4, 1], rotate: [0, -180, -360] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -top-5 -right-5 w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-emerald-200/10 to-green-200/10 rounded-full blur-xl"
              animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-xl p-4 lg:p-6 rounded-3xl shadow-xl border border-white/20"
        >
          <motion.h3 
            className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 mb-4 lg:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Quick Actions
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 2 }}
              className="inline-block ml-2"
            >
              ⚡
            </motion.span>
          </motion.h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {[
              { icon: 'fas fa-road', label: 'Road Issues', color: 'from-red-500 to-red-600', bgColor: 'bg-red-50', emoji: '🛣️' },
              { icon: 'fas fa-trash', label: 'Waste', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50', emoji: '🗑️' },
              { icon: 'fas fa-lightbulb', label: 'Lighting', color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-50', emoji: '💡' },
              { icon: 'fas fa-tint', label: 'Water', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', emoji: '💧' }
            ].map((action, index) => (
              <motion.button
                key={index}
                className={`p-3 lg:p-4 rounded-2xl ${action.bgColor} hover:bg-white border border-gray-200 transition-all duration-400 group relative overflow-hidden`}
                whileHover={{ 
                  scale: 1.05, 
                  y: -3,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReportIssue}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <div className="relative z-10">
                  <motion.div 
                    className={`w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mx-auto mb-2 lg:mb-3`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <i className={`${action.icon} text-white text-xs lg:text-sm`}></i>
                  </motion.div>
                  <motion.div 
                    className="text-lg mb-1"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  >
                    {action.emoji}
                  </motion.div>
                  <div className="text-xs lg:text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    {action.label}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
          
          {/* Additional Info */}
          <motion.div 
            className="mt-4 lg:mt-6 p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="flex items-center justify-center space-x-2 text-xs lg:text-sm text-gray-600">
              <motion.i 
                className="fas fa-info-circle text-blue-500"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <span>Click any category to start reporting an issue quickly</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserDashboard;