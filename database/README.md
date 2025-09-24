# Jonoshongjog Database Schema Documentation

## Overview
This document provides comprehensive documentation for the Jonoshongjog relief distribution platform database schema. The schema is designed to support an AI-powered system that connects donors with communities in need through intelligent matching and volunteer coordination.

## Schema Version
**Current Version:** 1.0.0  
**Last Updated:** September 23, 2025  
**Database Engine:** PostgreSQL with PostGIS extension  

## Architecture Principles

### 1. Multi-Agent AI Integration
The schema is designed to support four main AI agents:
- **Validation Agent**: Verifies donations and requests
- **Matching Agent**: Creates optimal donor-NGO pairs  
- **Routing Agent**: Optimizes delivery routes
- **Notification Agent**: Handles real-time communications

### 2. Real-Time Operations
- PostgreSQL LISTEN/NOTIFY for real-time updates
- Row Level Security (RLS) for data protection
- Supabase-compatible for real-time subscriptions
- Geographic queries using PostGIS

### 3. Bangladesh Context
- Multi-language support (Bangla/English)
- Geographic divisions and districts
- Disaster-specific emergency handling
- Cultural considerations for relief distribution

## Core Table Relationships

```
users (1) ←→ (1) user_profiles
  ↓
  ├── donations (1:N) ←┐
  ├── relief_requests (1:N) ←┼→ matches (N:M)
  └── deliveries (1:N) ←┘
       ↓
       delivery_confirmations (1:1)
```

## Table Groups

### 🔐 User Management
| Table | Purpose | Key Features |
|-------|---------|--------------|
| `users` | Core authentication and basic profile | Email/phone auth, role-based access |
| `user_profiles` | Extended role-specific data | Donor/NGO/volunteer specific fields, verification system |

### 📦 Donation System
| Table | Purpose | Key Features |
|-------|---------|--------------|
| `donations` | Items offered for donation | AI validation scores, expiry tracking, photo storage |
| `relief_requests` | NGO requests for relief items | Beneficiary counts, emergency types, urgency levels |

### 🤖 AI & Matching
| Table | Purpose | Key Features |
|-------|---------|--------------|
| `agent_processes` | AI agent execution logs | Processing times, confidence scores, error tracking |
| `matches` | Donation-request pairs | Compatibility scores, distance calculations |

### 🚛 Delivery Management
| Table | Purpose | Key Features |
|-------|---------|--------------|
| `deliveries` | Volunteer assignments | Route optimization, real-time tracking |
| `delivery_confirmations` | Proof of delivery | Photos, ratings, recipient verification |

### 💬 Communication
| Table | Purpose | Key Features |
|-------|---------|--------------|
| `chat_sessions` | AI assistant conversations | Multi-language support, satisfaction tracking |
| `chat_messages` | Individual chat messages | Voice transcription, intent detection |
| `notifications` | Multi-channel alerts | In-app, SMS, email delivery |

### 📊 Analytics & Emergency
| Table | Purpose | Key Features |
|-------|---------|--------------|
| `platform_metrics` | Daily performance tracking | Success rates, geographic distribution |
| `emergency_events` | Disaster response coordination | Priority boosting, special routing |

## Key Design Features

### Geographic Data
- **PostGIS Integration**: All location data stored as POINT types
- **Spatial Indexes**: Optimized for distance-based queries
- **Bangladesh Districts**: Complete geographic coverage

### Status Workflows

#### Donation Lifecycle
```
pending_validation → available → matched → picked_up → delivered
                         ↓
                    expired/cancelled
```

#### Request Lifecycle  
```
pending_validation → active → partially_matched → in_progress → fulfilled
                         ↓
                    expired/cancelled
```

#### Delivery Status
```
assigned → en_route_pickup → picked_up → en_route_delivery → delivered
            ↓
       failed/cancelled
```

### AI Agent Integration

#### Validation Agent
- **Input**: Photos, descriptions, location data
- **Output**: Validation scores (0-1), quality assessments
- **Storage**: `agent_processes` table with confidence metrics

#### Matching Agent  
- **Input**: Available donations, active requests, volunteer capacity
- **Processing**: Geographic proximity, urgency alignment, quantity matching
- **Output**: Optimized matches with compatibility scores

#### Routing Agent
- **Input**: Confirmed matches, volunteer locations, traffic data
- **Processing**: Multi-stop optimization, capacity constraints
- **Output**: Turn-by-turn routes with ETAs

