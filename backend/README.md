# Jonoshongjog Backend API

AI-powered relief distribution platform backend for Bangladesh

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your environment variables in .env
# Then start the server
npm run dev
```

## 📋 Environment Setup

### Required Environment Variables

```env
# Database
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Authentication
JWT_SECRET=your_jwt_secret_key

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# AI Services (Future Integration)
LANGFLOW_API_URL=your_langflow_api_endpoint
LANGFLOW_API_KEY=your_langflow_api_key

# SMS Service (Future Integration)
SMS_API_KEY=your_sms_service_key
SMS_API_URL=your_sms_service_url
```

## 🏗️ API Architecture

### Core Routes

1. **Authentication** (`/api/auth`)
   - User registration, login, phone verification
   - JWT-based authentication
   - Profile management

2. **Donations** (`/api/donations`)
   - Create, read, update, delete donations
   - Geographic search for nearby donations
   - Status management (pending → available → matched)

3. **Requests** (`/api/requests`)
   - Relief request management
   - Matching with available donations
   - Urgency-based prioritization

4. **Volunteers** (`/api/volunteers`)
   - Volunteer registration and availability
   - Delivery assignment and tracking
   - Route optimization integration

5. **Matching** (`/api/matching`)
   - AI-powered donation-request matching
   - Volunteer assignment
   - Match status tracking

6. **Chat** (`/api/chat`)
   - Bangla voice/text AI assistant
   - Intent analysis and smart responses
   - Voice-to-text and text-to-speech

## 🛠️ Technology Stack

- **Runtime**: Node.js with Express.js
- **Database**: Supabase (PostgreSQL with PostGIS)
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: express-validator
- **Security**: helmet, cors, rate limiting
- **Language Support**: Bangla and English

## 🔒 Security Features

- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- Password hashing with bcrypt
- JWT token-based authentication
- CORS protection
- SQL injection prevention via Supabase

## 📊 Database Integration

### Supabase Features Used
- Real-time subscriptions
- Row Level Security (RLS)
- PostGIS for geographic queries
- Automatic API generation
- Built-in authentication

### Key Database Functions
- `find_nearby_donations(lat, lng, radius_km, result_limit)`
- `find_nearby_requests(lat, lng, radius_km, result_limit)`
- `find_nearby_volunteers(lat, lng, radius_km, transport_filter, result_limit)`

## 🤖 AI Integration Points

### Ready for Langflow Integration
All routes include TODO comments for AI agent calls:

1. **Validation Agent**: Verify donation and request authenticity
2. **Matching Agent**: Intelligent supply-demand matching
3. **Routing Agent**: Optimize volunteer delivery routes
4. **Notification Agent**: Real-time updates to stakeholders
5. **Chat Agent**: Natural language processing for Bangla

## 📱 Mobile-First API Design

- Optimized for mobile app consumption
- Bangla phone number validation
- Geographic coordinate handling
- Image upload support for delivery proof
- Voice message processing capabilities

## 🌍 Bangladesh-Specific Features

- Bengali phone number format validation
- Geographic regions and divisions
- Disaster-specific categories (flood, cyclone)
- Cultural sensitivity in relief terminology
- Local currency and measurement units

## 🔧 Development Commands

```bash
# Development with auto-reload
npm run dev

# Production build
npm start

# Run tests (when implemented)
npm test

# Database migrations (via Supabase CLI)
npx supabase migration up
```

## 📈 Performance Optimizations

- Compression middleware
- Database query optimization
- Geographic indexing via PostGIS
- Connection pooling through Supabase
- Efficient JSON serialization

## 🚦 API Response Format

All API responses follow a consistent format:

```json
{
  "success": true|false,
  "data": { ... },
  "message": "Human readable message",
  "error": "Error description (if applicable)"
}
```

## 🔗 Integration Checklist

- [ ] Deploy to production environment
- [ ] Configure SMS service for OTP
- [ ] Integrate Langflow AI agents
- [ ] Set up image storage for delivery proof
- [ ] Configure real-time notifications
- [ ] Add comprehensive logging
- [ ] Implement API documentation (Swagger)
- [ ] Set up monitoring and analytics

## 📞 Support

For development questions or issues:
- Review the database schema in `/database/README.md`
- Check frontend integration points
- Refer to API endpoint documentation in route files

---

Built for the Jonoshongjog relief distribution platform with ❤️ for Bangladesh