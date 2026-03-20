# PourPal - Product Requirements Document

## Overview
PourPal is a bartender-customer social networking app that connects bartenders with their patrons. The app allows bartenders to build a following, share their work schedules, and receive tips through Venmo/CashApp integration.

## Original Problem Statement
Create a bartender-customer social app with features for bartenders (profile pictures, work locations/schedules, payment links for tips, messaging, follower blocking, map links, happy hour info, QR codes) and customers (profile pictures, messaging, invites for meetups).

## User Personas

### Bartender
- Wants to build a following of regular customers
- Needs to share work schedules and locations
- Wants to receive tips easily via Venmo/CashApp
- Needs to communicate with customers and block problematic ones

### Customer (Bar-Goer)
- Wants to follow favorite bartenders
- Needs to know where/when bartenders are working
- Wants to send tips and messages
- Wants to invite friends to meet at bars

## Architecture

### Tech Stack
- **Frontend**: React 19 with Tailwind CSS, shadcn/ui components
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT-based
- **Storage**: Emergent Object Storage (for profile images)

### API Endpoints
- `POST /api/auth/register` - User registration (bartender/customer)
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/profile/bartender` - Update bartender profile
- `PUT /api/profile/customer` - Update customer profile
- `POST /api/profile/image` - Upload profile image
- `GET /api/bartenders` - List/search bartenders
- `GET /api/bartender/{username}` - Public bartender profile
- `POST /api/follow/{bartender_id}` - Follow bartender
- `DELETE /api/follow/{bartender_id}` - Unfollow bartender
- `GET /api/followers` - Get bartender's followers
- `GET /api/following` - Get user's following list
- `POST /api/block/{user_id}` - Block user
- `DELETE /api/block/{user_id}` - Unblock user
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/{partner_id}` - Get conversation messages
- `POST /api/invites` - Create invite
- `GET /api/invites` - Get invites
- `POST /api/invites/{invite_id}/respond` - Respond to invite

## What's Been Implemented (March 2026)

### Core Features ✅
1. **Authentication System**
   - JWT-based authentication
   - Role selection (bartender/customer)
   - Secure password hashing

2. **Bartender Profiles**
   - Profile picture upload
   - Bio and basic info
   - Venmo/CashApp payment links
   - Multiple work locations with:
     - Address and venue name
     - Schedule (day/time)
     - Happy hour times with descriptions
     - Signature drinks
   - QR code generation for profile URL
   - Follower count and management

3. **Customer Profiles**
   - Profile picture
   - Bio
   - Following list

4. **Social Features**
   - Follow/unfollow bartenders
   - Block/unblock users
   - Real-time messaging
   - Invite system for meetups

5. **Discovery**
   - Search bartenders by name, username, or location
   - Browse all bartenders

6. **UI/UX**
   - Dark "speakeasy" aesthetic
   - Whiskey Gold (#C68E17) and Merlot Red (#722F37) accents
   - Mobile-first responsive design
   - Bottom navigation
   - Glass-morphism cards

## Prioritized Backlog

### P0 (Critical) - DONE ✅
- [x] User registration and login
- [x] Bartender profile management
- [x] Work locations with schedules
- [x] Follow/unfollow system
- [x] Messaging
- [x] QR code generation

### P1 (High Priority)
- [ ] Push notifications for new messages/followers
- [ ] Real-time messaging with WebSockets
- [ ] Profile image upload (requires EMERGENT_LLM_KEY)
- [ ] Email verification

### P2 (Medium Priority)
- [ ] Google Maps integration for work locations
- [ ] Drink menu photos
- [ ] Event announcements
- [ ] Advanced search filters
- [ ] Bartender ratings/reviews

### P3 (Nice to Have)
- [ ] Social login (Google/Apple)
- [ ] Check-in at locations
- [ ] Bartender availability status
- [ ] Tip history tracking
- [ ] Analytics dashboard for bartenders

## Next Tasks
1. Enable profile image upload by configuring EMERGENT_LLM_KEY
2. Add push notifications
3. Implement real-time messaging with WebSockets
4. Add Google Maps embed for work locations
5. Add email verification

## Notes
- Profile image upload requires EMERGENT_LLM_KEY environment variable
- All timestamps stored as ISO strings in MongoDB
- Password hashed with bcrypt
