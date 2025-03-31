import React, { useState, useEffect } from 'react';
import { TypingSession } from './types';
import { SessionHistory } from './components/SessionHistory';

export const OptionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<TypingSession[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    chrome.storage.local.get(['typingSessions'], (result) => {
      if (result.typingSessions) {
        console.log('Loaded sessions:', result.typingSessions);
        // Debug each session's result data
        result.typingSessions.forEach((session: TypingSession, index: number) => {
          console.log(`Session ${index} data:`, {
            id: session.id,
            result: session.result,
            keystrokes: session.result?.totalKeystrokes,
            mistakes: session.result?.mistakes,
            score: session.result?.score,
            section: session.section
          });
        });
        setSessions(result.typingSessions);
      } else {
        console.log('No sessions found in storage');
        setSessions([]);
      }
    });
  };

  const clearAllSessions = () => {
    if (window.confirm('Are you sure you want to clear all session data? This cannot be undone.')) {
      chrome.storage.local.set({ typingSessions: [] }, () => {
        console.log('All sessions cleared');
        setSessions([]);
      });
    }
  };

  return (
    <div className="min-h-screen bg-white p-2">
      <div className="max-w-full mx-auto">
        <SessionHistory 
          sessions={sessions} 
          loadSessions={loadSessions} 
          clearAllSessions={clearAllSessions} 
        />
        <footer className="text-center text-gray-500 text-xs mt-4">
          <p>&copy; {new Date().getFullYear()} Typing Extension</p>
        </footer>
      </div>
    </div>
  );
};
