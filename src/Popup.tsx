import React, { useState } from 'react';
import TypingPractice from './TypingPractice';
import Stats from './Stats';

const Popup: React.FC = () => {
  const [view, setView] = useState<'home' | 'practice' | 'stats'>('home');

  const startPractice = () => {
    setView('practice');
  };

  const showStats = () => {
    setView('stats');
  };

  const goToHome = () => {
    setView('home');
  };

  return (
    <div className="p-4 w-80">
      {view === 'home' && (
        <>
          <h1 className="text-lg font-bold mb-4">Typing Practice Extension</h1>
          <div className="mb-4">
            <p className="text-sm mb-2">Practice your typing skills with this Chrome extension.</p>
            <div className="flex flex-col space-y-2">
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={startPractice}
              >
                Start Practice
              </button>
              <button 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
                onClick={showStats}
              >
                View Statistics
              </button>
            </div>
          </div>
          <div className="border-t pt-2">
            <p className="text-xs text-gray-500">Version 1.0.0</p>
          </div>
        </>
      )}
      
      {view === 'practice' && (
        <TypingPractice onClose={goToHome} />
      )}
      
      {view === 'stats' && (
        <Stats onClose={goToHome} />
      )}
    </div>
  );
};

export default Popup;
