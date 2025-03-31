/// <reference types="chrome" />
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import EmailJS from 'emailjs-com';

// Chrome types are declared globally, no need to import

// Define interfaces for typing session data
interface TypingSessionSettings {
  sound: boolean;
  spell: boolean;
  japanese: boolean;
  map: boolean;
}

interface TypingSessionResult {
  score: number;
  time: number;
  totalKeystrokes: number;
  mistakes: number;
  keystrokes: number;
}

interface TypingSession {
  id: string;
  startTime: string;
  endTime?: string;
  settings: TypingSessionSettings;
  result?: TypingSessionResult;
  url: string;
  title: string;
}

// Stats interface
interface SessionStats {
  totalSessions: number;
  avgScore: string;
  avgTime: string;
  avgAccuracy: string;
}

// Email settings interface
interface EmailSettings {
  emailFrom: string;
  emailTo: string;
  emailjsPublicKey: string;
  emailjsServiceId: string;
  emailjsTemplateId: string;
}

function OptionsPage() {
  const [sessions, setSessions] = useState<TypingSession[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    avgScore: '0',
    avgTime: '0',
    avgAccuracy: '0'
  });
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    emailFrom: '',
    emailTo: '',
    emailjsPublicKey: '',
    emailjsServiceId: '',
    emailjsTemplateId: ''
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    loadSessions();
    loadEmailSettings();
  }, []);

  // Load sessions from storage
  const loadSessions = () => {
    chrome.storage.local.get({ typingSessions: [] }, (data) => {
      const sessions: TypingSession[] = data.typingSessions || [];
      setSessions(sessions);
      updateStats(sessions);
    });
  };

  // Load email settings from storage
  const loadEmailSettings = () => {
    chrome.storage.sync.get({
      emailSettings: {
        emailFrom: '',
        emailTo: '',
        emailjsPublicKey: '',
        emailjsServiceId: '',
        emailjsTemplateId: ''
      }
    }, (data) => {
      setEmailSettings(data.emailSettings);
    });
  };

  // Save email settings to storage
  const saveEmailSettings = () => {
    chrome.storage.sync.set({
      emailSettings: emailSettings
    }, () => {
      setStatusMessage('Email settings saved successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
    });
  };

  // Update statistics
  const updateStats = (sessions: TypingSession[]) => {
    // Filter out sessions without results
    const completedSessions = sessions.filter(session => session.result);
    
    // Calculate stats
    const totalSessions = completedSessions.length;
    
    let totalScore = 0;
    let totalTime = 0;
    let totalKeystrokes = 0;
    let totalMistakes = 0;
    
    completedSessions.forEach(session => {
      if (session.result) {
        totalScore += session.result.score;
        totalTime += session.result.time;
        totalKeystrokes += session.result.totalKeystrokes;
        totalMistakes += session.result.mistakes;
      }
    });
    
    const avgScore = totalSessions > 0 ? (totalScore / totalSessions).toFixed(1) : '0';
    const avgTime = totalSessions > 0 ? (totalTime / totalSessions).toFixed(1) : '0';
    const avgAccuracy = totalKeystrokes > 0 
      ? ((totalKeystrokes - totalMistakes) / totalKeystrokes * 100).toFixed(1) 
      : '0';
    
    setStats({
      totalSessions,
      avgScore,
      avgTime,
      avgAccuracy
    });
  };

  // Clear all sessions
  const clearAllSessions = () => {
    if (window.confirm('Are you sure you want to delete all typing session history? This cannot be undone.')) {
      chrome.storage.local.set({ typingSessions: [] }, () => {
        loadSessions(); // Reload the empty list
        alert('All sessions have been cleared.');
      });
    }
  };

  // Generate HTML for settings badges
  const getSettingsBadges = (settings: TypingSessionSettings) => {
    return (
      <div className="badges-container">
        {settings.japanese && <span className="badge badge-success">Japanese</span>}
        {settings.map && <span className="badge badge-success">Map</span>}
        {settings.sound && <span className="badge badge-success">Sound</span>}
        {settings.spell && <span className="badge badge-success">Spell</span>}
      </div>
    );
  };

  // Calculate accuracy for a session
  const calculateAccuracy = (session: TypingSession) => {
    if (!session.result || session.result.totalKeystrokes === 0) return '0%';
    
    const accuracy = (
      (session.result.totalKeystrokes - session.result.mistakes) / 
      session.result.totalKeystrokes * 100
    ).toFixed(1);
    
    return `${accuracy}%`;
  };

  // Handle input change for email settings
  const handleEmailSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Send email with typing session summary
  const sendSessionSummaryEmail = async () => {
    // Validate email settings (Fail Fast principle)
    if (!emailSettings.emailFrom || !emailSettings.emailTo) {
      setStatusMessage('Please fill in both From and To email addresses');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }

    // Validate EmailJS credentials
    if (!emailSettings.emailjsPublicKey || !emailSettings.emailjsServiceId || !emailSettings.emailjsTemplateId) {
      setStatusMessage('Please fill in all EmailJS credentials (Public Key, Service ID, and Template ID)');
      setTimeout(() => setStatusMessage(''), 5000);
      return;
    }

    // Validate sessions data
    if (sessions.filter(s => s.result).length === 0) {
      setStatusMessage('No completed typing sessions to send');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }

    setIsSending(true);
    setStatusMessage('Preparing to send email...');

    try {
      // Format the current date
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Create email body with session data
      const emailBody = createEmailBody(sessions, stats);
      
      // Initialize EmailJS
      console.log('Initializing EmailJS with public key:', emailSettings.emailjsPublicKey.substring(0, 4) + '...');
      EmailJS.init(emailSettings.emailjsPublicKey);
      
      // Prepare email parameters for EmailJS
      const templateParams = {
        to_email: emailSettings.emailTo,
        from_name: 'Typing Extension',
        from_email: emailSettings.emailFrom,
        subject: 'Typing Practice Summary',
        message_html: emailBody,
        total_sessions: stats.totalSessions.toString(),
        avg_score: stats.avgScore,
        avg_time: stats.avgTime,
        avg_accuracy: stats.avgAccuracy,
        session_details: createSessionDetailsHTML(sessions),
        date: formattedDate
      };
      
      console.log('Sending email with EmailJS', { 
        service_id: emailSettings.emailjsServiceId,
        template_id: emailSettings.emailjsTemplateId,
        to: emailSettings.emailTo,
        from: emailSettings.emailFrom,
        bodyLength: emailBody.length
      });
      
      // Send the email
      const response = await EmailJS.send(
        emailSettings.emailjsServiceId,
        emailSettings.emailjsTemplateId,
        templateParams
      );
      
      console.log('Email sent successfully', response);
      setStatusMessage('Email sent successfully! Clearing sessions...');
      
      // Clear sessions after successful email
      chrome.storage.local.set({ typingSessions: [] }, () => {
        loadSessions(); // Reload the empty list
        setStatusMessage('Email sent and sessions cleared!');
        setTimeout(() => setStatusMessage(''), 3000);
      });
    } catch (error) {
      console.error('Error sending email:', error);
      setStatusMessage(`Error sending email: ${error instanceof Error ? error.message : String(error)}`);
      setTimeout(() => setStatusMessage(''), 5000);
    } finally {
      setIsSending(false);
    }
  };

  // Create email body from session data
  const createEmailBody = (sessions: TypingSession[], stats: SessionStats): string => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Format session details as HTML table
    let sessionDetailsHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Date</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Score</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Time (s)</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Keystrokes</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Mistakes</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Accuracy</th>
          </tr>
        </thead>
        <tbody>
    `;

    // Add each session with result to the table
    const completedSessions = sessions.filter(s => s.result);
    completedSessions.forEach((session, index) => {
      const rowStyle = index % 2 === 0 ? '' : 'background-color: #f9f9f9;';
      const sessionDate = new Date(session.startTime);
      const formattedSessionDate = sessionDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Since we filtered for sessions with result, we can safely assert it's not undefined
      const result = session.result!;
      
      const accuracy = result.keystrokes > 0 
        ? Math.round(((result.keystrokes - result.mistakes) / result.keystrokes) * 100) 
        : 0;
      
      sessionDetailsHtml += `
        <tr style="${rowStyle}">
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formattedSessionDate}</td>
          <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${result.score}</td>
          <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${result.time}</td>
          <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${result.keystrokes}</td>
          <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${result.mistakes}</td>
          <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${accuracy}%</td>
        </tr>
      `;
    });

    sessionDetailsHtml += `
        </tbody>
      </table>
    `;

    // Create template parameters
    const templateParams = {
      total_sessions: stats.totalSessions.toString(),
      avg_score: stats.avgScore,
      avg_time: stats.avgTime,
      avg_accuracy: stats.avgAccuracy,
      session_details: sessionDetailsHtml,
      date: formattedDate
    };

    // Replace template variables
    let emailBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h1 style="color: #2c3e50; margin-top: 0; text-align: center;">Typing Practice Summary</h1>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #3498db; border-bottom: 1px solid #eee; padding-bottom: 10px;">Overall Statistics</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Total Sessions:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${stats.totalSessions}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Average Score:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${stats.avgScore}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Average Time:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${stats.avgTime} seconds</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Average Accuracy:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${stats.avgAccuracy}%</td>
            </tr>
          </table>
        </div>

        <div>
          <h2 style="color: #3498db; border-bottom: 1px solid #eee; padding-bottom: 10px;">Session Details</h2>
          ${sessionDetailsHtml}
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777; text-align: center;">
          <p>This email was sent from the Typing Extension Chrome extension.</p>
          <p>Date: ${formattedDate}</p>
        </div>
      </div>
    `;

    return emailBody;
  };

  // Create session details HTML
  const createSessionDetailsHTML = (sessions: TypingSession[]): string => {
    const completedSessions = sessions.filter(s => s.result);
    let sessionDetailsHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Date</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Score</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Time (s)</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Keystrokes</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Mistakes</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Accuracy</th>
          </tr>
        </thead>
        <tbody>
    `;

    completedSessions.forEach((session, index) => {
      const rowStyle = index % 2 === 0 ? '' : 'background-color: #f9f9f9;';
      const sessionDate = new Date(session.startTime);
      const formattedSessionDate = sessionDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Since we filtered for sessions with result, we can safely assert it's not undefined
      const result = session.result!;
      
      const accuracy = result.keystrokes > 0 
        ? Math.round(((result.keystrokes - result.mistakes) / result.keystrokes) * 100) 
        : 0;
      
      sessionDetailsHtml += `
        <tr style="${rowStyle}">
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formattedSessionDate}</td>
          <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${result.score}</td>
          <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${result.time}</td>
          <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${result.keystrokes}</td>
          <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${result.mistakes}</td>
          <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">${accuracy}%</td>
        </tr>
      `;
    });

    sessionDetailsHtml += `
        </tbody>
      </table>
    `;

    return sessionDetailsHtml;
  };

  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions]
    .filter(session => session.result) // Only show completed sessions
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-4 pb-2 border-b">Typing Extension - Session History</h1>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={loadSessions}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
          >
            Refresh Data
          </button>
          <button 
            onClick={clearAllSessions}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mr-2"
          >
            Clear All Sessions
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            {showSettings ? 'Hide Email Settings' : 'Show Email Settings'}
          </button>
        </div>
        <div>
          <button 
            onClick={sendSessionSummaryEmail}
            disabled={isSending || sessions.filter(s => s.result).length === 0}
            className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ${
              (isSending || sessions.filter(s => s.result).length === 0) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSending ? 'Sending...' : 'Send Email Summary'}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-3 mb-4 rounded ${statusMessage.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {statusMessage}
        </div>
      )}
      
      {showSettings && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Email Settings</h2>
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded">
            <p className="mb-2"><strong>EmailJS Setup Instructions:</strong></p>
            <ol className="list-decimal pl-5 mb-2">
              <li>Create a free account at <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">EmailJS.com</a></li>
              <li>Create an Email Service (Gmail, Outlook, etc.)</li>
              <li>Create an Email Template with the variables shown below</li>
              <li>Copy the HTML from <code>emailJS_template/template.html</code> in this project</li>
              <li>Enter your EmailJS credentials below</li>
            </ol>
            <p className="mt-2 text-sm">Template variables: <code>from_name, from_email, to_email, subject, message_html, total_sessions, avg_score, avg_time, avg_accuracy, session_details, date</code></p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">From Email</label>
              <input 
                type="email" 
                name="emailFrom" 
                value={emailSettings.emailFrom} 
                onChange={handleEmailSettingChange}
                placeholder="your.email@gmail.com"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">To Email</label>
              <input 
                type="email" 
                name="emailTo" 
                value={emailSettings.emailTo} 
                onChange={handleEmailSettingChange}
                placeholder="parent.email@gmail.com"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">EmailJS Public Key</label>
              <input 
                type="text" 
                name="emailjsPublicKey" 
                value={emailSettings.emailjsPublicKey} 
                onChange={handleEmailSettingChange}
                placeholder="your_emailjs_public_key"
                className="w-full p-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">Find this in your EmailJS Dashboard under Account → API Keys</p>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">EmailJS Service ID</label>
              <input 
                type="text" 
                name="emailjsServiceId" 
                value={emailSettings.emailjsServiceId} 
                onChange={handleEmailSettingChange}
                placeholder="your_emailjs_service_id"
                className="w-full p-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">Find this in your EmailJS Dashboard under Email Services</p>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">EmailJS Template ID</label>
              <input 
                type="text" 
                name="emailjsTemplateId" 
                value={emailSettings.emailjsTemplateId} 
                onChange={handleEmailSettingChange}
                placeholder="your_emailjs_template_id"
                className="w-full p-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">Find this in your EmailJS Dashboard under Email Templates</p>
            </div>
          </div>
          <div className="mt-4">
            <button 
              onClick={saveEmailSettings}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save Email Settings
            </button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-500 text-sm">Total Sessions</div>
          <div className="text-2xl font-bold text-blue-500">{stats.totalSessions}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-500 text-sm">Average Score</div>
          <div className="text-2xl font-bold text-blue-500">{stats.avgScore}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-500 text-sm">Average Time (sec)</div>
          <div className="text-2xl font-bold text-blue-500">{stats.avgTime}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-500 text-sm">Average Accuracy</div>
          <div className="text-2xl font-bold text-blue-500">{stats.avgAccuracy}%</div>
        </div>
      </div>
      
      {sortedSessions.length > 0 ? (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Score</th>
                <th className="px-4 py-2 text-left">Duration</th>
                <th className="px-4 py-2 text-left">Keystrokes</th>
                <th className="px-4 py-2 text-left">Mistakes</th>
                <th className="px-4 py-2 text-left">Accuracy</th>
                <th className="px-4 py-2 text-left">Settings</th>
              </tr>
            </thead>
            <tbody>
              {sortedSessions.map((session) => {
                const date = new Date(session.startTime);
                return (
                  <tr key={session.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">{date.toLocaleDateString()}</td>
                    <td className="px-4 py-2">{date.toLocaleTimeString()}</td>
                    <td className="px-4 py-2">{session.result?.score}</td>
                    <td className="px-4 py-2">{session.result?.time.toFixed(1)}s</td>
                    <td className="px-4 py-2">{session.result?.totalKeystrokes}</td>
                    <td className="px-4 py-2">{session.result?.mistakes}</td>
                    <td className="px-4 py-2">{calculateAccuracy(session)}</td>
                    <td className="px-4 py-2">{getSettingsBadges(session.settings)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded shadow">
          <p className="text-gray-500">
            No typing sessions recorded yet. Start typing on n-typing-english.com to record your progress!
          </p>
        </div>
      )}
    </div>
  );
}

// Render the options page
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <OptionsPage />
  </React.StrictMode>
);
