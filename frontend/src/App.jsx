import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login'; 
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import ReportIssue from './pages/ReportIssue';
import MyReports from './pages/MyReports';
import AdminRouter from './admin/AdminRouter';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/dashboard/reports" element={<ReportIssue />} /> 
        <Route path="/dashboard/showreport" element={<MyReports/>} /> 
        <Route path="/admin/*" element={<AdminRouter />} />
      </Routes>
    </Router>
  );
}

export default App;
