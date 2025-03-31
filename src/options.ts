// Typing Extension Options Page

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

// DOM Elements
const totalSessionsElement = document.getElementById('total-sessions') as HTMLElement;
const avgScoreElement = document.getElementById('avg-score') as HTMLElement;
const avgTimeElement = document.getElementById('avg-time') as HTMLElement;
const avgAccuracyElement = document.getElementById('avg-accuracy') as HTMLElement;
const sessionsTableBody = document.getElementById('sessions-tbody') as HTMLElement;
const emptyStateElement = document.getElementById('empty-state') as HTMLElement;
const refreshButton = document.getElementById('refresh-btn') as HTMLElement;
const clearButton = document.getElementById('clear-btn') as HTMLElement;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  loadSessions();
  
  // Add event listeners
  refreshButton?.addEventListener('click', loadSessions);
  clearButton?.addEventListener('click', clearAllSessions);
});

// Load sessions from storage
function loadSessions(): void {
  chrome.storage.local.get({ typingSessions: [] }, (data) => {
    const sessions: TypingSession[] = data.typingSessions || [];
    renderSessions(sessions);
    updateStats(sessions);
  });
}

// Render sessions in the table
function renderSessions(sessions: TypingSession[]): void {
  // Clear existing rows
  if (sessionsTableBody) {
    sessionsTableBody.innerHTML = '';
  }
  
  // Show/hide empty state
  if (emptyStateElement) {
    emptyStateElement.style.display = sessions.length === 0 ? 'block' : 'none';
  }
  
  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => {
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
  });
  
  // Add rows for each session
  sortedSessions.forEach((session) => {
    if (!session.result) return; // Skip sessions without results
    
    const row = document.createElement('tr');
    
    // Calculate accuracy
    const accuracy = session.result.totalKeystrokes > 0 
      ? ((session.result.totalKeystrokes - session.result.mistakes) / session.result.totalKeystrokes * 100).toFixed(1) 
      : '0';
    
    // Format date
    const date = new Date(session.startTime);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();
    
    // Create row content
    row.innerHTML = `
      <td class="date-cell">${formattedDate}</td>
      <td>${formattedTime}</td>
      <td>${session.result.score}</td>
      <td>${session.result.time.toFixed(1)}s</td>
      <td>${session.result.totalKeystrokes}</td>
      <td>${session.result.mistakes}</td>
      <td>${accuracy}%</td>
      <td>
        ${getSettingsBadges(session.settings)}
      </td>
    `;
    
    sessionsTableBody?.appendChild(row);
  });
}

// Generate HTML for settings badges
function getSettingsBadges(settings: TypingSessionSettings): string {
  const badges = [];
  
  if (settings.japanese) {
    badges.push('<span class="badge badge-success">Japanese</span>');
  }
  
  if (settings.map) {
    badges.push('<span class="badge badge-success">Map</span>');
  }
  
  if (settings.sound) {
    badges.push('<span class="badge badge-success">Sound</span>');
  }
  
  if (settings.spell) {
    badges.push('<span class="badge badge-success">Spell</span>');
  }
  
  return badges.join(' ');
}

// Update statistics
function updateStats(sessions: TypingSession[]): void {
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
  
  // Update UI
  if (totalSessionsElement) totalSessionsElement.textContent = totalSessions.toString();
  if (avgScoreElement) avgScoreElement.textContent = avgScore;
  if (avgTimeElement) avgTimeElement.textContent = avgTime;
  if (avgAccuracyElement) avgAccuracyElement.textContent = `${avgAccuracy}%`;
}

// Clear all sessions
function clearAllSessions(): void {
  if (confirm('Are you sure you want to delete all typing session history? This cannot be undone.')) {
    chrome.storage.local.set({ typingSessions: [] }, () => {
      loadSessions(); // Reload the empty list
      alert('All sessions have been cleared.');
    });
  }
}