#### Notification Agent
- **Triggers**: Status changes, new matches, emergencies
- **Channels**: In-app notifications, SMS, email
- **Personalization**: Language preferences, urgency levels

## Performance Optimizations

### Indexes
- **Geographic**: GIST indexes for spatial queries
- **Status Queries**: Compound indexes for real-time operations  
- **User Activity**: Optimized for role-based filtering
- **Time Series**: Date-based indexes for analytics

### Real-Time Features
- **LISTEN/NOTIFY**: PostgreSQL native real-time notifications
- **Triggers**: Automatic timestamp updates and notifications
- **RLS Policies**: Secure data access by user role

## Security Considerations

### Row Level Security (RLS)
- Users can only access their own data
- Role-based permissions (donor/NGO/volunteer)
- Admin override capabilities

### Data Protection
- Password hashing (handled by Supabase Auth)
- Sensitive document storage (external URLs)
- Audit trails for all critical operations

## Emergency Response Features

### Disaster Mode Activation
- **Priority Boosting**: Urgent requests get preference
- **Geographic Filtering**: Focus on affected areas
- **Special Routing**: Account for blocked roads/bridges
- **Mass Notifications**: Emergency alerts to all users

### Emergency Event Tracking
- Real-time disaster impact assessment
- Population estimates and affected areas
- Platform response coordination
- Performance metrics during crises

## Usage Examples

### Common Queries

#### Find Available Donations Near Location
```sql
SELECT d.*, u.full_name as donor_name
FROM donations d
JOIN users u ON d.donor_id = u.id
WHERE d.status = 'available'
  AND ST_DWithin(d.pickup_coordinates, ST_Point(90.4125, 23.8103), 10000) -- 10km radius
ORDER BY ST_Distance(d.pickup_coordinates, ST_Point(90.4125, 23.8103));
```

#### Get Active Matches for Volunteer
```sql
SELECT m.*, d.item_name, r.beneficiaries_count, del.status as delivery_status
FROM matches m
JOIN donations d ON m.donation_id = d.id  
JOIN relief_requests r ON m.request_id = r.id
LEFT JOIN deliveries del ON del.match_id = m.id
WHERE m.assigned_volunteer_id = $volunteer_id
  AND m.status IN ('confirmed', 'assigned', 'in_progress');
```

#### Emergency Response Dashboard
```sql
SELECT 
  ee.event_name,
  ee.severity_level,
  COUNT(rr.id) as urgent_requests,
  COUNT(d.id) as available_donations
FROM emergency_events ee
LEFT JOIN relief_requests rr ON rr.urgency = 'critical' 
  AND rr.created_at >= ee.started_at
LEFT JOIN donations d ON d.status = 'available'
  AND d.created_at >= ee.started_at
WHERE ee.ended_at IS NULL
GROUP BY ee.id, ee.event_name, ee.severity_level;
```

## Migration and Versioning

### Schema Updates
- All changes tracked in `schema_versions` table
- Backward compatibility maintained where possible
- Migration scripts for version updates

### Future Enhancements
- **Planned v1.1**: Advanced analytics dashboards
- **Planned v1.2**: Integration with government disaster APIs
- **Planned v1.3**: Machine learning model storage for predictive analytics

## Development Setup

### Prerequisites
- PostgreSQL 14+
- PostGIS extension
- Supabase CLI (recommended)

### Installation
```bash
# Create database
createdb jonoshongjog

# Run schema
psql -d jonoshongjog -f database/schema.sql

# Verify installation
psql -d jonoshongjog -c "SELECT version FROM schema_versions ORDER BY applied_at DESC LIMIT 1;"
```

### Environment Variables
```env
DATABASE_URL=postgresql://username:password@localhost:5432/jonoshongjog
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## Support and Maintenance

### Monitoring
- Query performance via pg_stat_statements
- Real-time connection monitoring  
- Storage usage and growth tracking
- AI agent performance metrics

### Backup Strategy
- Daily automated backups
- Geographic replication for disaster recovery
- Point-in-time recovery capability
- Critical data export procedures

### Contact
For schema questions or modification requests, contact the development team.

---

**Note**: This schema is designed specifically for the Jonoshongjog relief distribution platform and incorporates requirements for multi-agent AI systems, real-time operations, and Bangladesh-specific geographic and cultural considerations.