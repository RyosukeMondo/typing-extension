/// <reference types="chrome" />
// Background script for handling email functionality
import EmailJS from 'emailjs-com';

// Define interfaces for email functionality
interface EmailSettings {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  emailFrom: string;
  emailTo: string;
}

interface EmailMessage {
  action: string;
  emailSettings: EmailSettings;
  subject: string;
  body: string;
}

interface EmailResponse {
  success: boolean;
  error?: string;
}

// Initialize EmailJS with a public key
// Note: We're using EmailJS as it's a service that can send emails from client-side JavaScript
// without needing to set up a server
// 
// IMPORTANT: To use this functionality, you need to:
// 1. Create a free account at https://www.emailjs.com/
// 2. Create an Email Service (Gmail, Outlook, etc.)
// 3. Create an Email Template with the following template variables:
//    - to_email: The recipient's email address
//    - from_name: The sender's name
//    - from_email: The sender's email address
//    - subject: The email subject
//    - message_html: The HTML content of the email
// 4. Get your Public Key, Service ID, and Template ID from the EmailJS dashboard
// 5. Replace the placeholder values below with your actual values
const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY'; // Replace with your actual EmailJS public key
const EMAILJS_SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID'; // Replace with your actual EmailJS service ID
const EMAILJS_TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID'; // Replace with your actual EmailJS template ID

// Log when background script is loaded
console.log('Typing Extension: Background script loaded', new Date().toISOString());

// Listen for messages from the options page
chrome.runtime.onMessage.addListener((message: EmailMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: EmailResponse) => void) => {
  console.log('Typing Extension: Message received in background script', { 
    action: message.action, 
    from: sender.url || 'unknown',
    timestamp: new Date().toISOString()
  });
  
  if (message.action === 'sendEmail') {
    console.log('Typing Extension: Processing sendEmail request');
    // Handle the email sending asynchronously
    sendEmailWithEmailJS(message, sendResponse);
    return true; // Indicates we will send a response asynchronously
  }
  
  console.log('Typing Extension: Unknown action requested', message.action);
  sendResponse({ success: false, error: `Unknown action: ${message.action}` });
  return false;
});

// Send email using EmailJS
async function sendEmailWithEmailJS(message: EmailMessage, sendResponse: (response: EmailResponse) => void) {
  console.log('Typing Extension: Starting email send process');
  
  try {
    // Check if EmailJS configuration is set up
    if (EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY' || 
        EMAILJS_SERVICE_ID === 'YOUR_EMAILJS_SERVICE_ID' || 
        EMAILJS_TEMPLATE_ID === 'YOUR_EMAILJS_TEMPLATE_ID') {
      console.error('Typing Extension: EmailJS not configured properly');
      sendResponse({ 
        success: false, 
        error: 'EmailJS is not configured. Please update the background.ts file with your EmailJS credentials.' 
      });
      return;
    }

    const { emailSettings, subject, body } = message;
    console.log('Typing Extension: Email settings received', { 
      host: emailSettings.smtpHost,
      port: emailSettings.smtpPort,
      from: emailSettings.emailFrom,
      to: emailSettings.emailTo,
      subject: subject,
      bodyLength: body.length
    });
    
    // Prepare email parameters for EmailJS
    const templateParams = {
      to_email: emailSettings.emailTo,
      from_name: 'Typing Extension',
      from_email: emailSettings.emailFrom,
      subject: subject,
      message_html: body
    };

    console.log('Typing Extension: Initializing EmailJS');
    // Initialize EmailJS
    EmailJS.init(EMAILJS_PUBLIC_KEY);
    
    console.log('Typing Extension: Sending email via EmailJS');
    // Send the email
    const response = await EmailJS.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );
    
    console.log('Typing Extension: Email sent successfully', response);
    sendResponse({ success: true });
  } catch (error) {
    console.error('Typing Extension: Error sending email', error);
    sendResponse({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error sending email' 
    });
  }
}
