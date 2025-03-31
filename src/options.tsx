/// <reference types="chrome" />
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import html2canvas from 'html2canvas';

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

// Section data for reports
interface SectionData {
  name: string;
  count: number;
  totalTime: number;
  settings: {
    japanese: number;
    map: number;
    sound: number;
    spell: number;
  };
}

// Report data interface
interface ReportData {
  studentName: string;
  date: string;
  stats: SessionStats;
  sections: SectionData[];
  securityToken: string;
}

function OptionsPage() {
  const [sessions, setSessions] = useState<TypingSession[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    avgScore: '0',
    avgTime: '0',
    avgAccuracy: '0'
  });
  const [activeTab, setActiveTab] = useState('history');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [studentName, setStudentName] = useState('Student');
  const [reportPeriod, setReportPeriod] = useState('day');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      generateEmptyReportTemplate();
    }
  }, [sessions]);

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
        setReportData(null);
        showStatusMessage('All sessions have been cleared.', 'success');
      });
    }
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

  // Show status message
  const showStatusMessage = (message: string, type: 'success' | 'error') => {
    setStatusMessage({ text: message, type });
    const statusElement = document.getElementById('report-status');
    if (statusElement) {
      statusElement.className = `status-message ${type}`;
      statusElement.style.display = 'block';
      setTimeout(() => {
        statusElement.style.display = 'none';
        setStatusMessage(null);
      }, 3000);
    }
  };

  // Generate a security token
  const generateSecurityToken = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  // Filter sessions based on selected period
  const filterSessionsByPeriod = (sessions: TypingSession[], period: string) => {
    const now = new Date();
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      const diffTime = Math.abs(now.getTime() - sessionDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (period) {
        case 'day':
          return diffDays <= 1;
        case 'week':
          return diffDays <= 7;
        case 'month':
          return diffDays <= 30;
        case 'all':
          return true;
        default:
          return true;
      }
    });
    
    return filteredSessions;
  };

  // Generate report data
  const generateSectionData = (sessions: TypingSession[]): SectionData[] => {
    const sectionMap = new Map<string, SectionData>();
    
    sessions.forEach(session => {
      if (!session.result) return;
      
      const sectionName = session.title || 'Unknown Section';
      
      if (!sectionMap.has(sectionName)) {
        sectionMap.set(sectionName, {
          name: sectionName,
          count: 0,
          totalTime: 0,
          settings: {
            japanese: 0,
            map: 0,
            sound: 0,
            spell: 0
          }
        });
      }
      
      const sectionData = sectionMap.get(sectionName)!;
      sectionData.count += 1;
      sectionData.totalTime += session.result.time;
      
      // Track settings usage
      if (session.settings.japanese) sectionData.settings.japanese += 1;
      if (session.settings.map) sectionData.settings.map += 1;
      if (session.settings.sound) sectionData.settings.sound += 1;
      if (session.settings.spell) sectionData.settings.spell += 1;
    });
    
    return Array.from(sectionMap.values());
  };

  // Generate report
  const generateReport = () => {
    setIsGenerating(true);
    
    try {
      // Filter sessions based on selected period
      const filteredSessions = filterSessionsByPeriod(
        sessions.filter(s => s.result), 
        reportPeriod
      );
      
      if (filteredSessions.length === 0) {
        showStatusMessage('No completed typing sessions found for the selected period.', 'error');
        setIsGenerating(false);
        return;
      }
      
      // Generate section data
      const sectionData = generateSectionData(filteredSessions);
      
      // Generate security token
      const securityToken = generateSecurityToken();
      
      // Save token to storage
      chrome.storage.local.set({ reportSecurityToken: securityToken });
      
      // Create report data
      const report: ReportData = {
        studentName: studentName,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        stats: {
          totalSessions: filteredSessions.length,
          avgScore: (filteredSessions.reduce((sum, s) => sum + (s.result?.score || 0), 0) / filteredSessions.length).toFixed(1),
          avgTime: (filteredSessions.reduce((sum, s) => sum + (s.result?.time || 0), 0) / filteredSessions.length).toFixed(1),
          avgAccuracy: calculateAverageAccuracy(filteredSessions)
        },
        sections: sectionData,
        securityToken: securityToken
      };
      
      setReportData(report);
      
      // Enable save button
      const saveButton = document.getElementById('save-report') as HTMLButtonElement;
      if (saveButton) {
        saveButton.disabled = false;
      }
      
      // Show success message
      showStatusMessage('Report generated successfully!', 'success');
      
      // Render the report
      setTimeout(() => {
        renderReport(report);
      }, 100);
    } catch (error) {
      console.error('Error generating report:', error);
      showStatusMessage(`Error generating report: ${error instanceof Error ? error.message : String(error)}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate average accuracy
  const calculateAverageAccuracy = (sessions: TypingSession[]): string => {
    let totalKeystrokes = 0;
    let totalMistakes = 0;
    
    sessions.forEach(session => {
      if (session.result) {
        totalKeystrokes += session.result.totalKeystrokes;
        totalMistakes += session.result.mistakes;
      }
    });
    
    if (totalKeystrokes === 0) return '0';
    
    return ((totalKeystrokes - totalMistakes) / totalKeystrokes * 100).toFixed(1);
  };

  // Render the report
  const renderReport = (report: ReportData) => {
    const reportContent = document.getElementById('report-content');
    if (!reportContent) return;
    
    // Get max time for scaling
    const maxTime = Math.max(...report.sections.map(s => s.totalTime));
    
    // Create report HTML
    reportContent.innerHTML = `
      <div className="report-header">
        <h2>${report.studentName}'s Typing Report</h2>
        <p>Generated on ${report.date}</p>
      </div>
      
      <div className="report-section">
        <h3>Overall Statistics</h3>
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-label">Total Sessions</span>
            <span className="stat-value">${report.stats.totalSessions}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Score</span>
            <span className="stat-value">${report.stats.avgScore}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Time (sec)</span>
            <span className="stat-value">${report.stats.avgTime}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Accuracy</span>
            <span className="stat-value">${report.stats.avgAccuracy}%</span>
          </div>
        </div>
      </div>
      
      <div className="report-section">
        <h3>Activity by Section</h3>
        <div className="section-chart">
          ${report.sections.map(section => {
            const widthPercent = maxTime > 0 ? (section.totalTime / maxTime * 100) : 0;
            return `
              <div className="section-bar" style="width: 0%" data-width="${widthPercent}%">
                <span className="section-bar-label">${section.name}</span>
                <span className="section-bar-value">${section.totalTime.toFixed(1)}s</span>
              </div>
              <div className="settings-indicator">
                <span className="setting-badge ${section.settings.japanese > 0 ? 'active' : ''}">Japanese</span>
                <span className="setting-badge ${section.settings.map > 0 ? 'active' : ''}">Map</span>
                <span className="setting-badge ${section.settings.sound > 0 ? 'active' : ''}">Sound</span>
                <span className="setting-badge ${section.settings.spell > 0 ? 'active' : ''}">Spell</span>
                <span>Count: ${section.count}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      <div className="report-footer">
        <p>This report was generated by the Typing Extension for Chrome.</p>
        <p>Security Token: ${report.securityToken.substring(0, 8)}...</p>
      </div>
    `;
    
    // Animate bars
    setTimeout(() => {
      const bars = document.querySelectorAll('.section-bar');
      bars.forEach(bar => {
        const width = (bar as HTMLElement).dataset.width || '0%';
        (bar as HTMLElement).style.width = width;
      });
    }, 100);
  };

  // Save report as PNG
  async function saveReportAsPNG() {
    if (!reportContentRef.current || !reportData) {
      showStatusMessage('No report content to save', 'error');
      return;
    }

    try {
      // Use the locally installed html2canvas library
      const canvas = await html2canvas(reportContentRef.current);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          showStatusMessage('Failed to create image', 'error');
          return;
        }
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `typing-report-${new Date().toISOString().split('T')[0]}.png`;
        link.href = url;
        link.click();
        
        // Clean up
        URL.revokeObjectURL(url);
        showStatusMessage('Report saved as PNG', 'success');
      });
    } catch (error: unknown) {
      console.error('Error saving report as PNG:', error);
      showStatusMessage(`Error saving report as PNG: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  }

  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions]
    .filter(session => session.result) // Only show completed sessions
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  // Generate an empty report template with placeholder data
  const generateEmptyReportTemplate = () => {
    const placeholderData: ReportData = {
      studentName: studentName,
      date: new Date().toLocaleDateString(),
      stats: {
        totalSessions: 0,
        avgScore: '0',
        avgTime: '0',
        avgAccuracy: '0'
      },
      sections: [
        { name: "Section 1", count: 0, totalTime: 0, settings: { japanese: 0, map: 0, sound: 0, spell: 0 } },
        { name: "Section 2", count: 0, totalTime: 0, settings: { japanese: 0, map: 0, sound: 0, spell: 0 } },
        { name: "Section 3", count: 0, totalTime: 0, settings: { japanese: 0, map: 0, sound: 0, spell: 0 } }
      ],
      securityToken: generateSecurityToken()
    };
    
    setReportData(placeholderData);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
          <h1 className="text-3xl font-bold text-white">Typing Extension - Options</h1>
        </div>
        
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                activeTab === 'history'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('history')}
            >
              Session History
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                activeTab === 'report'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('report')}
            >
              Report
            </button>
          </nav>
        </div>
        
        {activeTab === 'history' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Typing Session History</h2>
              <div className="flex gap-3">
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  onClick={loadSessions}
                >
                  Refresh Data
                </button>
                <button 
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  onClick={clearAllSessions}
                >
                  Clear All Sessions
                </button>
              </div>
            </div>
            
            <div className="stats-container">
              <div className="stat-item">
                <span className="stat-label">Total Sessions</span>
                <span className="stat-value">{stats.totalSessions}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Average Score</span>
                <span className="stat-value">{stats.avgScore}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Average Time (sec)</span>
                <span className="stat-value">{stats.avgTime}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Average Accuracy</span>
                <span className="stat-value">{stats.avgAccuracy}%</span>
              </div>
            </div>
            
            <div className="session-history">
              {sortedSessions.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="bg-gray-50 text-left p-3 font-medium text-gray-600 border-b border-gray-200">Date</th>
                      <th className="bg-gray-50 text-left p-3 font-medium text-gray-600 border-b border-gray-200">Time</th>
                      <th className="bg-gray-50 text-left p-3 font-medium text-gray-600 border-b border-gray-200">Score</th>
                      <th className="bg-gray-50 text-left p-3 font-medium text-gray-600 border-b border-gray-200">Duration</th>
                      <th className="bg-gray-50 text-left p-3 font-medium text-gray-600 border-b border-gray-200">Keystrokes</th>
                      <th className="bg-gray-50 text-left p-3 font-medium text-gray-600 border-b border-gray-200">Mistakes</th>
                      <th className="bg-gray-50 text-left p-3 font-medium text-gray-600 border-b border-gray-200">Accuracy</th>
                      <th className="bg-gray-50 text-left p-3 font-medium text-gray-600 border-b border-gray-200">Settings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSessions.map((session, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-3 border-b border-gray-200">{new Date(session.startTime).toLocaleDateString()}</td>
                        <td className="p-3 border-b border-gray-200">{new Date(session.startTime).toLocaleTimeString()}</td>
                        <td className="p-3 border-b border-gray-200">{session.result?.score}</td>
                        <td className="p-3 border-b border-gray-200">{session.result?.time.toFixed(1)}s</td>
                        <td className="p-3 border-b border-gray-200">{session.result?.totalKeystrokes}</td>
                        <td className="p-3 border-b border-gray-200">{session.result?.mistakes}</td>
                        <td className="p-3 border-b border-gray-200">{calculateAccuracy(session)}</td>
                        <td className="p-3 border-b border-gray-200">
                          <div className="flex gap-1 flex-wrap">
                            {session.settings.japanese && (
                              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Japanese</span>
                            )}
                            {session.settings.map && (
                              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Map</span>
                            )}
                            {session.settings.sound && (
                              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Sound</span>
                            )}
                            {session.settings.spell && (
                              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Spell</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="p-4 text-center text-gray-500">No typing sessions recorded yet. Start typing on n-typing-english.com to record your progress!</p>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'report' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Typing Activity Report</h2>
              <div className="flex gap-3">
                <button 
                  id="generate-report"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  onClick={generateReport}
                  disabled={isGenerating || sessions.filter(s => s.result).length === 0}
                >
                  {isGenerating ? 'Generating...' : 'Generate Report'}
                </button>
                <button 
                  id="save-report"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  onClick={saveReportAsPNG}
                  disabled={!reportData}
                >
                  Save as PNG
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Name:</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter student's name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Period:</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        reportPeriod === 'day'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setReportPeriod('day')}
                    >
                      Last 24 Hours
                    </button>
                    <button
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        reportPeriod === 'week'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setReportPeriod('week')}
                    >
                      Last 7 Days
                    </button>
                    <button
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        reportPeriod === 'month'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setReportPeriod('month')}
                    >
                      Last 30 Days
                    </button>
                    <button
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        reportPeriod === 'all'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setReportPeriod('all')}
                    >
                      All Time
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div ref={reportContentRef} className="report-content">
                {reportData ? (
                  <div className="p-6 bg-white rounded-lg shadow">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-800">Typing Activity Report</h2>
                      <p className="text-gray-600">
                        {reportData.studentName} - {reportPeriod} - Generated on {reportData.date}
                      </p>
                    </div>
                    
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Overall Statistics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Total Sessions</div>
                          <div className="text-2xl font-bold">{reportData.stats.totalSessions || '—'}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Average Score</div>
                          <div className="text-2xl font-bold">{reportData.stats.avgScore || '—'}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Average Time</div>
                          <div className="text-2xl font-bold">{reportData.stats.avgTime || '—'}s</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Average Accuracy</div>
                          <div className="text-2xl font-bold">{reportData.stats.avgAccuracy || '—'}%</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Activity by Section</h3>
                      <div className="space-y-4">
                        {reportData.sections.length > 0 ? (
                          reportData.sections.map((section, index) => (
                            <div key={index}>
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">{section.name}</span>
                                <span className="text-gray-600">{section.count} sessions, {section.totalTime.toFixed(1)}s total</span>
                              </div>
                              <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                                <div 
                                  className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out flex items-center pl-2 text-white text-sm font-medium"
                                  style={{ width: `${(section.totalTime / Math.max(...reportData.sections.map(s => s.totalTime), 1)) * 100}%` }}
                                >
                                  {section.totalTime > 0 ? `${section.totalTime.toFixed(1)}s` : ''}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 py-4">No section data available</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Settings Used</h3>
                      <div className="flex flex-wrap gap-3">
                        <div className={`px-3 py-2 rounded-full ${reportData.sections.reduce((sum, s) => sum + s.settings.japanese, 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          Japanese: {reportData.sections.reduce((sum, s) => sum + s.settings.japanese, 0)} sessions
                        </div>
                        <div className={`px-3 py-2 rounded-full ${reportData.sections.reduce((sum, s) => sum + s.settings.map, 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          Map: {reportData.sections.reduce((sum, s) => sum + s.settings.map, 0)} sessions
                        </div>
                        <div className={`px-3 py-2 rounded-full ${reportData.sections.reduce((sum, s) => sum + s.settings.sound, 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          Sound: {reportData.sections.reduce((sum, s) => sum + s.settings.sound, 0)} sessions
                        </div>
                        <div className={`px-3 py-2 rounded-full ${reportData.sections.reduce((sum, s) => sum + s.settings.spell, 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          Spell: {reportData.sections.reduce((sum, s) => sum + s.settings.spell, 0)} sessions
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center text-xs text-gray-400 mt-6">
                      <p>Report generated by Typing Extension • Security Token: {reportData.securityToken.substring(0, 8)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-white rounded-lg shadow">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-800">Typing Activity Report</h2>
                      <p className="text-gray-600">
                        {studentName} - {reportPeriod} - Preview
                      </p>
                    </div>
                    
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Overall Statistics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Total Sessions</div>
                          <div className="text-2xl font-bold">—</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Average Score</div>
                          <div className="text-2xl font-bold">—</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Average Time</div>
                          <div className="text-2xl font-bold">—</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Average Accuracy</div>
                          <div className="text-2xl font-bold">—</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Activity by Section</h3>
                      <div className="space-y-4">
                        {[1, 2, 3].map((index) => (
                          <div key={index}>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">Section {index}</span>
                              <span className="text-gray-600">0 sessions, 0s total</span>
                            </div>
                            <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                              <div 
                                className="bg-gray-300 h-full rounded-full transition-all duration-500 ease-out flex items-center pl-2 text-white text-sm font-medium"
                                style={{ width: `${index * 10}%` }}
                              >
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Settings Used</h3>
                      <div className="flex flex-wrap gap-3">
                        <div className="px-3 py-2 rounded-full bg-gray-100 text-gray-600">
                          Japanese: 0 sessions
                        </div>
                        <div className="px-3 py-2 rounded-full bg-gray-100 text-gray-600">
                          Map: 0 sessions
                        </div>
                        <div className="px-3 py-2 rounded-full bg-gray-100 text-gray-600">
                          Sound: 0 sessions
                        </div>
                        <div className="px-3 py-2 rounded-full bg-gray-100 text-gray-600">
                          Spell: 0 sessions
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center text-xs text-gray-400 mt-6">
                      <p>Click "Generate Report" to create a real report with your data</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {statusMessage && (
              <div className={`mt-4 p-3 rounded-md ${
                statusMessage.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {statusMessage.text}
              </div>
            )}
            
            <div id="report-status" className="status-message"></div>
          </div>
        )}
      </div>
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
