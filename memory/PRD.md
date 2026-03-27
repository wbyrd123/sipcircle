# SipCircle - Product Requirements Document

## Overview
SipCircle (formerly PourPal) is a bartender-customer social networking app that connects bartenders with their patrons and allows all users to connect with each other. The app allows bartenders to build a following, share their work schedules, receive tips, and enables customers to follow bartenders and each other.

## Original Problem Statement
Create a bartender-customer social app with features for bartenders (profile pictures, work locations/schedules, payment links for tips via Venmo/CashApp/PayPal, messaging, follower blocking, map links, happy hour info with drink details, QR codes) and customers (profile pictures, messaging, invites for meetups with Google Maps location selection). Mobile-first approach prepared for iOS App Store submission.

## User Personas

### Bartender
- Wants to build a following of regular customers
- Needs to share work schedules and locations
- Wants to receive tips via Venmo/CashApp/PayPal
- Needs to communicate with customers and block problematic ones
- Can set profile to "Approval Required" for follow requests

### Customer (Bar-Goer)
- Wants to follow favorite bartenders AND other bar-goers
- Needs to know where/when bartenders are working
- Wants to send tips and messages
- Wants to invite friends to meet at bars (with location search)
- Can set profile to "Approval Required" for follow requests

## Architecture

### Tech Stack
- **Frontend**: React 19 with Tailwind CSS, shadcn/ui components
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT-based
- **Storage**: Emergent Object Storage (for profile images)
- **Mobile**: Capacitor (iOS wrapper)
- **Maps**: Google Places API (location autocomplete)

### Key API Endpoints
- `POST /api/auth/register` - User registration with age verification
- `POST /api/auth/login` - User login (email or username)
- `GET /api/auth/me` - Get current user
- `PUT /api/profile/bartender` - Update bartender profile (incl. require_follow_approval)
- `PUT /api/profile/customer` - Update customer profile (incl. require_follow_approval)
- `POST /api/profile/image` - Upload profile image
- `DELETE /api/account` - Delete user account
- `GET /api/bartenders` - List/search bartenders
- `GET /api/bartender/{username}` - Public bartender profile
- `GET /api/user/{username}` - Universal user profile
- `POST /api/follow/{user_id}` - Follow user (creates request if approval required)
- `DELETE /api/follow/{user_id}` - Unfollow or cancel pending request
- `GET /api/follow-requests` - Get pending follow requests
- `POST /api/follow-requests/{id}/approve` - Approve follow request
- `POST /api/follow-requests/{id}/deny` - Deny follow request
- `GET /api/followers` - Get user's followers
- `GET /api/following` - Get user's following list
- `POST /api/block/{user_id}` - Block user
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - Get conversations
- `POST /api/invites` - Create invite with location

## What's Been Implemented (March 2026)

### Core Features
1. **Authentication System**
   - JWT-based authentication
   - Role selection (bartender/customer)
   - Login with email OR username
   - Age verification checkbox (21+)
   - Privacy Policy page

2. **Bartender Profiles**
   - Profile picture upload via Object Storage
   - Bio and basic info
   - Venmo/CashApp/PayPal payment links (URLs)
   - Multiple work locations with:
     - Address and venue name
     - Schedule (day/time)
     - Happy hour times with descriptions
     - Happy hour drinks (name, ingredients, price)
     - Signature drinks (name, ingredients, price)
   - QR code generation for profile URL
   - Follower count and management

3. **Customer Profiles**
   - Profile picture upload
   - Bio
   - Following list

4. **Universal Follow System**
   - All users can follow all users (bartenders & customers)
   - Privacy toggle: "Require Follow Approval"
   - Follow request flow: Follow -> Requested -> Following
   - Follow Requests page to manage incoming requests
   - Approve/Deny actions for follow requests
   - Notification badge on bottom nav for pending requests
   - Existing followers kept when enabling approval mode

5. **Social Features**
   - Block/unblock users
   - Real-time messaging
   - Invite system with Google Maps location autocomplete

6. **Discovery**
   - Search bartenders by name, username, or location
   - Universal user profiles (/u/:username)
   - Bartender profiles (/b/:username)

7. **Mobile/iOS Preparation**
   - Capacitor configured for iOS wrapper
   - Safe area handling for notched devices
   - Bundle ID: com.sipcircle.app
   - App icon generated (AI)
   - IOS_APP_STORE_GUIDE.md created

8. **UI/UX**
   - Dark "speakeasy" aesthetic (rebranded to SipCircle)
   - Whiskey Gold (#C68E17) and Merlot Red (#722F37) accents
   - Mobile-first responsive design
   - Bottom navigation with notification badges
   - Glass-morphism cards

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] User registration and login
- [x] Bartender profile management
- [x] Work locations with schedules, drinks, happy hours
- [x] Universal follow/unfollow system with approval mode
- [x] Follow requests management page
- [x] Messaging
- [x] QR code generation
- [x] Profile image upload
- [x] Age verification & Privacy Policy
- [x] Google Maps location autocomplete for invites
- [x] Account deletion
- [x] App rebranding to SipCircle

### P1 (High Priority) - NEXT
- [ ] iOS App Store deployment (Xcode ready, waiting on user)
- [ ] Generate App Store screenshots
- [ ] Android Play Store deployment

### P2 (Medium Priority)
- [ ] Push notifications for new messages/followers/requests
- [ ] Real-time messaging with WebSockets
- [ ] Email verification
- [ ] Discover all users (not just bartenders)

### P3 (Nice to Have)
- [ ] Social login (Google/Apple)
- [ ] Check-in at locations
- [ ] Bartender availability status
- [ ] Tip history tracking
- [ ] Analytics dashboard for bartenders

## Notes
- Capacitor iOS wrapper configured, user needs to open in Xcode
- Google Maps API key required in frontend/.env (REACT_APP_GOOGLE_MAPS_API_KEY)
- Profile images stored in Emergent Object Storage
- All timestamps stored as ISO strings in MongoDB
- Password hashed with bcrypt
