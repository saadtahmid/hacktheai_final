# 🌟 Jonoshongjog - AI-Powered Donation Matching Platform

[![GitHub stars](https://img.shields.io/github/stars/saadtahmid/hacktheai_final?style=social)](https://github.com/saadtahmid/hacktheai_final/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/saadtahmid/hacktheai_final?style=social)](https://github.com/saadtahmid/hacktheai_final/network/members)
[![GitHub license](https://img.shields.io/github/license/saadtahmid/hacktheai_final)](https://github.com/saadtahmid/hacktheai_final/blob/main/LICENSE)

**Jonoshongjog** (জনসংযোগ) is an intelligent donation matching platform that connects donors with NGOs and relief organizations using AI-powered assistance. Built for disaster relief and humanitarian aid distribution, the platform provides seamless communication in both Bengali and English.

## 🚀 Features

### 🤖 AI-Powered Assistance
- **Smart Chatbot**: Real-time AI assistant using smythos integration
- **Intelligent Matching**: AI-driven donor-NGO matching based on needs and availability
- **Natural Language Processing**: Understands requests in Bengali and English
- **Context-Aware Responses**: Maintains conversation history for better assistance

### 🌍 Bilingual Support
- **Bengali (বাংলা)**: Complete interface and AI support in Bengali
- **English**: Full English language support
- **Dynamic Language Switching**: Switch languages instantly
- **Culturally Appropriate**: Designed for Bengali-speaking communities

### 🎨 Modern User Interface
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Accessible**: Built with accessibility standards in mind
- **Clean UI**: Modern, intuitive interface using Tailwind CSS

### 👥 Multi-Role Platform
- **Donors**: Easy donation process with AI guidance
- **NGOs**: Relief request management and volunteer coordination
- **Volunteers**: Connect with organizations and track contributions
- **Admin**: Platform management and oversight capabilities

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Custom Hooks** for state management

### Backend
- **Node.js** with Express.js
- **RESTful API** architecture
- **JWT Authentication** for secure access
- **Database Integration** ready for PostgreSQL/MySQL

### AI Integration
- **smythos** for conversational AI
- **Real-time Chat** capabilities
- **Session Management** for continuous conversations
- **Multi-language AI** support

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
│   │   ├── 📁 pages/         # Page components
│   │   ├── 📁 services/      # API and external service integrations
│   │   ├── 📁 hooks/         # Custom React hooks
│   │   ├── 📁 types/         # TypeScript type definitions
│   │   └── 📁 utils/         # Utility functions
│   └── 📁 public/            # Static assets
├── 📁 backend/           # Node.js Express server
│   ├── 📁 routes/            # API route handlers
│   ├── 📁 config/            # Configuration files
│   └── server.js             # Main server file
├── 📁 database/          # Database schema and migrations
│   ├── schema.sql            # Database schema
│   └── 📁 migrations/        # Database migration files
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
   cd ..
   ```

4. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

5. **Set up environment variables**
   
   Create `.env` files in both frontend and backend directories:
   
   **Backend (.env)**:
   ```env
   PORT=5000
   DATABASE_URL=your_database_connection_string
   JWT_SECRET=your_jwt_secret_key
   smythos_API_URL=your_smythos_api_endpoint
   ```
   
   **Frontend (.env)**:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_smythos_API_URL=your_smythos_api_endpoint
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

### AI Chatbot Integration
The platform features a sophisticated AI chatbot powered by smythos:
- **Universal Access**: Floating chatbot available on all pages
- **Context-Aware**: Maintains conversation history
- **Multilingual**: Supports Bengali and English
- **Real-time**: Instant responses with typing indicators

### Donation Matching System
Intelligent matching between donors and NGOs:
- **Smart Algorithms**: AI-powered matching based on location, needs, and resources
- **Real-time Updates**: Live status updates for all parties
- **Transparent Process**: Clear communication throughout the donation process

### User Dashboard
Comprehensive dashboards for different user roles:
- **Donor Dashboard**: Track donations, view impact, manage preferences
- **NGO Dashboard**: Request management, volunteer coordination, resource tracking
- **Volunteer Dashboard**: Available opportunities, contribution history

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

The platform is fully responsive and works seamlessly on:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)  
- **Mobile** (320px - 767px)

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

- [ ] **Mobile App**: React Native mobile application
- [ ] **Real-time Notifications**: Push notifications for updates
- [ ] **Advanced Analytics**: Detailed impact tracking and reporting
- [ ] **Blockchain Integration**: Transparent donation tracking
- [ ] **Video Calls**: Direct communication between donors and NGOs
- [ ] **Geolocation Features**: Location-based matching and routing
- [ ] **Multi-currency Support**: International donation capabilities

---

<div align="center">
  <h3>🌟 Star this project if you found it helpful! 🌟</h3>
  <p>Made with ❤️ for humanitarian aid and disaster relief</p>
</div>