import React from 'react';
import { Stats } from '../types';

interface StatisticsRowProps {
  stats: Stats;
}

export const StatisticsRow: React.FC<StatisticsRowProps> = ({ stats }) => {
  return (
    <div className="flex flex-row justify-between mb-8 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-md flex-1 flex flex-col items-center justify-center">
        <div className="text-gray-600 text-sm font-medium mb-1">Total Sessions</div>
        <div className="text-3xl font-bold text-gray-800">{stats.totalSessions}</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md flex-1 flex flex-col items-center justify-center">
        <div className="text-gray-600 text-sm font-medium mb-1">Average Score</div>
        <div className="text-3xl font-bold text-blue-600">{stats.avgScore}</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md flex-1 flex flex-col items-center justify-center">
        <div className="text-gray-600 text-sm font-medium mb-1">Average Time (sec)</div>
        <div className="text-3xl font-bold text-gray-800">{stats.avgTime}</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md flex-1 flex flex-col items-center justify-center">
        <div className="text-gray-600 text-sm font-medium mb-1">Average Accuracy</div>
        <div className="text-3xl font-bold text-green-600">{stats.avgAccuracy}%</div>
      </div>
    </div>
  );
};
