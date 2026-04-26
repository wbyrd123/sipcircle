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

### Phase 2: Vendor Dashboard + Self-Service ✅ COMPLETE
- [x] Vendor login (web only) at `/vendor/login`
- [x] Vendor Dashboard at `/vendor/dashboard`
- [x] Master Page tab (logo, name, default hours, default menus)
- [x] Locations tab (select location, edit details, override hours/menus)
- [x] Add/edit/delete locations
- [x] Stars tab (search bartenders by username, add to locations)
- [x] Menu options: Link to website OR Manual entry
- [x] Admin can reset vendor passwords

### Phase 3: Push Notifications ✅ COMPLETE
- [x] Firebase Cloud Messaging setup (firebase-admin SDK)
- [x] Device token registration (POST /api/device-token)
- [x] Vendor → All followers notification (Master Page, 1/week limit)
- [x] Vendor → Specific location followers notification (2/month limit per location)
- [x] Invite sent → Automatic notification to recipient
- [x] Notification status API with rate limit tracking
- [x] Frontend push notification handling (Capacitor plugin)
- [x] **Firebase APNs Configuration Complete** - User uploaded .p8 key

### Phase 4: Cross-Follow Feature ✅ COMPLETE
- [x] **Bartender Profile → "Works At" section**: Shows venues where bartender is a Star with Follow buttons
- [x] **Venue Profile → "The Stars" section**: Shows bartenders (Stars) with Follow buttons
- [x] New API: `GET /api/bartender/{username}/venues` - Get venues where bartender is a Star
- [ ] Bartenders add work location (Google Maps or manual) - manual entry already exists

### Phase 5: Future Enhancements (NEXT)
- [ ] Custom domain setup
- [ ] Delete orphaned messaging files
- [ ] Add "PourCircle" to keywords in App Store Connect

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
- `/app/backend/server.py` - All API endpoints including venue/vendor endpoints
- `/app/frontend/src/pages/BartenderDashboard.jsx` - Home dashboard with stats
- `/app/frontend/src/pages/BartenderProfile.jsx` - Bartender profile view
- `/app/frontend/src/pages/VenuesPage.jsx` - Venue search page
- `/app/frontend/src/pages/VenueProfile.jsx` - Venue location profile
- `/app/frontend/src/pages/FollowersPage.jsx` - Updated with Following tab (People/Places)
- `/app/frontend/src/pages/EditProfile.jsx` - Settings with Change Password
- `/app/frontend/src/pages/VendorLogin.jsx` - Vendor portal login (NEW)
- `/app/frontend/src/pages/VendorDashboard.jsx` - Vendor self-service dashboard (NEW)
- `/app/frontend/src/components/BottomNav.jsx` - Updated with Venues icon
- `/app/frontend/src/App.js` - Routes including vendor portal

## Changelog

### April 26, 2026
- Fixed Following count bug: Dashboard and Profile now correctly show combined user + venue following count
- Added "Following" card to Dashboard stats grid
- Updated backend `/api/bartender/{username}` and `/api/user/{username}` endpoints to return `following_count` including venues
- Followers page now respects `?tab=following` URL parameter from Dashboard navigation
- Fixed follower count discrepancy: Profile now counts only existing users (excludes deleted accounts)
- **Added Change Password feature** in Settings with requirements: 8+ chars, 1 uppercase, 1 number
- Password requirements now enforced on: Registration, Password Reset, Change Password
- **Vendor Platform Phase 2 Complete:**
  - Created `/vendor/login` and `/vendor/dashboard` routes
  - Vendor Dashboard with 3 tabs: Master Page, Locations, Stars
  - Master Page: logo upload, name, default hours, default menus
  - Locations: add/edit/delete locations with hours/menu overrides
  - Stars: search bartenders by username and link to locations
  - Admin endpoint to reset vendor passwords
- **Firebase APNs Configuration Complete**: User uploaded .p8 Authentication Key to Firebase Console (both Development and Production)
- **Cross-Follow Feature (Phase 4) Complete:**
  - Bartender Profile now shows "Works At" section with linked venues
  - Users can follow venues directly from bartender profile
  - Venue Profile now shows Follow buttons next to Stars (bartenders)
  - Users can follow bartenders directly from venue profile
  - New API endpoint: `GET /api/bartender/{username}/venues`
