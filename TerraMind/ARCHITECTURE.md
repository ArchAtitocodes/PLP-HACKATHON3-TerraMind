# TerraMind Architecture Documentation

## System Overview

TerraMind is a modern, cloud-native application built on a serverless architecture using Supabase as the backend platform and React for the frontend.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth UI    │  │  Dashboard   │  │  Chat UI     │      │
│  │  (Login/     │  │  (Plots,     │  │  (Gemini AI) │      │
│  │   Signup)    │  │  Analytics)  │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│                    React 18 + TypeScript                     │
│                    Tailwind CSS Styling                      │
│                    Deployed on Vercel                        │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTPS / REST API
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                     API GATEWAY LAYER                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                    Supabase Edge Functions                   │
│                    (Deno Runtime on Edge)                    │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  analyze-   │  │ recommend-  │  │   track-    │         │
│  │   land      │  │   crop      │  │  progress   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                               │
│  ┌─────────────────────────────────────────────┐            │
│  │           chat-regen (Gemini)               │            │
│  └─────────────────────────────────────────────┘            │
│                                                               │
└───────────────┬────────────────────────┬────────────────────┘
                │                        │
                │                        │
        ┌───────▼──────┐        ┌───────▼──────────┐
        │   Supabase   │        │   External APIs  │
        │  PostgreSQL  │        │  - Gemini API    │
        │   Database   │        │  - SentinelHub   │
        │              │        │  - SoilGrids     │
        │   + Storage  │        │  - NASA POWER    │
        │   + Auth     │        └──────────────────┘
        └──────────────┘
```

## Technology Stack

### Frontend Layer

```typescript
// Core Framework
React 18.3.1 + TypeScript 5.5.3

// Build Tool
Vite 5.4.2

// Styling
Tailwind CSS 3.4.1

// Icons
Lucide React 0.344.0

// State Management
React Context API (built-in)

// API Client
@supabase/supabase-js 2.57.4
```

### Backend Layer

```typescript
// Runtime
Deno (Edge Functions)

// Database
PostgreSQL via Supabase

// ORM/Client
Supabase Client SDK

// Authentication
Supabase Auth (JWT-based)

// Storage
Supabase Storage (for images)
```

### AI/ML Layer

```typescript
// Conversational AI
Gemini 1.5 Pro API

// Analysis Algorithms
- Custom NDVI/EVI calculation
- Soil quality scoring
- Crop recommendation engine
- Progress trend analysis
```

## Data Flow

### 1. Land Analysis Flow

```
User Action: "Analyze Now"
    │
    ├─→ Frontend: analyzeLand(plotId)
    │
    ├─→ Edge Function: analyze-land
    │   │
    │   ├─→ Fetch plot coordinates from DB
    │   ├─→ Calculate NDVI/EVI (simulated)
    │   ├─→ Assess soil quality
    │   ├─→ Determine degradation risk
    │   └─→ Store results in land_analytics
    │
    └─→ Response: Analysis data + insights
        │
        └─→ Frontend: Display metrics cards
```

### 2. Recommendation Flow

```
User Action: View plot details
    │
    ├─→ Trigger: recommendCrop(plotId)
    │
    ├─→ Edge Function: recommend-crop
    │   │
    │   ├─→ Fetch latest analytics
    │   ├─→ Run ML recommendation algorithm
    │   │   ├─→ Filter suitable crops
    │   │   ├─→ Score by conditions
    │   │   └─→ Prioritize by risk
    │   ├─→ Store recommendations in DB
    │   └─→ Return top 5 recommendations
    │
    └─→ Frontend: Display recommendation cards
```

### 3. Chat Flow

```
User: Asks question
    │
    ├─→ Frontend: chatWithAssistant(message, plotId)
    │
    ├─→ Edge Function: chat-regen
    │   │
    │   ├─→ Build context from plot data
    │   │   ├─→ Fetch plot details
    │   │   ├─→ Get latest analytics
    │   │   └─→ Load recommendations
    │   │
    │   ├─→ Call Gemini API
    │   │   ├─→ System prompt + context
    │   │   ├─→ Conversation history
    │   │   └─→ User message
    │   │
    │   └─→ Return AI response
    │
    └─→ Frontend: Display in chat UI
```

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐
│    users     │
│              │
│ - id (PK)    │─┐
│ - email      │ │
│ - full_name  │ │
│ - role       │ │
└──────────────┘ │
                 │
                 │ 1:N
                 │
        ┌────────▼────────┐
        │  land_plots     │
        │                 │
        │ - id (PK)       │─┬─────────────┐
        │ - user_id (FK)  │ │             │
        │ - name          │ │             │
        │ - latitude      │ │             │
        │ - longitude     │ │             │
        │ - area_hectares │ │             │
        └─────────────────┘ │             │
                            │             │
                            │ 1:N         │ 1:N
                            │             │
              ┌─────────────▼──────┐ ┌────▼──────────────┐
              │  land_analytics    │ │  recommendations  │
              │                    │ │                   │
              │ - id (PK)          │ │ - id (PK)         │
              │ - plot_id (FK)     │ │ - plot_id (FK)    │
              │ - ndvi_value       │ │ - item_name       │
              │ - evi_value        │ │ - reason          │
              │ - soil_quality     │ │ - confidence      │
              │ - degradation_risk │ │ - priority        │
              └─────────┬──────────┘ └───────────────────┘
                        │
                        │ N:2 (baseline + current)
                        │
              ┌─────────▼──────────┐
              │   impact_logs      │
              │                    │
              │ - id (PK)          │
              │ - plot_id (FK)     │
              │ - baseline_id (FK) │
              │ - current_id (FK)  │
              │ - ndvi_delta       │
              │ - improvement_%    │
              └────────────────────┘
```

## Security Architecture

