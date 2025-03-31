import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

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

function OptionsPage() {
  const [sessions, setSessions] = useState<TypingSession[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    avgScore: '0',
    avgTime: '0',
    avgAccuracy: '0'
  });

  useEffect(() => {
    loadSessions();
  }, []);

  // Load sessions from storage
  const loadSessions = () => {
    chrome.storage.local.get({ typingSessions: [] }, (data) => {
      const sessions: TypingSession[] = data.typingSessions || [];
      setSessions(sessions);
      updateStats(sessions);
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
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Clear All Sessions
          </button>
        </div>
      </div>
      
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
