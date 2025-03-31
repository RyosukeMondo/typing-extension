# Typing Practice Chrome Extension

A Chrome extension for practicing and improving your typing skills, built with React, TypeScript, TailwindCSS, and Vite.

## Features

- Practice typing with various text samples
- Real-time feedback with character-by-character highlighting
- Calculate typing speed (WPM) and accuracy
- Track your progress with statistics
- Clean, responsive UI
- Support for n-typing-english.com website with toggle controls for:
  - Japanese meaning visibility
  - English text visibility
  - Sound playback

## Tech Stack

- React 19
- TypeScript
- TailwindCSS
- Vite
- Chrome Extension API

## Development

### Prerequisites

- Node.js (latest LTS version recommended)
- npm or yarn

### Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

### Building the Extension

1. Build the extension:
   ```
   npm run build
   ```
2. The built extension will be in the `dist` folder

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select the `dist` folder
4. The extension should now be installed and visible in your extensions list

## Usage

1. Click on the extension icon in your Chrome toolbar
2. Click "Start Practice" to begin a typing test
3. Type the displayed text as quickly and accurately as possible
4. View your results when finished
5. Click "View Statistics" to see your progress over time

### Using with n-typing-english.com

1. Visit [n-typing-english.com](https://n-typing-english.com/)
2. The extension will automatically add toggle controls to the page
3. Use the controls to show/hide Japanese meanings, English text, or enable/disable sound

## License

MIT
