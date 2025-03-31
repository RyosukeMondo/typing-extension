import React, { useEffect, useState } from 'react';
import { TypingSession, Stats } from '../types';
import { CheckIcon, XIcon } from './Icons';

interface SessionHistoryProps {
  sessions: TypingSession[];
  loadSessions: () => void;
  clearAllSessions: () => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  sessions,
  loadSessions,
  clearAllSessions,
}) => {
  const [stats, setStats] = useState<Stats>({
    totalSessions: 0,
    avgScore: '0',
    avgTime: '0',
    avgAccuracy: '0%',
  });

  useEffect(() => {
    calculateStats();
  }, [sessions]);

  const calculateStats = () => {
    if (sessions.length === 0) {
      setStats({
        totalSessions: 0,
        avgScore: 'N/A',
        avgTime: 'N/A',
        avgAccuracy: 'N/A',
      });
      return;
    }

    let totalScore = 0;
    let totalTime = 0;
    let totalAccuracy = 0;
    let validSessions = 0;

    sessions.forEach((session) => {
      if (session.result) {
        totalScore += session.result.score;
        totalTime += session.result.time;

        // Calculate accuracy
        if (session.result.totalKeystrokes > 0) {
          const accuracy = ((session.result.totalKeystrokes - session.result.mistakes) / session.result.totalKeystrokes) * 100;
          if (!isNaN(accuracy)) {
            totalAccuracy += accuracy;
            validSessions++;
          }
        }
      }
    });

    setStats({
      totalSessions: sessions.length,
      avgScore: (totalScore / sessions.length).toFixed(1),
      avgTime: (totalTime / sessions.length).toFixed(1),
      avgAccuracy: validSessions > 0 ? `${(totalAccuracy / validSessions).toFixed(1)}%` : 'N/A',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const hasJapanese = (session: TypingSession) => session.settings.japanese;
  const hasMap = (session: TypingSession) => session.settings.map;
  const hasSound = (session: TypingSession) => session.settings.sound;
  const hasSpell = (session: TypingSession) => session.settings.spell;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Typing Session History</h2>
        <div className="flex gap-4">
          <button 
            className="btn btn-blue flex items-center gap-2 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all"
            onClick={loadSessions}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh Data
          </button>
          <button 
            className="btn btn-red flex items-center gap-2 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all"
            onClick={clearAllSessions}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Clear All Sessions
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm">
          <div className="text-sm text-blue-600 mb-1">Total Sessions</div>
          <div className="text-3xl font-bold text-gray-800">{stats.totalSessions}</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm">
          <div className="text-sm text-green-600 mb-1">Average Score</div>
          <div className="text-3xl font-bold text-gray-800">{stats.avgScore}</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm">
          <div className="text-sm text-purple-600 mb-1">Average Time (sec)</div>
          <div className="text-3xl font-bold text-gray-800">{stats.avgTime}</div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl shadow-sm">
          <div className="text-sm text-amber-600 mb-1">Average Accuracy</div>
          <div className="text-3xl font-bold text-gray-800">{stats.avgAccuracy}</div>
        </div>
      </div>

      {sessions.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">開始</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">終了</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">経過</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">総打鍵数</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ミス</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">正確性</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">スコア</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">セクション</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日本語</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">画像</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">英語</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">音声</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((session, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(session.startTime)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTime(session.startTime)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTime(session.endTime)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.result?.time.toFixed(1)}s</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.result?.totalKeystrokes}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.result?.mistakes}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.result?.totalKeystrokes && session.result.mistakes !== undefined
                        ? `${(((session.result.totalKeystrokes - session.result.mistakes) / session.result.totalKeystrokes) * 100).toFixed(1)}%`
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.result?.score}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.section || session.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {hasJapanese(session) ? <CheckIcon className="h-5 w-5 text-green-500 mx-auto" /> : <XIcon className="h-5 w-5 text-red-500 mx-auto" />}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {hasMap(session) ? <CheckIcon className="h-5 w-5 text-green-500 mx-auto" /> : <XIcon className="h-5 w-5 text-red-500 mx-auto" />}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {hasSpell(session) ? <CheckIcon className="h-5 w-5 text-green-500 mx-auto" /> : <XIcon className="h-5 w-5 text-red-500 mx-auto" />}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {hasSound(session) ? <CheckIcon className="h-5 w-5 text-green-500 mx-auto" /> : <XIcon className="h-5 w-5 text-red-500 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
          <p className="text-gray-500">Complete some typing exercises to see your history here.</p>
        </div>
      )}
    </div>
  );
};
