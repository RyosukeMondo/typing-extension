import { TypingResult, TypingStats } from '../types';

const STORAGE_KEY = 'typing_extension_stats';

export const StatsService = {
  saveResult: (result: TypingResult): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (data) => {
        const existingResults: TypingResult[] = data[STORAGE_KEY]?.results || [];
        const newResults = [...existingResults, result];
        
        chrome.storage.local.set({
          [STORAGE_KEY]: {
            results: newResults,
            averageWpm: calculateAverageWpm(newResults),
            averageAccuracy: calculateAverageAccuracy(newResults),
            bestWpm: calculateBestWpm(newResults),
            bestAccuracy: calculateBestAccuracy(newResults),
            totalPractices: newResults.length
          }
        }, () => {
          resolve();
        });
      });
    });
  },

  getStats: (): Promise<TypingStats> => {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (data) => {
        const stats = data[STORAGE_KEY] as TypingStats;
        if (stats) {
          resolve(stats);
        } else {
          // Return default empty stats
          resolve({
            results: [],
            averageWpm: 0,
            averageAccuracy: 0,
            bestWpm: 0,
            bestAccuracy: 0,
            totalPractices: 0
          });
        }
      });
    });
  },

  clearStats: (): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.remove([STORAGE_KEY], () => {
        resolve();
      });
    });
  }
};

// Helper functions
function calculateAverageWpm(results: TypingResult[]): number {
  if (results.length === 0) return 0;
  const sum = results.reduce((acc, result) => acc + result.wpm, 0);
  return Math.round(sum / results.length);
}

function calculateAverageAccuracy(results: TypingResult[]): number {
  if (results.length === 0) return 0;
  const sum = results.reduce((acc, result) => acc + result.accuracy, 0);
  return Math.round(sum / results.length);
}

function calculateBestWpm(results: TypingResult[]): number {
  if (results.length === 0) return 0;
  return Math.max(...results.map(result => result.wpm));
}

function calculateBestAccuracy(results: TypingResult[]): number {
  if (results.length === 0) return 0;
  return Math.max(...results.map(result => result.accuracy));
}
