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
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Typing Session History</h2>
        <div className="flex gap-2">
          <button 
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded border border-blue-600 shadow hover:bg-blue-600 focus:outline-none"
            onClick={loadSessions}
          >
            Refresh Data
          </button>
          <button 
            className="px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded border border-gray-300 shadow hover:bg-gray-200 focus:outline-none"
            onClick={clearAllSessions}
          >
            Clear All Sessions
          </button>
        </div>
      </div>

      <div className="flex flex-row gap-4 mb-6">
        <div className="flex-1 border rounded p-3">
          <div className="text-sm text-gray-600 mb-1">Total Sessions</div>
          <div className="text-2xl font-bold">{stats.totalSessions}</div>
        </div>
        
        <div className="flex-1 border rounded p-3">
          <div className="text-sm text-gray-600 mb-1">Average Score</div>
          <div className="text-2xl font-bold">{stats.avgScore}</div>
        </div>
        
        <div className="flex-1 border rounded p-3">
          <div className="text-sm text-gray-600 mb-1">Average Time (sec)</div>
          <div className="text-2xl font-bold">{stats.avgTime}</div>
        </div>
        
        <div className="flex-1 border rounded p-3">
          <div className="text-sm text-gray-600 mb-1">Average Accuracy</div>
          <div className="text-2xl font-bold">{stats.avgAccuracy}</div>
        </div>
      </div>

      {sessions.length > 0 ? (
        <div className="border rounded overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">日付</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">開始</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">終了</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">経過</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">総打鍵数</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ミス</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">正確性</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">スコア</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">セクション</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">日本語</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">画像</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">英語</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">音声</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sessions.map((session, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(session.startTime)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{formatTime(session.startTime)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{formatTime(session.endTime)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{session.result?.time.toFixed(1)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{session.result?.totalKeystrokes}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{session.result?.mistakes}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {session.result?.totalKeystrokes && session.result.mistakes !== undefined
                      ? `${(((session.result.totalKeystrokes - session.result.mistakes) / session.result.totalKeystrokes) * 100).toFixed(1)}%`
                      : 'N/A'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{session.result?.score}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{session.section || session.title}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    {hasJapanese(session) ? <CheckIcon className="h-4 w-4 text-green-500 mx-auto" /> : <XIcon className="h-4 w-4 text-red-500 mx-auto" />}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    {hasMap(session) ? <CheckIcon className="h-4 w-4 text-green-500 mx-auto" /> : <XIcon className="h-4 w-4 text-red-500 mx-auto" />}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    {hasSpell(session) ? <CheckIcon className="h-4 w-4 text-green-500 mx-auto" /> : <XIcon className="h-4 w-4 text-red-500 mx-auto" />}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    {hasSound(session) ? <CheckIcon className="h-4 w-4 text-green-500 mx-auto" /> : <XIcon className="h-4 w-4 text-red-500 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border rounded p-4 text-center">
          <p className="text-gray-500">No typing sessions found.</p>
        </div>
      )}
    </div>
  );
};
