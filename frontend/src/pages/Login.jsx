import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      alert(message);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      
      // Success animation before redirect
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        delay: 0.2,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { 
      scale: 1.05,
      boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)",
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
  };

  const inputVariants = {
    focused: { 
      scale: 1.02,
      boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)",
      borderColor: "#3B82F6"
    },
    unfocused: { 
      scale: 1,
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      borderColor: "#E5E7EB"
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-gradient-x"></div>
      
      {/* Floating Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-xl"
          animate={{ 
            x: [0, 100, -50, 0],
            y: [0, -50, 100, 0],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-xl"
          animate={{ 
            x: [0, -100, 50, 0],
            y: [0, 50, -100, 0],
            scale: [1, 0.8, 1.3, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/4 w-60 h-60 bg-white/5 rounded-full blur-2xl"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.5, 1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Back to Home Button */}
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center text-white/80 hover:text-white transition-all duration-300 mb-8 group"
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.svg 
              className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </motion.svg>
            Back to Home
          </motion.button>

          {/* Login Form */}
          <motion.div 
            variants={formVariants}
            className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20"
          >
            {/* Header */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.div 
                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <i className="fas fa-user text-white text-2xl"></i>
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Welcome Back
              </h2>
              <p className="text-gray-600 mt-2">Sign in to your account</p>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center"
                >
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <label className="block text-gray-700 font-semibold mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <motion.input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField('')}
                    variants={inputVariants}
                    animate={focusedField === 'email' ? 'focused' : 'unfocused'}
                    className="w-full px-4 py-3 pl-12 border-2 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none transition-all duration-300"
                    placeholder="Enter your email"
                    required
                  />
                  <motion.i 
                    className="fas fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    animate={{ 
                      color: focusedField === 'email' ? '#3B82F6' : '#9CA3AF',
                      scale: focusedField === 'email' ? 1.1 : 1
                    }}
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <label className="block text-gray-700 font-semibold mb-2">
                  Password
                </label>
                <div className="relative">
                  <motion.input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    variants={inputVariants}
                    animate={focusedField === 'password' ? 'focused' : 'unfocused'}
                    className="w-full px-4 py-3 pl-12 pr-12 border-2 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none transition-all duration-300"
                    placeholder="Enter your password"
                    required
                  />
                  <motion.i 
                    className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    animate={{ 
                      color: focusedField === 'password' ? '#3B82F6' : '#9CA3AF',
                      scale: focusedField === 'password' ? 1.1 : 1
                    }}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </motion.button>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                variants={buttonVariants}
                whileHover={!isLoading ? "hover" : "idle"}
                whileTap={!isLoading ? "tap" : "idle"}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      Sign In
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Register Link */}
            <motion.div 
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <p className="text-gray-600">
                Don't have an account?{' '}
                <motion.a
                  href="/register"
                  className="text-blue-600 font-semibold hover:text-purple-600 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Account
                </motion.a>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;