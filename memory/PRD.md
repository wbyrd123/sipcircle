# PourCircle - Product Requirements Document

## Overview
Social app connecting bartenders, bar-goers, and venues (restaurants/bars). Mobile-first approach with Capacitor wrapping for iOS and Android.

## Core Features

### User Profiles
- **Bartenders:** Profile picture, multiple work locations/schedules, payment links, follower blocking, happy hour times & signature drinks, QR code sharing
- **Customers:** Profile picture, QR code sharing, invite feature with Google Maps autocomplete

### Social Features
- Universal follow system with "Approval Required" privacy toggle
- "People You May Know" suggestions
- Invites to meet for drinks (both customers AND bartenders can send)
- Followers/Following tabs on all profiles
- Post-login redirect to profile from QR scan
- Privacy controls for followers/following lists visibility
- **Following count includes both users AND venues** (fixed April 2026)

### Venue Platform (NEW - Phase 1 Complete)
- Venues page with zip code search
- Venue profile pages with location details
- Follow/unfollow venues
- Venues appear in Following list alongside users
- CTA for venue signup: "Get information on signing up your restaurant or bar by emailing admin@pourcircle.net"
- QR code and share functionality for venues
- Admin can create vendors and add locations

### Authentication
- JWT-based auth with 20-day token expiration
- Forgot Password / Reset Password via SendGrid email

### Compliance
- Privacy Policy, Terms of Service, Safety Guidelines, Account Deletion pages

## Technical Stack
- **Frontend:** React (Single Page App)
- **Backend:** FastAPI + MongoDB
- **Mobile:** Capacitor 5 (iOS & Android)
- **Email:** SendGrid
- **Maps:** Google Maps JavaScript API + Places API

## App Store Status
- **iOS:** LIVE on App Store
- **Android:** LIVE on Google Play

## Vendor Platform Phases

### Phase 1: Basic Venue Pages + Search ✅ COMPLETE
- [x] Remove invite from bottom nav (bar-goers) → Replaced with Venues
- [x] Add "Restaurants/Bars" icon to bottom nav (both user types)
- [x] Zip code search → Results nearest to furthest
- [x] Basic location pages (name, address, hours, phone)
- [x] Follow button + QR code for locations
- [x] Locations appear in Following list (new "Following" tab with People/Places sections)
- [x] CTA: "Follow to receive important updates such as specials or new Stars joining our team"
- [x] Admin endpoints to create vendors and add locations
- [x] Dashboard shows Following count (users + venues combined)
- [x] Profile page shows Following count (users + venues combined)
- [x] Clicking Following card navigates to Followers page with `?tab=following` parameter

### Phase 2: Vendor Dashboard + Self-Service (NEXT)
- [ ] Vendor login (web only)
- [ ] Master Page (logo, menus, hours)
- [ ] Location dropdown
- [ ] Add/edit locations
- [ ] Add Stars (search bartender username)
- [ ] Menus: manual entry OR website links
- [ ] Admin access to view/edit all vendors

### Phase 3: Push Notifications
- [ ] Firebase Cloud Messaging setup
- [ ] Vendor → All followers (from Master)
- [ ] Vendor → Specific location followers
- [ ] Invite sent → Notification to recipient

### Phase 4: Bartender Updates + Cross-Follow
- [ ] Bartenders add work location (Google Maps or manual)
- [ ] "Follow [Venue Name]" button on bartender profile (if at registered vendor)

## Key API Endpoints

### Venue Endpoints (NEW)
- `GET /api/venues/search?zip_code=XXXXX` - Search venues by zip code
- `GET /api/venues/{location_id}` - Get venue location details
- `POST /api/venues/{location_id}/follow` - Follow a venue
- `DELETE /api/venues/{location_id}/follow` - Unfollow a venue
- `GET /api/user/following-venues` - Get user's followed venues

### Admin Vendor Endpoints (NEW)
- `POST /api/admin/vendors` - Create new vendor
- `GET /api/admin/vendors` - List all vendors
- `GET /api/admin/vendors/{id}` - Get vendor details
- `POST /api/admin/vendors/{id}/locations` - Add location to vendor
- `PUT /api/admin/vendors/{id}/toggle` - Enable/disable vendor

## Database Collections

### venues (NEW)
```json
{
  "id": "uuid",
  "email": "vendor@example.com",
  "password_hash": "...",
  "name": "The Blue Bar",
  "username": "the-blue-bar",
  "logo": "path/to/logo",
  "menus": [],
  "hours": [],
  "is_active": true,
  "created_at": "ISO date"
}
```

### venue_locations (NEW)
```json
{
  "id": "uuid",
  "venue_id": "vendor uuid",
  "name": "Downtown",
  "address": "123 Main St",
  "zip_code": "10001",
  "phone": "(555) 123-4567",
  "hours": [],
  "menus": [],
  "stars": ["bartender_user_ids"],
  "followers": ["user_ids"],
  "created_at": "ISO date"
}
```

## Key Files
- `/app/backend/server.py` - All API endpoints including venue endpoints
- `/app/frontend/src/pages/BartenderDashboard.jsx` - Home dashboard with stats
- `/app/frontend/src/pages/BartenderProfile.jsx` - Bartender profile view
- `/app/frontend/src/pages/VenuesPage.jsx` - Venue search page
- `/app/frontend/src/pages/VenueProfile.jsx` - Venue location profile
- `/app/frontend/src/pages/FollowersPage.jsx` - Updated with Following tab (People/Places)
- `/app/frontend/src/components/BottomNav.jsx` - Updated with Venues icon

## Changelog

### April 26, 2026
- Fixed Following count bug: Dashboard and Profile now correctly show combined user + venue following count
- Added "Following" card to Dashboard stats grid
- Updated backend `/api/bartender/{username}` and `/api/user/{username}` endpoints to return `following_count` including venues
- Followers page now respects `?tab=following` URL parameter from Dashboard navigation
