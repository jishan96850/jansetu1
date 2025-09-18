import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getPublicStats } from '../services/api';
import icon from '../assets/icon.png';
import 'leaflet/dist/leaflet.css';

const fadeUp = {
  hidden: { opacity: 0, y: 60 }, 
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: custom * 0.2,
      ease: "easeOut"
    }
  })
};

const getFeatures = (language) => [
  {
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    title: language === 'english' ? "Real-time Tracking" : "रियल-टाइम ट्रैकिंग",
    desc: language === 'english' ? "Track your reported issues and get updates instantly." : "अपनी रिपोर्ट की गई समस्याओं को ट्रैक करें और तुरंत अपडेट प्राप्त करें।"
  },
  {
    icon: (
      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 12l2 2l4-4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    title: language === 'english' ? "Easy Reporting" : "आसान रिपोर्टिंग",
    desc: language === 'english' ? "Report civic issues with location and image in seconds." : "स्थान और छवि के साथ नागरिक समस्याओं की रिपोर्ट सेकंडों में करें।"
  },
  {
    icon: (
      <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" />
      </svg>
    ),
    title: language === 'english' ? "Admin Dashboard" : "प्रशासक डैशबोर्ड",
    desc: language === 'english' ? "Authorities resolve issues efficiently and transparently." : "अधिकारी समस्याओं को कुशलता और पारदर्शिता से हल करते हैं।"
  },
  {
    icon: (
      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: language === 'english' ? "Community Driven" : "समुदायिक संचालित",
    desc: language === 'english' ? "Join a community of active citizens working together." : "एक साथ काम करने वाले सक्रिय नागरिकों के समुदाय में शामिल हों।"
  },
  {
    icon: (
      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: language === 'english' ? "Secure & Private" : "सुरक्षित और निजी",
    desc: language === 'english' ? "Your data is protected with enterprise-grade security." : "आपका डेटा एंटरप्राइज़-ग्रेड सुरक्षा के साथ सुरक्षित है।"
  },
  {
    icon: (
      <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: language === 'english' ? "Analytics Dashboard" : "एनालिटिक्स डैशबोर्ड",
    desc: language === 'english' ? "View comprehensive reports and analytics about civic issues." : "नागरिक मुद्दों के बारे में व्यापक रिपोर्ट और विश्लेषण देखें।"
  }
];

const getCategories = (language) => {
  const content = {
    english: [
      { icon: "fas fa-road", title: "Road Issues", desc: "Potholes, damaged roads, traffic signals" },
      { icon: "fas fa-trash", title: "Waste Management", desc: "Garbage collection, littering, dumping" },
      { icon: "fas fa-lightbulb", title: "Street Lighting", desc: "Broken lights, dark areas, electrical issues" },
      { icon: "fas fa-tint", title: "Water Supply", desc: "Leakages, quality issues, shortage" },
      { icon: "fas fa-tree", title: "Environment", desc: "Pollution, tree cutting, noise issues" },
      { icon: "fas fa-exclamation-triangle", title: "Public Safety", desc: "Dangerous areas, security concerns" }
    ],
    hindi: [
      { icon: "fas fa-road", title: "सड़क की समस्याएं", desc: "गड्ढे, खराब सड़कें, ट्रैफिक सिग्नल" },
      { icon: "fas fa-trash", title: "कचरा प्रबंधन", desc: "कूड़ा संग्रह, कूड़ा फैलाना, डंपिंग" },
      { icon: "fas fa-lightbulb", title: "स्ट्रीट लाइटिंग", desc: "टूटी हुई लाइटें, अंधेरे क्षेत्र, बिजली की समस्याएं" },
      { icon: "fas fa-tint", title: "पानी की आपूर्ति", desc: "रिसाव, गुणवत्ता की समस्याएं, कमी" },
      { icon: "fas fa-tree", title: "पर्यावरण", desc: "प्रदूषण, पेड़ काटना, शोर की समस्याएं" },
      { icon: "fas fa-exclamation-triangle", title: "सार्वजनिक सुरक्षा", desc: "खतरनाक क्षेत्र, सुरक्षा चिंताएं" }
    ]
  };
  return content[language] || content.english;
};

const getTestimonials = (language) => {
  const content = {
    english: [
      { text: "Reported a pothole on my street and it was fixed within a week. Amazing service!", author: "Priya Sharma", location: "Delhi" },
      { text: "The platform is so easy to use. Finally, our voices are being heard by the authorities.", author: "Rajesh Kumar", location: "Mumbai" },
      { text: "Great initiative! Helped resolve water logging issue in our area during monsoon.", author: "Anita Patel", location: "Ahmedabad" }
    ],
    hindi: [
      { text: "मैंने अपनी सड़क पर एक गड्ढे की रिपोर्ट की और एक सप्ताह के भीतर यह ठीक हो गया। अद्भुत सेवा!", author: "प्रिया शर्मा", location: "दिल्ली" },
      { text: "प्लेटफॉर्म का उपयोग करना बहुत आसान है। आखिरकार, हमारी आवाज़ अधिकारियों तक पहुंच रही है।", author: "राजेश कुमार", location: "मुंबई" },
      { text: "महान पहल! मानसून के दौरान हमारे क्षेत्र में जल जमाव की समस्या को हल करने में मदद मिली।", author: "अनीता पटेल", location: "अहमदाबाद" }
    ]
  };
  return content[language] || content.english;
};

const getAboutContent = (language) => {
  const content = {
    english: {
      title: "About JANSETU",
      description1: "JANSETU is a digital platform that bridges the gap between citizens and local authorities. We believe that every citizen has the right to live in a clean, safe, and well-maintained environment.",
      description2: "Our mission is to empower communities by providing them with a simple yet effective tool to report civic issues and track their resolution. Together, we can build smarter, more responsive cities.",
      features: ["24/7 Issue Reporting", "Direct Authority Connection", "Transparent Progress Tracking"]
    },
    hindi: {
      title: "जनसेतु के बारे में",
      description1: "जनसेतु एक डिजिटल प्लेटफॉर्म है जो नागरिकों और स्थानीय अधिकारियों के बीच की दूरी को पाटता है। हमारा मानना है कि हर नागरिक को एक स्वच्छ, सुरक्षित और अच्छी तरह से बने रखे गए वातावरण में रहने का अधिकार है।",
      description2: "हमारा मिशन समुदायों को नागरिक मुद्दों की रिपोर्ट करने और उनके समाधान को ट्रैक करने के लिए एक सरल लेकिन प्रभावी उपकरण प्रदान करके सशक्त बनाना है। मिलकर, हम अधिक स्मार्ट और अधिक उत्तरदायी शहर बना सकते हैं।",
      features: ["24/7 समस्या रिपोर्टिंग", "प्रत्यक्ष प्राधिकरण कनेक्शन", "पारदर्शी प्रगति ट्रैकिंग"]
    }
  };
  return content[language] || content.english;
};

const getCTAContent = (language) => {
  const content = {
    english: {
      title: "Ready to Make a Difference?",
      subtitle: "Join thousands of citizens who are actively improving their communities",
      button: "Start Reporting Issues"
    },
    hindi: {
      title: "बदलाव लाने के लिए तैयार हैं?",
      subtitle: "हजारों नागरिकों के साथ जुड़ें जो सक्रिय रूप से अपने समुदायों में सुधार कर रहे हैं",
      button: "समस्याओं की रिपोर्ट करना शुरू करें"
    }
  };
  return content[language] || content.english;
};

const getHowItWorksContent = (language) => {
  const content = {
    english: {
      title: "How It Works",
      steps: [
        {
          title: "Report the Issue",
          description: "Take a photo, describe the problem, and provide location details."
        },
        {
          title: "Verification", 
          description: "Our system verifies the report and forwards it to relevant authorities."
        },
        {
          title: "Action Taken",
          description: "Local authorities review and take appropriate action on the reported issue."
        },
        {
          title: "Resolution",
          description: "You receive updates until the issue is completely resolved."
        }
      ]
    },
    hindi: {
      title: "कैसे काम करता है",
      steps: [
        {
          title: "समस्या की रिपोर्ट करें",
          description: "एक फोटो लें, समस्या का वर्णन करें, और स्थान का विवरण प्रदान करें।"
        },
        {
          title: "सत्यापन",
          description: "हमारा सिस्टम रिपोर्ट को सत्यापित करता है और संबंधित अधिकारियों को भेजता है।"
        },
        {
          title: "कार्रवाई की गई",
          description: "स्थानीय अधिकारी रिपोर्ट की गई समस्या की समीक्षा करते हैं और उचित कार्रवाई करते हैं।"
        },
        {
          title: "समाधान",
          description: "जब तक समस्या पूरी तरह से हल नहीं हो जाती, आपको अपडेट मिलते रहते हैं।"
        }
      ]
    }
  };
  return content[language] || content.english;
};

const getFooterContent = (language) => {
  const content = {
    english: {
      tagline: "Making cities better, one report at a time.",
      quickLinks: {
        title: "Quick Links",
        items: ["Home", "Report Issue", "About", "Contact"]
      },
      categories: {
        title: "Categories",
        items: ["Road Issues", "Waste Management", "Water Supply", "Public Safety"]
      },
      contact: {
        title: "Contact Info"
      },
      copyright: "© 2025 JANSETU. All rights reserved."
    },
    hindi: {
      tagline: "शहरों को बेहतर बनाना, एक रिपोर्ट के साथ।",
      quickLinks: {
        title: "त्वरित लिंक",
        items: ["होम", "समस्या रिपोर्ट करें", "हमारे बारे में", "संपर्क"]
      },
      categories: {
        title: "श्रेणियां",
        items: ["सड़क की समस्याएं", "कचरा प्रबंधन", "पानी की आपूर्ति", "सार्वजनिक सुरक्षा"]
      },
      contact: {
        title: "संपर्क जानकारी"
      },
      copyright: "© 2025 जनसेतु। सभी अधिकार सुरक्षित।"
    }
  };
  return content[language] || content.english;
};

const Home = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('english'); // 'english' or 'hindi'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalReported: 19, // Start with current known value
    totalResolved: 1,
    resolutionRate: 5
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch live statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await getPublicStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        // Keep current stats values if API fails
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
    
    // Auto-refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language');
    
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'english' ? 'hindi' : 'english');
    localStorage.setItem('language', language === 'english' ? 'hindi' : 'english');
  };

  useEffect(() => {
    const handleSmoothScroll = (e) => {
      e.preventDefault();
      const targetId = e.target.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const offsetTop = targetElement.offsetTop - 80; // Adjust for navbar height
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth',
          duration: 1000 // Slower scroll duration in ms
        });
      }
    };

    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => link.addEventListener('click', handleSmoothScroll));

    return () => {
      links.forEach(link => link.removeEventListener('click', handleSmoothScroll));
    };
  }, []);

  return (
    <div className={`min-h-screen w-full ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Navigation */}
      <nav className={`fixed top-0 w-full shadow-lg z-50 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="w-full px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src={icon} 
                  alt="JANSETU Logo" 
                  className="w-10 h-10 lg:w-12 lg:h-12 drop-shadow-lg" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'block';
                  }}
                />
                <div 
                  className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center"
                  style={{display: 'none'}}
                >
                  <i className="fas fa-handshake text-white text-lg lg:text-xl"></i>
                </div>
              </div>
              <span className={`text-xl lg:text-3xl font-bold tracking-wide ${darkMode ? 'text-white' : ' bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent'}`}>JANSETU</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              <ul className="flex items-center space-x-8">
                <li><a href="#home" className={`hover:text-blue-600 transition-colors font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {language === 'english' ? 'Home' : 'होम'}
                </a></li>
                <li><a href="#features" className={`hover:text-blue-600 transition-colors font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {language === 'english' ? 'Features' : 'विशेषताएं'}
                </a></li>
                <li><a href="#how-it-works" className={`hover:text-blue-600 transition-colors font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {language === 'english' ? 'How It Works' : 'कैसे काम करता है'}
                </a></li>
                <li><a href="#about" className={`hover:text-blue-600 transition-colors font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {language === 'english' ? 'About' : 'हमारे बारे में'}
                </a></li>
              </ul>
              
              {/* Language Toggle Button */}
              <button
                onClick={toggleLanguage}
                className={`p-2 rounded-lg transition-colors flex items-center space-x-1 ${darkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-blue-50'}`}
                title={language === 'english' ? 'Switch to Hindi' : 'Switch to English'}
              >
                <span className="text-sm font-semibold">
                  {language === 'english' ? 'हिं' : 'EN'}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </button>

              {/* Dark Mode Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {darkMode ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Admin Button - Desktop */}
              <a href="/admin/login" className="bg-blue-600/70 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 hover:bg-opacity-100 font-medium opacity-70 hover:opacity-100">
                {language === 'english' ? 'Admin' : 'प्रशासक'}
              </a>
            </div>

            {/* Mobile Menu Controls */}
            <div className="lg:hidden flex items-center space-x-2">
              {/* Language Toggle - Mobile */}
              <button
                onClick={toggleLanguage}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                <span className="text-sm font-semibold">
                  {language === 'english' ? 'हिं' : 'EN'}
                </span>
              </button>

              {/* Dark Mode Toggle - Mobile */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Hamburger Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <motion.div
                  animate={mobileMenuOpen ? "open" : "closed"}
                  className="w-6 h-6 flex flex-col justify-center items-center space-y-1"
                >
                  <motion.span
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: 45, y: 6 }
                    }}
                    className={`w-6 h-0.5 transition-all ${darkMode ? 'bg-white' : 'bg-gray-700'}`}
                  />
                  <motion.span
                    variants={{
                      closed: { opacity: 1 },
                      open: { opacity: 0 }
                    }}
                    className={`w-6 h-0.5 transition-all ${darkMode ? 'bg-white' : 'bg-gray-700'}`}
                  />
                  <motion.span
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: -45, y: -6 }
                    }}
                    className={`w-6 h-0.5 transition-all ${darkMode ? 'bg-white' : 'bg-gray-700'}`}
                  />
                </motion.div>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: mobileMenuOpen ? 'auto' : 0, 
              opacity: mobileMenuOpen ? 1 : 0 
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`lg:hidden overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation Links */}
              <div className="space-y-4">
                <a 
                  href="#home" 
                  className={`block py-2 text-lg font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {language === 'english' ? 'Home' : 'होम'}
                </a>
                <a 
                  href="#features" 
                  className={`block py-2 text-lg font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {language === 'english' ? 'Features' : 'विशेषताएं'}
                </a>
                <a 
                  href="#how-it-works" 
                  className={`block py-2 text-lg font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {language === 'english' ? 'How It Works' : 'कैसे काम करता है'}
                </a>
                <a 
                  href="#about" 
                  className={`block py-2 text-lg font-medium transition-colors ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {language === 'english' ? 'About' : 'हमारे बारे में'}
                </a>
              </div>

              {/* Mobile Admin Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <a 
                  href="/admin/login" 
                  className="block w-full text-center bg-blue-600/70 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium opacity-70 hover:opacity-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {language === 'english' ? 'Admin Portal' : 'प्रशासक पोर्टल'}
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </nav>      {/* Hero Section */}
      <section id="home" className={`pt-20 pb-16 text-white w-full ${darkMode ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black' : 'bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800'}`}>
        <div className="w-full px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-white">
              {language === 'english' ? 'Make Your City Better' : 'अपने शहर को बेहतर बनाएं'}
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90">
              {language === 'english' 
                ? 'Report civic issues quickly and efficiently. Help build a better community for everyone.'
                : 'नागरिक समस्याओं की त्वरित और कुशलता से रिपोर्ट करें। सभी के लिए एक बेहतर समुदाय बनाने में मदद करें।'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a href="#" className={`px-8 py-4 rounded-lg transition-all duration-300 transform hover:-translate-y-1 font-semibold text-lg shadow-lg ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-blue-600 hover:bg-gray-100'}`}>
                {language === 'english' ? 'Report an Issue' : 'समस्या की रिपोर्ट करें'}
              </a>
              <a href="/login" className={`px-8 py-4 rounded-lg transition-all duration-300 font-semibold text-lg ${darkMode ? 'border-2 border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-2 border-white text-white hover:bg-white hover:text-blue-600'}`}>
                {language === 'english' ? 'Login' : 'लॉगिन'}
              </a>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
              <h3 className="text-4xl md:text-5xl font-bold mb-2">
                {statsLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  stats.totalReported.toLocaleString()
                )}
              </h3>
              <p className="text-lg opacity-90">
                {language === 'english' ? 'Issues Reported' : 'रिपोर्ट की गई समस्याएं'}
              </p>
            </motion.div>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
              <h3 className="text-4xl md:text-5xl font-bold mb-2">
                {statsLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  stats.totalResolved.toLocaleString()
                )}
              </h3>
              <p className="text-lg opacity-90">
                {language === 'english' ? 'Issues Resolved' : 'हल की गई समस्याएं'}
              </p>
            </motion.div>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
              <h3 className="text-4xl md:text-5xl font-bold mb-2">
                {statsLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  `${stats.resolutionRate}%`
                )}
              </h3>
              <p className="text-lg opacity-90">
                {language === 'english' ? 'Resolution Rate' : 'समाधान दर'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-20 w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="w-full px-6">
          <motion.h2 initial="hidden" whileInView="visible" variants={fadeUp} className={`text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {language === 'english' ? 'Platform Features' : 'प्लेटफॉर्म फीचर्स'}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getFeatures(language).map((feature, index) => (
              <motion.div key={index} initial="hidden" whileInView="visible" variants={fadeUp} custom={index + 1} className={`p-8 rounded-xl text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={`py-20 w-full ${darkMode ? 'bg-gray-900' : ''}`}>
        <div className="w-full px-6">
          <motion.h2 initial="hidden" whileInView="visible" variants={fadeUp} className={`text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {getHowItWorksContent(language).title}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {getHowItWorksContent(language).steps.map((step, index) => (
              <motion.div key={index + 1} initial="hidden" whileInView="visible" variants={fadeUp} custom={index + 1} className="flex flex-col md:flex-row items-center text-center md:text-left">
                <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4 md:mb-0 md:mr-6 flex-shrink-0">{index + 1}</div>
                <div>
                  <h3 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {step.title}
                  </h3>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Issue Categories */}
      <section className={`py-20 w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="w-full px-6">
          <motion.h2 initial="hidden" whileInView="visible" variants={fadeUp} className={`text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {language === 'english' ? 'Report Different Types of Issues' : 'विभिन्न प्रकार की समस्याओं की रिपोर्ट करें'}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getCategories(language).map((category, index) => (
              <motion.div key={index} initial="hidden" whileInView="visible" variants={fadeUp} custom={index + 1} className={`p-8 rounded-xl text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>
                <i className={`${category.icon} text-5xl text-red-600 mb-6`}></i>
                <h3 className="text-xl font-semibold mb-3">
                  {(category.title === "Road Issues" || category.title === "सड़क की समस्याएं") && <span className="text-2xl mr-2">🛣️</span>}
                  {(category.title === "Waste Management" || category.title === "कचरा प्रबंधन") && <span className="text-2xl mr-2">🗑️</span>}
                  {(category.title === "Street Lighting" || category.title === "स्ट्रीट लाइटिंग") && <span className="text-2xl mr-2">💡</span>}
                  {(category.title === "Water Supply" || category.title === "पानी की आपूर्ति") && <span className="text-2xl mr-2">💧</span>}
                  {(category.title === "Environment" || category.title === "पर्यावरण") && <span className="text-2xl mr-2">🌳</span>}
                  {(category.title === "Public Safety" || category.title === "सार्वजनिक सुरक्षा") && <span className="text-2xl mr-2">⚠️</span>}
                  {category.title}
                </h3>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{category.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`py-20 w-full ${darkMode ? 'bg-gray-900' : ''}`}>
        <div className="w-full px-6">
          <motion.h2 initial="hidden" whileInView="visible" variants={fadeUp} className={`text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {language === 'english' ? 'What Citizens Say' : 'नागरिक क्या कहते हैं'}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {getTestimonials(language).map((testimonial, index) => (
              <motion.div key={index} initial="hidden" whileInView="visible" variants={fadeUp} custom={index + 1} className={`p-8 rounded-xl border-l-4 border-blue-600 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-700'}`}>
                <p className="text-lg italic mb-6">"{testimonial.text}"</p>
                <div>
                  <strong className={darkMode ? 'text-white' : 'text-gray-800'}>{testimonial.author}</strong>
                  <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{testimonial.location}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={`py-20 w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="w-full px-6 pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.h2 initial="hidden" whileInView="visible" variants={fadeUp} className={`text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-blue-700 bg-clip-text text-transparent ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {getAboutContent(language).title}
              </motion.h2>
              <motion.p initial="hidden" whileInView="visible" variants={fadeUp} custom={1} className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {getAboutContent(language).description1}
              </motion.p>
              <motion.p initial="hidden" whileInView="visible" variants={fadeUp} custom={2} className={`text-lg mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {getAboutContent(language).description2}
              </motion.p>
              <div className="space-y-4">
                {getAboutContent(language).features.map((item, index) => (
                  <motion.div key={index} initial="hidden" whileInView="visible" variants={fadeUp} custom={index + 3} className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-3"></i>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="about-map h-80 md:h-96 w-full rounded-lg overflow-hidden shadow-lg z-0">
              <MapContainer center={[22.9734, 78.6569]} zoom={6} style={{ height: '500px', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[22.9734, 78.6569]}>
                  <Popup>Madhya Pradesh</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </section>      {/* CTA Section */}
      <section className={`py-20 text-white text-center w-full ${darkMode ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black' : 'bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800'}`}>
        <div className="w-full px-6">
          <motion.h2 initial="hidden" whileInView="visible" variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-6 text-white">
            {getCTAContent(language).title}
          </motion.h2>
          <motion.p initial="hidden" whileInView="visible" variants={fadeUp} custom={1} className="text-xl mb-10 opacity-90">
            {getCTAContent(language).subtitle}
          </motion.p>
          <motion.a initial="hidden" whileInView="visible" variants={fadeUp} custom={2} href="#" className={`px-10 py-4 rounded-lg transition-all duration-300 transform hover:-translate-y-1 font-semibold text-lg shadow-lg inline-block ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-blue-600 hover:bg-gray-100'}`}>
            {getCTAContent(language).button}
          </motion.a>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-16 w-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-800 text-white'}`}>
        <div className="w-full px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">JANSETU</h3>
              <p className="mb-6 text-gray-300">{getFooterContent(language).tagline}</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-blue-600 transition-colors text-xl">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-blue-600 transition-colors text-xl">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-blue-600 transition-colors text-xl">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">{getFooterContent(language).quickLinks.title}</h4>
              <ul className="space-y-2">
                {getFooterContent(language).quickLinks.items.map((item, index) => (
                  <li key={index}>
                    <a href={index === 0 ? "#home" : index === 1 ? "#" : index === 2 ? "#about" : "#contact"} 
                       className="text-gray-300 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">{getFooterContent(language).categories.title}</h4>
              <ul className="space-y-2">
                {getFooterContent(language).categories.items.map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">{getFooterContent(language).contact.title}</h4>
              <p className="text-gray-300 mb-2">
                <i className="fas fa-envelope mr-2"></i> support@jansetu.com
              </p>
              <p className="text-gray-300">
                <i className="fas fa-phone mr-2"></i> +91 98765 43210
              </p>
            </div>
          </div>
          <div className="border-t border-gray-600 pt-8 text-center">
            <p className="text-gray-300">{getFooterContent(language).copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;