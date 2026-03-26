# PourPal App Icon Requirements

## Required Icon
You need ONE master icon file:
- **Size**: 1024 x 1024 pixels
- **Format**: PNG
- **No transparency** (no alpha channel)
- **No rounded corners** (iOS adds these automatically)

## Suggested Design
Based on PourPal's branding:
- **Background**: Dark (#050505 or #0A0A0A)
- **Icon**: Cocktail glass or wine glass in gold (#C68E17)
- **Style**: Simple, recognizable silhouette

## Free Icon Generator Tools
Once you have your 1024x1024 icon:
1. https://www.appicon.co/ - Generates all required iOS sizes
2. https://makeappicon.com/ - Alternative generator

## Icon Sizes Generated (iOS)
The generator will create these sizes automatically:
- 20x20 (1x, 2x, 3x)
- 29x29 (1x, 2x, 3x)
- 40x40 (1x, 2x, 3x)
- 60x60 (2x, 3x)
- 76x76 (1x, 2x)
- 83.5x83.5 (2x)
- 1024x1024 (App Store)

## Installation
1. Generate icons using one of the tools above
2. Open the iOS project in Xcode: `npx cap open ios`
3. Navigate to: App > App > Assets.xcassets > AppIcon
4. Drag and drop the generated icons into appropriate slots
   OR replace the contents of `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

## App Store Icon
The 1024x1024 icon is also used for the App Store listing.
Make sure it looks good at small sizes too!
