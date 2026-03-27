# SipCircle iOS App Store Submission Guide

## Prerequisites Checklist

- [ ] Apple Developer Account ($99/year) - https://developer.apple.com/programs/enroll/
- [ ] Mac with macOS Monterey or later
- [ ] Xcode 14+ installed from Mac App Store
- [ ] App icons (1024x1024 PNG, no transparency)
- [ ] Screenshots for App Store listing

---

## Step 1: Set Up Your Mac

### Install Xcode
1. Open the **Mac App Store**
2. Search for "Xcode"
3. Click **Get** / **Install** (it's a large download, ~12GB)
4. After installation, open Xcode once to accept the license agreement
5. Install Command Line Tools:
   ```bash
   xcode-select --install
   ```

### Install CocoaPods (iOS dependency manager)
```bash
sudo gem install cocoapods
```

---

## Step 2: Download the Project

You'll need to download the SipCircle project from Emergent. 

1. In Emergent, click the **Download** button to get the project code
2. Unzip the downloaded file
3. Open Terminal and navigate to the frontend folder:
   ```bash
   cd path/to/sipcircle/frontend
   ```

---

## Step 3: Install Dependencies & Build

```bash
# Install Node.js dependencies
yarn install

# Build the web app
yarn build

# Initialize Capacitor iOS platform
npx cap add ios

# Sync the build to iOS
npx cap sync ios
```

---

## Step 4: Configure App Icons

Before opening Xcode, you need app icons. Create a **1024x1024 PNG** icon (no transparency, no alpha channel).

### Option A: Use an Icon Generator
1. Create or have a designer create a 1024x1024 PNG icon
2. Go to https://www.appicon.co/
3. Upload your icon
4. Download the generated icons
5. Replace the contents of `ios/App/App/Assets.xcassets/AppIcon.appiconset/` with the generated files

### Option B: Manual Setup in Xcode
1. Open the project in Xcode (see Step 5)
2. Navigate to `App > App > Assets.xcassets > AppIcon`
3. Drag your icons into the appropriate slots

---

## Step 5: Open in Xcode

```bash
npx cap open ios
```

This opens the iOS project in Xcode.

---

## Step 6: Configure Xcode Project

### Set Bundle Identifier
1. In Xcode, click on **App** in the project navigator (left sidebar)
2. Select the **App** target
3. Go to **Signing & Capabilities** tab
4. Set **Bundle Identifier**: `com.sipcircle.app` (or your preferred ID)
5. Select your **Team** (your Apple Developer account)
6. Check **Automatically manage signing**

### Set App Version
1. Go to **General** tab
2. Set **Version**: `1.0.0`
3. Set **Build**: `1`

### Set Display Name
1. In **General** tab, set **Display Name**: `SipCircle`

### Configure iOS Deployment Target
1. Set **Minimum Deployments** iOS version to `14.0` or higher

---

## Step 7: Add Required Privacy Descriptions

Since SipCircle uses the camera for profile photos, add these to `Info.plist`:

1. In Xcode, open `App > App > Info.plist`
2. Add these keys (right-click > Add Row):

| Key | Value |
|-----|-------|
| Privacy - Camera Usage Description | SipCircle needs camera access to take profile photos |
| Privacy - Photo Library Usage Description | SipCircle needs photo library access to select profile photos |

---

## Step 8: Test on Simulator

1. In Xcode, select a simulator (e.g., "iPhone 15 Pro") from the device dropdown
2. Click the **Play** button (▶) or press `Cmd + R`
3. The app should build and launch in the simulator

---

## Step 9: Test on Real Device

1. Connect your iPhone via USB
2. On your iPhone: Go to **Settings > Privacy & Security > Developer Mode** and enable it
3. Trust your computer when prompted
4. In Xcode, select your iPhone from the device dropdown
5. Click **Play** (▶)
6. If prompted, trust the developer certificate on your iPhone:
   - Go to **Settings > General > VPN & Device Management**
   - Tap your developer certificate and tap **Trust**

---

## Step 10: Create Archive for TestFlight

1. In Xcode, select **Any iOS Device (arm64)** as the destination
2. Go to **Product > Archive**
3. Wait for the archive to complete
4. The **Organizer** window will open automatically

---

## Step 11: Upload to App Store Connect

1. In the Organizer, select your archive
2. Click **Distribute App**
3. Select **App Store Connect** > **Next**
4. Select **Upload** > **Next**
5. Keep default options > **Next**
6. Review and click **Upload**

---

## Step 12: Configure TestFlight

1. Go to https://appstoreconnect.apple.com
2. Sign in with your Apple Developer account
3. Click **My Apps** > **+** > **New App**
4. Fill in:
   - **Platform**: iOS
   - **Name**: SipCircle
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: com.sipcircle.app
   - **SKU**: sipcircle-001 (any unique identifier)
5. Click **Create**

### Add TestFlight Testers
1. In your app, go to **TestFlight** tab
2. Under **Internal Testing**, click **+** to add testers (up to 100 internal testers)
3. For external testers, create an **External Testing** group
4. External testing requires **Beta App Review** (usually 24-48 hours)

---

## Step 13: Submit for Beta Review (External Testers)

1. In **TestFlight** > **External Testing**
2. Click **+** next to a group to add a build
3. Fill in **Test Information**:
   - What to Test: "Test all features including registration, profile creation, following bartenders, and messaging"
   - Email: Your contact email
   - Privacy Policy URL: `https://craft-scene.preview.emergentagent.com/privacy`
4. Submit for Review

---

## App Store Listing Requirements (For Full Release)

When ready for public release, you'll need:

### Screenshots
- 6.7" Display (iPhone 15 Pro Max): 1290 x 2796 pixels
- 6.5" Display (iPhone 14 Plus): 1284 x 2778 pixels  
- 5.5" Display (iPhone 8 Plus): 1242 x 2208 pixels

### App Information
- **Description**: A compelling description of SipCircle
- **Keywords**: bartender, tips, bar, drinks, social, follow, nightlife
- **Support URL**: Your support website
- **Privacy Policy URL**: `https://craft-scene.preview.emergentagent.com/privacy`
- **Category**: Food & Drink or Social Networking
- **Age Rating**: 17+ (due to alcohol references)

---

## Troubleshooting

### "No signing certificate" error
- Ensure you're signed into your Apple Developer account in Xcode
- Go to **Xcode > Preferences > Accounts** and add your Apple ID

### "Untrusted Developer" on device
- Go to **Settings > General > VPN & Device Management**
- Trust your developer certificate

### Build fails with CocoaPods error
```bash
cd ios/App
pod install --repo-update
```

### White screen on launch
- Ensure `yarn build` completed successfully
- Run `npx cap sync ios` again

---

## Contact

For questions about the app code, reach out through Emergent.

For Apple Developer support: https://developer.apple.com/support/

---

**Good luck with your App Store submission! 🍸**