### Authentication Flow

```
1. User Registration
   ↓
   Supabase Auth (creates user)
   ↓
   Trigger: Insert into users table
   ↓
   JWT token issued
   ↓
   Frontend stores in memory

2. Authenticated Requests
   ↓
   Frontend: Include Authorization header
   ↓
   Edge Function: Verify JWT
   ↓
   Supabase: Validate token
   ↓
   RLS: Check user permissions
   ↓
   Return authorized data only
```

### Row Level Security (RLS)

```sql
-- Example: land_plots RLS policy
CREATE POLICY "Users can view own plots"
  ON land_plots FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensures users can ONLY see their own plots
-- Applied automatically to all queries
-- Cannot be bypassed from client
```

### API Security

- All Edge Functions require JWT authentication
- Service role key never exposed to frontend
- CORS configured for specific origins
- Rate limiting via Supabase (configurable)
- Input validation on all endpoints

## Scalability Considerations

### Database
- **Current**: Supabase free tier (500MB)
- **Scaling**:
  - Upgrade to Pro ($25/month) for 8GB
  - Add read replicas for heavy queries
  - Implement database indexes (already done)
  - Use connection pooling

### Edge Functions
- **Current**: Serverless, auto-scaling
- **Limits**: 500k invocations/month (free tier)
- **Scaling**:
  - Upgrade for more invocations
  - Optimize function code
  - Implement caching
  - Use CDN for static assets

### Frontend
- **Current**: Vercel serverless
- **Scaling**:
  - Automatic edge caching
  - Global CDN distribution
  - Incremental static regeneration
  - Image optimization

## Performance Optimization

### Frontend
```typescript
// Code splitting by route
const Dashboard = lazy(() => import('./Dashboard'));

// Optimize images
import { optimizeImage } from './utils';

// Debounce user input
import { useDebouncedCallback } from 'use-debounce';

// Cache API responses
import { useQuery } from 'react-query';
```

### Backend
```sql
-- Database indexes
CREATE INDEX idx_analytics_plot_date
  ON land_analytics(plot_id, analysis_date DESC);

-- Efficient queries
SELECT * FROM land_analytics
WHERE plot_id = $1
ORDER BY analysis_date DESC
LIMIT 1;
```

### Edge Functions
```typescript
// Cache external API calls
const cache = new Map();
if (cache.has(key)) return cache.get(key);

// Optimize Gemini calls
const conversationHistory = messages.slice(-6); // Only recent

// Parallel processing
await Promise.all([
  fetchAnalytics(),
  fetchRecommendations()
]);
```

## Monitoring & Observability

### Frontend Monitoring
- Vercel Analytics (built-in)
- Error tracking: Browser console
- Performance: Web Vitals
- User analytics: Page views, sessions

### Backend Monitoring
- Supabase Dashboard:
  - Database performance
  - Edge Function logs
  - API request metrics
  - Error rates
- Custom logging in functions

### Alerts
- Database usage > 80%
- Edge Function errors spike
- API response time > 2s
- Authentication failures

## Deployment Pipeline

```
Developer
    │
    ├─→ git push to GitHub
    │
    ├─→ GitHub Actions (optional)
    │   ├─→ Run tests
    │   ├─→ Type checking
    │   ├─→ Build
    │   └─→ Deploy to Vercel
    │
    ├─→ Vercel (automatic)
    │   ├─→ Build frontend
    │   ├─→ Deploy to edge
    │   └─→ Update DNS
    │
    └─→ Live at vercel.app
```

## Disaster Recovery

### Database Backups
- Supabase: Daily automatic backups
- Point-in-time recovery available
- Manual backups before major changes

### Edge Functions
- Version controlled in Git
- Instant rollback capability
- Backup deployments preserved

### Frontend
- Git history for all versions
- Vercel: Instant rollback to any deployment
- Automatic preview deployments

## Future Architecture Enhancements

### Phase 2
- Real-time data sync (Supabase Realtime)
- WebSocket connections for live updates
- Background job processing (pg_cron)
- Advanced caching layer (Redis)

### Phase 3
- Microservices architecture
- Dedicated ML service
- Event-driven architecture
- Message queue (RabbitMQ)
- GraphQL API layer

### Phase 4
- Multi-region deployment
- Kubernetes orchestration
- Service mesh (Istio)
- Advanced monitoring (Datadog)

## Code Organization

```
src/
├── components/        # React components
│   ├── AuthPage.tsx
│   ├── Dashboard.tsx
│   ├── PlotDetails.tsx
│   └── ChatInterface.tsx
│
├── contexts/         # React contexts
│   └── AuthContext.tsx
│
├── lib/             # Utilities & clients
│   ├── supabase.ts  # DB client & types
│   └── api.ts       # Edge Function calls
│
└── App.tsx          # Main app component
```

## Testing Strategy

### Frontend Tests
- Unit: Component testing (Jest + RTL)
- Integration: User flows (Cypress)
- E2E: Full application (Playwright)

### Backend Tests
- Unit: Function logic (Deno test)
- Integration: API endpoints (Supertest)
- Database: RLS policies (pgTAP)

### Current Status
- Build: ✅ Passing
- Type checking: ✅ Passing
- Production ready: ✅ Yes

## Maintenance

### Daily
- Monitor error logs
- Check database usage
- Review user feedback

### Weekly
- Update dependencies
- Review performance metrics
- Optimize slow queries

### Monthly
- Security audit
- Backup verification
- Capacity planning

---

## Summary

TerraMind is built on a modern, scalable architecture that:
- Separates concerns (frontend/backend/data)
- Scales automatically with demand
- Maintains security through RLS and JWT
- Optimizes performance at every layer
- Enables rapid development and deployment

The architecture supports the current MVP and can grow to enterprise scale with minimal refactoring.
