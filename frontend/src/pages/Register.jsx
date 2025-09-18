import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Password strength calculation
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // Success animation before redirect
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/login?message=Registration successful! Please login to continue.');
    } catch (err) {
      setErrors({ general: 'Registration failed. Please try again.' });
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

  const inputVariants = {
    focused: { 
      scale: 1.02,
      boxShadow: "0 0 20px rgba(139, 69, 19, 0.2)",
      borderColor: "#8B4513"
    },
    unfocused: { 
      scale: 1,
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      borderColor: "#E5E7EB"
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500';
    if (passwordStrength < 50) return 'bg-orange-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 animate-gradient-x"></div>
      
      {/* Floating Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-xl"
          animate={{ 
            x: [0, 150, -100, 0],
            y: [0, -100, 150, 0],
            scale: [1, 1.3, 0.7, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-xl"
          animate={{ 
            x: [0, -150, 100, 0],
            y: [0, 100, -150, 0],
            scale: [1, 0.7, 1.4, 1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.8, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
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

          {/* Registration Form */}
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
                className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <i className="fas fa-user-plus text-white text-2xl"></i>
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Create Account
              </h2>
              <p className="text-gray-600 mt-2">Join JANSETU community today</p>
            </motion.div>

            {/* General Error */}
            <AnimatePresence>
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center"
                >
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {errors.general}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <label className="block text-gray-700 font-semibold mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <motion.input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField('')}
                    variants={inputVariants}
                    animate={focusedField === 'name' ? 'focused' : 'unfocused'}
                    className={`w-full px-4 py-3 pl-12 border-2 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none transition-all duration-300 ${
                      errors.name ? 'border-red-300' : ''
                    }`}
                    placeholder="Enter your full name"
                    required
                  />
                  <motion.i 
                    className="fas fa-user absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    animate={{ 
                      color: focusedField === 'name' ? '#8B4513' : '#9CA3AF',
                      scale: focusedField === 'name' ? 1.1 : 1
                    }}
                  />
                </div>
                <AnimatePresence>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Email Field */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <label className="block text-gray-700 font-semibold mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <motion.input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField('')}
                    variants={inputVariants}
                    animate={focusedField === 'email' ? 'focused' : 'unfocused'}
                    className={`w-full px-4 py-3 pl-12 border-2 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none transition-all duration-300 ${
                      errors.email ? 'border-red-300' : ''
                    }`}
                    placeholder="Enter your email"
                    required
                  />
                  <motion.i 
                    className="fas fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    animate={{ 
                      color: focusedField === 'email' ? '#8B4513' : '#9CA3AF',
                      scale: focusedField === 'email' ? 1.1 : 1
                    }}
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password Field */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <label className="block text-gray-700 font-semibold mb-2">
                  Password
                </label>
                <div className="relative">
                  <motion.input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    variants={inputVariants}
                    animate={focusedField === 'password' ? 'focused' : 'unfocused'}
                    className={`w-full px-4 py-3 pl-12 pr-12 border-2 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none transition-all duration-300 ${
                      errors.password ? 'border-red-300' : ''
                    }`}
                    placeholder="Create a password"
                    required
                  />
                  <motion.i 
                    className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    animate={{ 
                      color: focusedField === 'password' ? '#8B4513' : '#9CA3AF',
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <motion.div 
                    className="mt-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <motion.div 
                          className={`h-2 rounded-full ${getPasswordStrengthColor()}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                  </motion.div>
                )}
                
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <label className="block text-gray-700 font-semibold mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <motion.input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField('')}
                    variants={inputVariants}
                    animate={focusedField === 'confirmPassword' ? 'focused' : 'unfocused'}
                    className={`w-full px-4 py-3 pl-12 pr-12 border-2 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none transition-all duration-300 ${
                      errors.confirmPassword ? 'border-red-300' : ''
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                  <motion.i 
                    className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    animate={{ 
                      color: focusedField === 'confirmPassword' ? '#8B4513' : '#9CA3AF',
                      scale: focusedField === 'confirmPassword' ? 1.1 : 1
                    }}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </motion.button>
                </div>
                <AnimatePresence>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                whileHover={!isLoading ? { 
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(168, 85, 247, 0.3)"
                } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-700"
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
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus mr-2"></i>
                      Create Account
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Login Link */}
            <motion.div 
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <p className="text-gray-600">
                Already have an account?{' '}
                <motion.a
                  href="/login"
                  className="text-purple-600 font-semibold hover:text-pink-600 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.a>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;