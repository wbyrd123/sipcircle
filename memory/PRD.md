# PourCircle - Product Requirements Document

## Overview
Social app connecting bartenders and bar-goers. Mobile-first approach with Capacitor wrapping for iOS and Android.

## Core Features

### User Profiles
- **Bartenders:** Profile picture, multiple work locations/schedules, payment links (Venmo/CashApp/PayPal usernames), follower blocking, happy hour times & signature drinks, QR code sharing
- **Customers:** Profile picture, QR code sharing, invite feature with Google Maps autocomplete

### Social Features
- Universal follow system with "Approval Required" privacy toggle
- "People You May Know" suggestions
- Invites to meet for drinks (both customers AND bartenders can send)

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

## Completed Features (as of April 19, 2026)
- [x] User registration and authentication
- [x] Bartender and Customer profiles
- [x] Follow/unfollow system with approval toggle
- [x] Work locations with schedules
- [x] Payment links (username-based)
- [x] QR code profile sharing
- [x] Invite system with Google Maps location search
- [x] Bartender invites feature
- [x] Forgot/Reset password via SendGrid
- [x] View Profile buttons on dashboards
- [x] Legal & Policies section in settings
- [x] Light Mode toggle (UI only - CSS pending sync)
- [x] iOS SceneDelegate fix for iPadOS 26
- [x] Extended JWT to 20 days
- [x] Fixed sharing links (standard web URLs)
- [x] Android app name changed to "PourCircle"
- [x] Google Maps API restriction fix (set to "None")

## App Store Status
- **iOS:** Build 19+ submitted to Apple App Store
- **Android:** Submitted to Google Play (Closed Testing → Production eligible)

## Pending Items

### P1 (High Priority)
- [ ] Change Password feature (for logged-in users)
- [ ] Minimum password requirements (8+ characters)
- [ ] Light Mode CSS sync to local builds

### P2 (Medium Priority)
- [ ] Restaurant/Venue pages (claim profile, post specials, push notifications, analytics, Stripe tiers)
- [ ] Push notifications
- [ ] Custom domain

### P3 (Low Priority)
- [ ] Delete orphaned messaging files (MessagesPage.jsx, ConversationPage.jsx)

## Explicitly Removed
- Messaging feature (removed per PRD)

## 3rd Party Integrations
- Emergent Object Storage (via Emergent LLM Key)
- Google Maps JavaScript API + Places API (User API Key)
- Firebase Analytics (iOS & Android)
- Capacitor Native Plugins (Camera, Splash Screen, Status Bar)
- SendGrid (Email - User API Key)

## Key Files
- `/app/backend/server.py` - Main backend with all API endpoints
- `/app/frontend/src/components/PlaceAutocomplete.jsx` - Google Maps autocomplete
- `/app/frontend/src/pages/InvitesPage.jsx` - Invite creation/management
- `/app/frontend/src/pages/EditProfile.jsx` - Profile settings with payment links, legal, light mode
- `/app/frontend/src/pages/ForgotPasswordPage.jsx` - Password reset request
- `/app/frontend/src/pages/ResetPasswordPage.jsx` - Password reset handler
