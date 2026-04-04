# PourCircle - Product Requirements Document

## Overview
PourCircle (formerly SipCircle/PourPal) is a social networking app connecting bartenders and bar-goers (customers). The app is mobile-first, wrapped with Capacitor for iOS and Android deployment.

## Original Problem Statement
Create a social app connecting bartenders and bar-goers with:
- Profiles for both Bartenders and Customers
- Bartender features: Profile picture, multiple work locations/schedules, payment links for tips (Venmo, CashApp, PayPal), follower blocking, happy hour times & signature drinks, QR code profile sharing
- Customer features: Profile picture, QR code profile sharing, invite feature to meet for drinks (with Google Maps autocomplete)
- Universal follow system with "Approval Required" privacy toggle
- "People You May Know" suggestions algorithm
- **NO messaging** (removed to reduce moderation liability for App Store approval)
- Legal drinking age disclaimer, Terms of Use, and Privacy Policy

## Current Status

### App Store Submissions
- **Apple App Store**: Submitted, awaiting review
- **Google Play Store**: Closed testing review in progress (13 testers uploaded)

### Deployment URLs
- **Web App**: https://craft-scene.preview.emergentagent.com
- **Privacy Policy**: https://craft-scene.preview.emergentagent.com/privacy
- **Terms of Use**: https://craft-scene.preview.emergentagent.com/terms
- **Delete Account**: https://craft-scene.preview.emergentagent.com/delete-account
- **Safety Standards**: https://craft-scene.preview.emergentagent.com/safety

## Completed Features

### Core Features (Done)
- [x] User authentication (register/login)
- [x] Bartender profiles with work locations, schedules, happy hours, signature drinks
- [x] Customer (bar-goer) profiles
- [x] Universal follow system (anyone can follow anyone)
- [x] "Require Follow Approval" privacy toggle
- [x] Follow requests management (approve/reject)
- [x] "People You May Know" suggestions algorithm
- [x] QR code profile sharing (both user types)
- [x] Tip links (Venmo, CashApp, PayPal)
- [x] Invite feature with Google Maps autocomplete
- [x] Profile image upload (Emergent Object Storage)

### Safety & Compliance (Done)
- [x] Block users feature (ALL users can block, not just bartenders)
- [x] Report users feature with reason selection
- [x] Terms of Use page
- [x] Privacy Policy page
- [x] Safety Standards page (CSAE policy)
- [x] Delete Account page with instructions
- [x] 21+ age disclaimer on landing page

### Mobile Apps (Done)
- [x] iOS build via Capacitor + Xcode
- [x] Android build via Capacitor + Android Studio
- [x] Smart App Banner for web users

## Pending / In Progress

### Waiting on External (Blocked)
- [ ] Apple App Store review approval
- [ ] Google Play closed testing review approval
- [ ] 12 testers opt-in + 14 days closed testing period

### Before Production Launch (P0 - CRITICAL)
- [ ] **Firebase Analytics Integration** - REMINDER: User wants this BEFORE going live
  - DAU/MAU metrics
  - User retention (Day 1, Day 7, Day 30)
  - Event tracking (signups, follows, invites, etc.)
  - Required for investor valuations
- [ ] User's other planned changes (TBD)
- [ ] Replace default Capacitor app icon with PourCircle logo
- [ ] Update Smart App Banner with real App Store/Play Store URLs

### Future Enhancements (P1)
- [ ] Security audit (before funding rounds)
- [ ] Push notifications
- [ ] Custom domain purchase
- [ ] Update support URLs in app stores

### Cleanup Tasks (P2)
- [ ] Delete orphaned messaging files:
  - /app/frontend/src/pages/MessagesPage.jsx
  - /app/frontend/src/pages/ConversationPage.jsx

## Technical Architecture

### Stack
- **Frontend**: React, TailwindCSS, Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Mobile**: Capacitor (iOS + Android)
- **Image Storage**: Emergent Object Storage

### Key Files
```
/app/
├── backend/
│   ├── server.py          # Main API server
│   └── .env               # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main app with routing
│   │   ├── pages/         # All page components
│   │   └── components/    # Reusable components
│   ├── capacitor.config.ts
│   ├── android/           # Android native project
│   └── .env               # Frontend environment variables
└── memory/
    ├── PRD.md             # This file
    └── test_credentials.md
```

### Key API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/suggestions` - People you may know
- `POST /api/follow/{user_id}` - Follow a user
- `POST /api/follow/approve/{user_id}` - Approve follow request
- `POST /api/block/{user_id}` - Block a user
- `POST /api/report/{user_id}` - Report a user
- `GET /api/user/{username}` - Get user profile

## Test Credentials

### App Store Review Accounts
- **Apple**: `applereview` / `AppleReview2026!`
- **Google**: `googlereview` / `GoogleReview2026!`

## 3rd Party Integrations
- **Emergent Object Storage** - Profile image uploads (uses Emergent LLM Key)
- **Google Maps JavaScript & Places API** - Location autocomplete for invites

## Notes
- **NO MESSAGING**: Intentionally removed to avoid App Store moderation liability
- **21+ ONLY**: App requires legal drinking age
- **App was rebranded**: PourPal → SipCircle → PourCircle
- **GitHub repo**: Still named "sipcircle"

## Next Session Checklist
When user returns after app approvals:
1. [ ] Check Apple App Store review status
2. [ ] Check Google Play closed testing status
3. [ ] Integrate Firebase Analytics
4. [ ] Discuss user's other planned changes
5. [ ] Rebuild apps with analytics + changes
6. [ ] Generate proper app icons
7. [ ] Submit to Production on both platforms

---
*Last updated: April 2026*
