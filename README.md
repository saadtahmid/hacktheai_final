# 🌟 Jonoshongjog - AI-Powered Donation Matching Platform

[![GitHub stars](https://img.shields.io/github/stars/saadtahmid/hacktheai_final?style=social)](https://github.com/saadtahmid/hacktheai_final/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/saadtahmid/hacktheai_final?style=social)](https://github.com/saadtahmid/hacktheai_final/network/members)
[![GitHub license](https://img.shields.io/github/license/saadtahmid/hacktheai_final)](https://github.com/saadtahmid/hacktheai_final/blob/main/LICENSE)

**Jonoshongjog** (জনসংযোগ) is an intelligent donation matching platform that connects donors with NGOs and relief organizations using AI-powered assistance. Built for disaster relief and humanitarian aid distribution, the platform provides seamless communication in both Bengali and English.

## 🚀 Features

### 🗺️ **Real-Time Mapping & Tracking** *(NEW)*
- **Interactive Maps**: Professional Leaflet.js maps with OpenStreetMap tiles (100% FREE)
- **Live GPS Tracking**: Real-time volunteer location tracking with browser geolocation
- **Color-Coded Markers**: Visual distinction for pickup points (📦), delivery locations (🏠), and volunteers (🚗)
- **Interactive Popups**: Detailed information on map markers with status updates
- **Route Visualization**: Dynamic map updates showing delivery routes and volunteer movements
- **Mobile Optimized**: Touch-friendly map controls for field usage
- **Dark/Light Mode Maps**: Seamless theme integration with map tiles

### 🤖 AI-Powered Assistance
- **Smart Chatbot**: Real-time AI assistant using SmythOS integration
- **Intelligent Matching**: AI-driven donor-NGO matching based on needs and availability
- **Natural Language Processing**: Understands requests in Bengali and English
- **Context-Aware Responses**: Maintains conversation history for better assistance

### 🎨 **Enhanced User Experience** *(UPDATED)*
- **Framer Motion Animations**: Smooth page transitions and micro-interactions
- **Professional UI Components**: Custom-built components with consistent styling
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

### 🌍 Bilingual Support
- **Bengali (বাংলা)**: Complete interface and AI support in Bengali
- **English**: Full English language support
- **Dynamic Language Switching**: Switch languages instantly without page reload
- **Culturally Appropriate**: Designed for Bengali-speaking communities

### 👥 **Multi-Role Platform** *(ENHANCED)*
- **Volunteer Dashboard**: Advanced dashboard with live map, GPS tracking, and task management
- **Donors**: Streamlined donation process with real-time matching
- **NGOs**: Comprehensive request management with volunteer coordination tools
- **Real-time Updates**: Live status tracking for all platform participants

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for lightning-fast development and building
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations and transitions
- **React Router** for client-side navigation
- **Leaflet.js** for interactive maps (FREE alternative to Google Maps)
- **Custom Hooks** for reusable state management logic

### Backend
- **Node.js** with Express.js framework
- **RESTful API** architecture with proper HTTP methods
- **JWT Authentication** for secure user sessions
- **Real-time Communication** ready for WebSocket integration
- **Database Integration** optimized for PostgreSQL/MySQL

### Mapping & Geolocation
- **Leaflet.js** for interactive mapping (100% free, no API keys)
- **OpenStreetMap** tiles for map data
- **Browser Geolocation API** for real-time GPS tracking
- **Custom Marker System** with emoji-based visual indicators
- **Responsive Map Controls** optimized for mobile devices

### AI Integration
- **SmythOS** for conversational AI capabilities
- **Real-time Chat** with typing indicators
- **Session Management** for continuous conversations
- **Multi-language AI** support (Bengali & English)
- **Context-Aware Responses** with conversation history

### Database
- **PostgreSQL/MySQL** compatible schema
- **Migrations** for database versioning
- **Optimized Queries** for performance
- **Data Security** with proper validation

## 📁 Project Structure

```
jonoshongjog/
├── 📁 frontend/          # React TypeScript application
│   ├── 📁 src/
│   │   ├── 📁 components/    # Reusable UI components
│   │   │   ├── LeafletMapComponent.tsx    # Interactive map component
│   │   │   ├── ThemeProvider.tsx          # Dark/light theme management
│   │   │   ├── LanguageSwitcher.tsx       # Bilingual support
│   │   │   └── ...                        # Other UI components
│   │   ├── 📁 pages/         # Page components
│   │   │   ├── VolunteerDashboard.tsx     # Enhanced volunteer interface
│   │   │   ├── DonorDashboard.tsx         # Donor management interface
│   │   │   └── ...                        # Other page components
│   │   ├── 📁 services/      # API and external service integrations
│   │   ├── 📁 hooks/         # Custom React hooks
│   │   │   └── useRealTimeTracking.ts     # GPS tracking hook
│   │   ├── 📁 types/         # TypeScript type definitions
│   │   └── 📁 utils/         # Utility functions
│   └── 📁 public/            # Static assets
├── 📁 backend/           # Node.js Express server
│   ├── 📁 routes/            # API route handlers
│   │   ├── volunteers.js         # Volunteer management routes
│   │   ├── donations.js          # Donation handling routes
│   │   ├── ai.js                 # AI chatbot integration
│   │   └── ...                   # Other route handlers
│   ├── 📁 config/            # Configuration files
│   └── server.js             # Main server file
├── 📁 database/          # Database schema and migrations
│   ├── schema.sql            # Complete database schema
│   └── 📁 migrations/        # Database migration files
├── 📄 LEAFLET_MAPS_SETUP.md # Mapping setup documentation
└── 📄 README.md
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**
- **PostgreSQL** or **MySQL** (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/saadtahmid/hacktheai_final.git
   cd hacktheai_final
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   # Installs: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Leaflet.js
   cd ..
   ```

4. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   # Installs: Express.js, JWT, database drivers, API middleware
   cd ..
   ```

5. **Set up environment variables**
   
   Create `.env` files in both directories:
   
   **Frontend (.env)**:
   ```env
   # API Configuration
   VITE_API_BASE_URL=http://localhost:5000/api
   
   # App Information
   VITE_APP_NAME=Jonoshongjog
   VITE_APP_VERSION=1.0.0
   
   # Features (No API keys needed for maps!)
   VITE_ENABLE_REAL_TIME_TRACKING=true
   ```
   
   **Backend (.env)**:
   ```env
   PORT=5000
   DATABASE_URL=your_database_connection_string
   JWT_SECRET=your_jwt_secret_key
   SMYTHOS_API_URL=your_smythos_api_endpoint
   ```

6. **Set up the database**
   ```bash
   # Import the schema
   psql -U your_username -d your_database < database/schema.sql
   ```

### 🏃‍♂️ Running the Application

#### Development Mode
```bash
# Start both frontend and backend concurrently
npm run dev

# Or start them separately:
# Backend (runs on http://localhost:5000)
cd backend && npm start

# Frontend (runs on http://localhost:5173)
cd frontend && npm run dev
```

#### Production Mode
```bash
# Build frontend
cd frontend && npm run build

# Start backend
cd backend && npm start
```

## 🌟 Key Components

### 🗺️ **Real-Time Mapping System** *(NEW)*
Advanced volunteer tracking and coordination:
- **Interactive Leaflet Maps**: Professional mapping without API costs
- **Live GPS Tracking**: Real-time volunteer location updates
- **Smart Markers**: Color-coded system for different location types
- **Mobile-First Design**: Touch-optimized controls for field usage
- **Error Handling**: Robust coordinate validation and fallback states
- **Demo Mode**: Sample locations for presentation and testing

### 🎨 **Enhanced UI/UX** *(UPDATED)*
Modern, animated interface with professional polish:
- **Framer Motion**: Smooth page transitions and micro-interactions  
- **Theme System**: Comprehensive dark/light mode with auto-detection
- **Responsive Layout**: Optimized for all screen sizes and devices
- **Accessibility**: WCAG compliance with keyboard navigation
- **Visual Feedback**: Loading states, hover effects, and status indicators

### 🤖 AI Chatbot Integration
Sophisticated AI assistant powered by SmythOS:
- **Universal Access**: Floating chatbot available on all pages
- **Context-Aware**: Maintains conversation history across sessions
- **Multilingual**: Supports Bengali and English seamlessly
- **Real-time**: Instant responses with typing indicators
- **Smart Suggestions**: Contextual help based on current page

### 🔄 **Donation Matching System** *(ENHANCED)*
Intelligent coordination between all parties:
- **Smart Algorithms**: AI-powered matching based on location and needs
- **Real-time Updates**: Live status updates for donors, NGOs, and volunteers
- **Transparent Process**: Clear communication throughout donation lifecycle
- **Route Optimization**: Efficient volunteer routing for maximum impact

## 🔒 Security Features

- **JWT Authentication**: Secure user authentication and authorization
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **Data Encryption**: Sensitive data encryption
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 🌍 Internationalization

The platform is built with internationalization in mind:
- **Dynamic Language Switching**: Change language without page reload
- **RTL Support Ready**: Prepared for right-to-left languages
- **Cultural Sensitivity**: Culturally appropriate design and content
- **Local Date/Time**: Proper date and time formatting for each locale

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
5. **Push to the branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation when needed
- Ensure all tests pass before submitting

## 📝 API Documentation

### Authentication Endpoints
```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
POST /api/auth/logout         # User logout
GET  /api/auth/profile        # Get user profile
```

### Donation Endpoints
```
GET    /api/donations         # Get all donations
POST   /api/donations         # Create new donation
GET    /api/donations/:id     # Get specific donation
PUT    /api/donations/:id     # Update donation
DELETE /api/donations/:id     # Delete donation
```

### AI Chat Endpoints
```
POST /api/chat/message        # Send message to AI
GET  /api/chat/history        # Get chat history
```

## 📊 Database Schema

The platform uses a comprehensive database schema supporting:
- **Users and Authentication**
- **Donations and Requests**
- **Volunteer Management**
- **AI Chat History**
- **Matching and Routing**

See `database/schema.sql` for the complete database structure.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port | Yes |
| `DATABASE_URL` | Database connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `smythos_API_URL` | smythos API endpoint | Yes |

### Theme Configuration
The platform supports extensive theme customization:
- **Color Schemes**: Modify colors in `ThemeProvider.tsx`
- **Typography**: Custom fonts and text styles
- **Component Styling**: Tailwind CSS classes for easy customization

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment
1. Build the frontend: `cd frontend && npm run build`
2. Configure environment variables
3. Start the backend: `cd backend && npm start`
4. Serve frontend build files with a web server

### Cloud Deployment
The application is ready for deployment on:
- **Vercel/Netlify** (Frontend)
- **Heroku/Railway** (Backend)
- **AWS/Google Cloud** (Full Stack)

## 📱 Mobile Responsiveness

The platform is fully responsive with **mobile-first design** and works seamlessly on:

### 📱 **Mobile Devices** (320px - 767px)
- **Touch-Optimized Maps**: Gesture controls for map navigation
- **GPS Integration**: Native browser geolocation for accurate tracking
- **Simplified UI**: Streamlined interface for smaller screens
- **Offline Ready**: Core functions available without internet

### 📟 **Tablets** (768px - 1199px)  
- **Enhanced Map Controls**: Better visibility and interaction
- **Split-Screen Ready**: Optimized for tablet multitasking
- **Touch-First**: All interactions designed for touch interface

### 🖥️ **Desktop** (1200px+)
- **Full Feature Set**: Complete functionality with keyboard shortcuts
- **Multi-Panel Layout**: Efficient use of screen real estate
- **Hover States**: Enhanced interactivity with mouse interactions
- **Keyboard Navigation**: Full accessibility compliance

### 🎯 **Performance Optimizations**
- **Lazy Loading**: Maps and components load only when needed
- **Image Optimization**: WebP format with fallbacks
- **Code Splitting**: Minimal bundle sizes for faster loading
- **Service Workers**: Ready for PWA implementation

## 🔍 Testing

```bash
# Run frontend tests
cd frontend && npm test

# Run backend tests
cd backend && npm test

# Run all tests
npm test
```

## 📈 Performance

- **Lazy Loading**: Components and routes are lazy-loaded
- **Code Splitting**: Automatic code splitting with Vite
- **Image Optimization**: Optimized images and assets
- **Caching**: Proper caching strategies implemented

## 🆘 Support

If you encounter any issues or have questions:

1. **Check the Documentation**: Review this README and code comments
2. **Search Issues**: Look through existing GitHub issues
3. **Create an Issue**: Open a new issue with detailed information
4. **Contact Us**: Reach out to the development team

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- **Saad Tahmid** - *Initial work* - [@saadtahmid](https://github.com/saadtahmid)

## 🙏 Acknowledgments

- **smythos** for AI integration capabilities
- **React Community** for excellent documentation and tools
- **Tailwind CSS** for the utility-first CSS framework
- **Open Source Community** for inspiration and resources

## 🔮 Future Roadmap

### 🚀 **Short Term** (Next 2-4 weeks)
- [ ] **Route Optimization**: AI-powered delivery route planning
- [ ] **Push Notifications**: Real-time alerts for volunteers and donors
- [ ] **Advanced Analytics**: Impact tracking and performance dashboards
- [ ] **Offline Mode**: Limited functionality when internet is unavailable

### 🎯 **Medium Term** (1-3 months)
- [ ] **Mobile App**: React Native application with native GPS
- [ ] **Multi-Volunteer Coordination**: Team-based delivery management  
- [ ] **Video Integration**: Direct communication between parties
- [ ] **Blockchain Tracking**: Transparent donation verification
- [ ] **Advanced Geofencing**: Automated check-ins and status updates

### 🌟 **Long Term** (3+ months)
- [ ] **Multi-city Expansion**: Support for multiple regions/countries
- [ ] **Drone Integration**: Automated delivery for remote areas
- [ ] **ML Predictions**: Demand forecasting and resource allocation
- [ ] **Multi-currency Support**: International donation capabilities
- [ ] **Government Integration**: Official disaster response coordination

---

## 🆘 **Emergency Features** *(READY FOR DEPLOYMENT)*

### ✅ **Disaster Response Ready**
- **Real-time Coordination**: Immediate volunteer deployment
- **GPS Tracking**: Live location monitoring for safety
- **Offline Capability**: Core functions work without internet
- **Multi-language**: Communications in local languages
- **Mobile Optimized**: Field-ready interface for emergency response

### ✅ **Scalability Features**
- **Load Balancing**: Ready for high traffic scenarios
- **Database Optimization**: Efficient queries for large datasets
- **CDN Ready**: Fast global content delivery
- **Monitoring**: Built-in error tracking and performance monitoring

---

## 📚 **Additional Documentation**

- **[Leaflet Maps Setup Guide](LEAFLET_MAPS_SETUP.md)**: Complete mapping implementation guide
- **[AI Implementation Summary](AI_IMPLEMENTATION_SUMMARY.md)**: SmythOS integration details
- **[Database Schema](database/schema.sql)**: Complete database structure
- **[API Specifications](AI_AGENTS_LANGFLOW_SPECS.md)**: Detailed API documentation

---

<div align="center">
  
  ## 🗺️ **Live Demo Features**
  
  ### **Try the Interactive Maps!**
  1. Navigate to **Volunteer Dashboard** → **Live Map** tab
  2. Grant location permissions for GPS tracking
  3. Click **Start Tracking** to see real-time updates
  4. Interact with color-coded markers for details
  
  ### **🎯 Perfect for Hackathon Demos**
  ✅ **No API Keys Required** - Works immediately  
  ✅ **Real GPS Functionality** - Actual location tracking  
  ✅ **Professional UI** - Smooth animations and interactions  
  ✅ **Mobile Ready** - Touch-optimized for field testing  
  
  ---
  
  <h3>🌟 Star this project if you found it helpful! 🌟</h3>
  <p>Made with ❤️ for humanitarian aid and disaster relief</p>
  
  **🚀 Ready for immediate deployment and demonstration!**
  
</div>