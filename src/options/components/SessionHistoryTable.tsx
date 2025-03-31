import React from 'react';
import { TypingSession } from '../types';

interface SessionHistoryTableProps {
  sessions: TypingSession[];
}

export const SessionHistoryTable: React.FC<SessionHistoryTableProps> = ({ sessions }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const calculateDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return '';
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const durationSeconds = (end - start) / 1000;
    return `${durationSeconds.toFixed(1)}s`;
  };

  const calculateAccuracy = (keystrokes: number, mistakes: number) => {
    if (keystrokes === 0) return '0.0%';
    const accuracy = ((keystrokes - mistakes) / keystrokes) * 100;
    return `${isNaN(accuracy) ? '0.0' : accuracy.toFixed(1)}%`;
  };

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">開始</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">終了</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">経過</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">総打鍵数</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ミス</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">正確性</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">スコア</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">セクション</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日本語</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">画像</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">英語</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">音声</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sessions.slice().reverse().map((session) => (
            <tr key={session.id} className="hover:bg-gray-50">
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{formatDate(session.startTime)}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{formatTime(session.startTime)}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{session.endTime ? formatTime(session.endTime) : '-'}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{calculateDuration(session.startTime, session.endTime)}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{session.result?.totalKeystrokes || '-'}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{session.result?.mistakes || '-'}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                {session.result ? calculateAccuracy(session.result.totalKeystrokes || 0, session.result.mistakes || 0) : '-'}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{session.result?.score || '-'}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{session.section || '-'}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{session.settings.japanese ? '✓' : '✗'}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{session.settings.map ? '✓' : '✗'}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{session.settings.spell ? '✓' : '✗'}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{session.settings.sound ? '✓' : '✗'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
