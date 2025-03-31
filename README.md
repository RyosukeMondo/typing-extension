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
- Email functionality to send typing session summaries to parents

## Tech Stack

- React 19
- TypeScript
- TailwindCSS
- Vite
- Chrome Extension API
- EmailJS for email functionality

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

### EmailJS Setup

This extension uses EmailJS to send email summaries of typing sessions. Users will need to:

1. Create a free account at [EmailJS.com](https://www.emailjs.com/)
2. Create an Email Service (Gmail, Outlook, etc.)
3. Create an Email Template using the HTML template provided in `emailJS_template/template.html`
4. Configure the template with the following variables:
   - `from_name`: The sender's name
   - `from_email`: The sender's email address
   - `to_email`: The recipient's email address
   - `subject`: The email subject
   - `message_html`: The HTML content of the email
   - `total_sessions`: Total number of typing sessions
   - `avg_score`: Average score across all sessions
   - `avg_time`: Average time spent on typing sessions
   - `avg_accuracy`: Average accuracy percentage
   - `session_details`: HTML table of session details
   - `date`: Formatted date and time
5. Enter their EmailJS credentials (Public Key, Service ID, and Template ID) in the extension's options page

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
6. Use the Options page to configure email settings and send typing summaries

### Using with n-typing-english.com

1. Visit [n-typing-english.com](https://n-typing-english.com/)
2. The extension will automatically add toggle controls to the page
3. Use the controls to show/hide Japanese meanings, English text, or enable/disable sound

## Security Notes

- Never commit your EmailJS credentials to version control
- The extension's options page will securely store your EmailJS credentials

## License

MIT
