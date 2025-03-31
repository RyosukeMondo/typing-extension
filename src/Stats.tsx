import React, { useEffect, useState } from 'react';
import { TypingStats } from './types';
import { StatsService } from './services/StatsService';

interface StatsProps {
  onClose: () => void;
}

const Stats: React.FC<StatsProps> = ({ onClose }) => {
  const [stats, setStats] = useState<TypingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await StatsService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const handleClearStats = async () => {
    if (window.confirm('Are you sure you want to clear all your typing statistics?')) {
      try {
        await StatsService.clearStats();
        setStats({
          results: [],
          averageWpm: 0,
          averageAccuracy: 0,
          bestWpm: 0,
          bestAccuracy: 0,
          totalPractices: 0
        });
      } catch (error) {
        console.error('Error clearing stats:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4 w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Your Statistics</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            Back
          </button>
        </div>
        <div className="flex justify-center items-center h-40">
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Your Statistics</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          Back
        </button>
      </div>

      {stats && stats.totalPractices > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Average WPM</h3>
              <p className="text-xl font-bold">{stats.averageWpm}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Average Accuracy</h3>
              <p className="text-xl font-bold">{stats.averageAccuracy}%</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Best WPM</h3>
              <p className="text-xl font-bold">{stats.bestWpm}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Best Accuracy</h3>
              <p className="text-xl font-bold">{stats.bestAccuracy}%</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Recent Results</h3>
            <div className="max-h-40 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-right">WPM</th>
                    <th className="p-2 text-right">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.results.slice().reverse().map((result, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{new Date(result.date).toLocaleDateString()}</td>
                      <td className="p-2 text-right">{result.wpm}</td>
                      <td className="p-2 text-right">{result.accuracy}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleClearStats}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Clear All Statistics
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="mb-2">You haven't completed any typing practices yet.</p>
          <p className="text-sm text-gray-500">Complete a practice to see your statistics here.</p>
        </div>
      )}
    </div>
  );
};

export default Stats;
