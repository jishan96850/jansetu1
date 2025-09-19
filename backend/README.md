# JANSETU Backend API

## Overview
JANSETU (जनसेतु) backend - A robust Node.js API server for civic issue reporting platform with hierarchical admin management and automated escalation system.

## Features
- 🔐 **JWT Authentication**: Secure user and admin authentication
- 📊 **4-Tier Admin Hierarchy**: State > District > Block > Village level management
- ⚡ **Auto-escalation**: Automatic complaint escalation based on time thresholds
- 📈 **Analytics**: Real-time statistics and reporting
- 🗺️ **Location-based**: Geographic filtering and management
- 📎 **File Uploads**: Image attachment support with Multer
- 🔄 **Activity Logging**: Comprehensive audit trail

## Tech Stack
- **Node.js** + **Express.js**: RESTful API server
- **MongoDB** + **Mongoose**: Database and ODM
- **JWT**: Authentication and authorization
- **Multer**: File upload handling
- **bcryptjs**: Password hashing

## Admin Hierarchy
1. **StateAdmin**: Manages all admins in their state
2. **DistrictAdmin**: Manages block and village admins in their district  
3. **BlockAdmin**: Manages village admins in their block
4. **VillageAdmin**: Handles local complaints

## API Endpoints
- `/api/auth` - User authentication
- `/api/admin` - Admin management and authentication
- `/api/reports` - Issue reporting and management
- `/api/stats` - Analytics and statistics
- `/api/geocode` - Location services

## Folder Structure
```
backend
├── src
│   ├── controllers         # Contains controller logic for handling requests
│   ├── middleware          # Contains middleware for authentication and file uploads
│   ├── models              # Contains MongoDB schemas for User and Report
│   ├── routes              # Contains route definitions for auth, issues, and admin
│   ├── utils               # Contains utility functions, e.g., for JWT
│   └── app.js              # Entry point of the application
├── uploads                 # Directory for storing uploaded images
├── .env.example            # Example environment variables
├── package.json            # NPM package configuration
└── README.md               # Documentation for the backend
```

## Setup Instructions
1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd civic-issue-reporting/backend
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Configure environment variables**:
   - Copy `.env.example` to `.env` and fill in the required values (e.g., database connection string, JWT secret).

4. **Run the application**:
   ```
   npm start
   ```

5. **API Documentation**:
   - Refer to the individual route files in the `src/routes` directory for details on available endpoints.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.