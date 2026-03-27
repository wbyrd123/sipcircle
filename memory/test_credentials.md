# Test Credentials

## Test Accounts
These are dynamically created during testing. Use password `Test123!` for all test accounts.

### Creating Test Accounts
Register via `/auth` page or use the API:
```bash
curl -X POST https://craft-scene.preview.emergentagent.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test123!","name":"Test User","role":"customer"}'
```

### Role Options
- `bartender` - Bartender account with payment links, work locations
- `customer` - Bar-goer account

### API Keys
- Google Maps API Key: Configured in `/app/frontend/.env` as `REACT_APP_GOOGLE_MAPS_API_KEY`
- Emergent LLM Key: Configured in `/app/backend/.env` as `EMERGENT_LLM_KEY` (for image upload)
