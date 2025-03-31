// Typing Extension Content Script
const EXTENSION_VERSION = '1.0.0';

console.log(`Typing Extension v${EXTENSION_VERSION} loaded!`);

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

// Global session tracking
let currentSession: TypingSession | null = null;
let isTypingInProgress = false;

// Wait for the page to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeExtension();
});

// Initialize if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initializeExtension();
}

function initializeExtension(): void {
  // Check if we're on the typing page
  if (window.location.href.includes('n-typing-english.com') && 
      document.querySelector('.p-typingscreen')) {
    console.log('Typing page detected, initializing extension features...');
    
    // Create toggle controls
    createToggleControls();
    
    // Initialize visibility states from storage
    loadVisibilitySettings();

    // Set up session tracking
    setupSessionTracking();
  }
}

function createToggleControls(): void {
  // Create container for toggle buttons
  const controlsContainer = document.createElement('div');
  controlsContainer.id = 'typing-extension-controls';
  controlsContainer.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background-color: rgba(255, 255, 255, 0.9);
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  `;

  // Add title
  const title = document.createElement('div');
  title.textContent = 'Typing Extension';
  title.style.cssText = 'font-weight: bold; margin-bottom: 5px; text-align: center;';
  controlsContainer.appendChild(title);

  // Create toggle buttons
  const toggles = [
    { id: 'toggle-japanese', text: 'Japanese Meaning', storageKey: 'showJapanese', defaultValue: true },
    { id: 'toggle-map', text: 'Map Images', storageKey: 'showMap', defaultValue: true }
  ];

  toggles.forEach(toggle => {
    const toggleWrapper = document.createElement('div');
    toggleWrapper.style.cssText = 'display: flex; align-items: center; justify-content: space-between;';
    
    const label = document.createElement('label');
    label.htmlFor = toggle.id;
    label.textContent = toggle.text;
    label.style.marginRight = '10px';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = toggle.id;
    checkbox.checked = toggle.defaultValue;
    
    checkbox.addEventListener('change', () => {
      saveVisibilitySetting(toggle.storageKey, checkbox.checked);
      applyVisibilitySettings();
    });
    
    toggleWrapper.appendChild(label);
    toggleWrapper.appendChild(checkbox);
    controlsContainer.appendChild(toggleWrapper);
  });

  // Add session status indicator
  const sessionStatus = document.createElement('div');
  sessionStatus.id = 'typing-extension-session-status';
  sessionStatus.textContent = 'Session: Not started';
  sessionStatus.style.cssText = 'font-size: 11px; margin-top: 5px; text-align: center; color: #666;';
  controlsContainer.appendChild(sessionStatus);

  // Add note about existing site controls
  const noteElement = document.createElement('div');
  noteElement.textContent = 'Note: Use site controls for English text and sound';
  noteElement.style.cssText = 'font-size: 10px; color: #666; margin-top: 5px; text-align: center;';
  controlsContainer.appendChild(noteElement);

  // Add version info
  const versionInfo = document.createElement('div');
  versionInfo.textContent = `v${EXTENSION_VERSION}`;
  versionInfo.style.cssText = 'font-size: 10px; text-align: right; margin-top: 5px; color: #888;';
  controlsContainer.appendChild(versionInfo);

  // Add to page
  document.body.appendChild(controlsContainer);
}

// Define the structure of our visibility settings
interface StorageItems {
  [key: string]: any;
}

function loadVisibilitySettings(): void {
  const defaultSettings = {
    showJapanese: true,
    showMap: true
  };

  try {
    chrome.storage.sync.get(
      defaultSettings,
      (items: StorageItems) => {
        try {
          if (chrome.runtime.lastError) {
            console.error('Error loading visibility settings:', chrome.runtime.lastError);
            // Use default settings if there's an error
            applyVisibilitySettings();
            return;
          }

          // Update checkbox states
          const japaneseToggle = document.getElementById('toggle-japanese') as HTMLInputElement | null;
          const mapToggle = document.getElementById('toggle-map') as HTMLInputElement | null;
          
          if (japaneseToggle) {
            japaneseToggle.checked = !!items.showJapanese;
          }
          
          if (mapToggle) {
            mapToggle.checked = !!items.showMap;
          }
          
          // Apply settings
          applyVisibilitySettings();
        } catch (error) {
          console.error('Error processing visibility settings:', error);
          // Apply default settings on error
          applyVisibilitySettings();
        }
      }
    );
  } catch (error) {
    console.error('Error accessing chrome storage for visibility settings:', error);
    // Apply default settings on error
    applyVisibilitySettings();
  }
}

function saveVisibilitySetting(key: string, value: boolean): void {
  try {
    const setting: Record<string, boolean> = {};
    setting[key] = value;
    chrome.storage.sync.set(setting, () => {
      if (chrome.runtime.lastError) {
        console.error(`Error saving ${key} setting:`, chrome.runtime.lastError);
      }
    });
  } catch (error) {
    console.error(`Error saving ${key} setting:`, error);
  }
}

function applyVisibilitySettings(): void {
  // Get current settings from checkboxes
  const japaneseToggle = document.getElementById('toggle-japanese') as HTMLInputElement | null;
  const mapToggle = document.getElementById('toggle-map') as HTMLInputElement | null;
  
  const showJapanese = japaneseToggle?.checked ?? true;
  const showMap = mapToggle?.checked ?? true;

  // Apply Japanese visibility setting
  const japaneseElement = document.getElementById('p-mana') as HTMLElement | null;
  if (japaneseElement) {
    japaneseElement.style.display = showJapanese ? '' : 'none';
    console.log('Applied Japanese visibility setting:', { showJapanese });
  } else {
    console.log('Japanese element not found (p-mana)');
  }
  
  // Apply map visibility setting
  const mapElement = document.getElementById('map') as HTMLElement | null;
  if (mapElement) {
    mapElement.style.display = showMap ? '' : 'none';
    console.log('Applied map visibility setting:', { showMap });
  } else {
    console.log('Map element not found (map)');
  }
}

// Session tracking functions
function setupSessionTracking(): void {
  // Listen for the start button click
  const startButton = document.getElementById('p-typingscreen__start');
  if (startButton) {
    // Use MutationObserver to detect when the button text changes to "スペースではじめる"
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && 
            startButton.textContent?.includes('スペース') && 
            !isTypingInProgress) {
          console.log('Start button changed to space mode, ready to begin typing');
          // Listen for spacebar press to start the session
          document.addEventListener('keydown', handleSpacebarStart);
        }
      });
    });
    
    observer.observe(startButton, { childList: true });
    
    // Also attach click handler to detect initial click
    startButton.addEventListener('click', handleStartButtonClick);
  }
  
  // Listen for result display
  observeForResults();
}

function handleStartButtonClick(): void {
  console.log('Start button clicked, preparing session');
  // We'll wait for the spacebar event to actually start the session
}

function handleSpacebarStart(event: KeyboardEvent): void {
  if (event.code === 'Space' && !isTypingInProgress) {
    // Remove the event listener to prevent multiple triggers
    document.removeEventListener('keydown', handleSpacebarStart);
    
    // Start the session
    startTypingSession();
  }
}

function startTypingSession(): void {
  isTypingInProgress = true;
  
  // Get current settings
  const soundElement = document.getElementById('p-typingscreen__startscreen__sound') as HTMLInputElement | null;
  const spellElement = document.getElementById('p-typingscreen__startscreen__roman') as HTMLInputElement | null;
  const japaneseToggle = document.getElementById('toggle-japanese') as HTMLInputElement | null;
  const mapToggle = document.getElementById('toggle-map') as HTMLInputElement | null;
  
  const soundEnabled = soundElement?.checked ?? false;
  const spellEnabled = spellElement?.checked ?? false;
  const japaneseEnabled = japaneseToggle?.checked ?? true;
  const mapEnabled = mapToggle?.checked ?? true;
  
  // Create a new session
  currentSession = {
    id: generateSessionId(),
    startTime: new Date().toISOString(),
    settings: {
      sound: soundEnabled,
      spell: spellEnabled,
      japanese: japaneseEnabled,
      map: mapEnabled
    },
    url: window.location.href,
    title: document.title
  };
  
  console.log('Typing session started:', currentSession);
  
  // Update UI
  updateSessionStatusUI('Session: In progress');
  
  // Disable toggle controls during typing
  disableToggleControls();
}

function observeForResults(): void {
  // Watch for the result card to appear with populated data
  const resultObserver = new MutationObserver(() => {
    // Check if the result card is visible and has data
    const resultCard = document.querySelector('.p-typingresult__card');
    const scoreElement = document.getElementById('p-typingresult--score');
    const closeButton = document.getElementById('typing_store_close');
    
    // Only proceed if all elements are present and the score has a value
    if (resultCard && scoreElement && closeButton && 
        scoreElement.textContent && 
        scoreElement.textContent.trim() !== '' && 
        isTypingInProgress && 
        currentSession) {
      
      console.log('Result card detected with data, score:', scoreElement.textContent);
      
      // Remove any existing event listener to prevent duplicates
      closeButton.removeEventListener('click', handleResultSave);
      
      // Add event listener to the close button
      closeButton.addEventListener('click', handleResultSave);
      
      // Also add event listener for spacebar press which can also close the result
      document.removeEventListener('keydown', handleSpacebarSave); // Remove first to prevent duplicates
      document.addEventListener('keydown', handleSpacebarSave);
      
      // Disconnect the observer once we've set up the listeners
      resultObserver.disconnect();
    }
  });
  
  // Observe the entire document for changes, focusing on content and attributes
  resultObserver.observe(document.body, { 
    childList: true, 
    subtree: true,
    characterData: true,
    attributes: true 
  });
}

function handleSpacebarSave(event: KeyboardEvent): void {
  if (event.code === 'Space' && isTypingInProgress && currentSession) {
    // Remove the event listener to prevent multiple triggers
    document.removeEventListener('keydown', handleSpacebarSave);
    handleResultSave();
  }
}

function handleResultSave(): void {
  console.log('Handling result save');
  
  // Get result elements immediately to ensure we capture the current values
  const scoreElement = document.getElementById('p-typingresult--score');
  const timeElement = document.getElementById('p-typingresult--time');
  const totalElement = document.getElementById('p-typingresult--all');
  const missElement = document.getElementById('p-typingresult--miss');
  
  console.log('Result elements:', {
    scoreElement: scoreElement?.textContent,
    timeElement: timeElement?.textContent,
    totalElement: totalElement?.textContent,
    missElement: missElement?.textContent
  });
  
  if (!scoreElement || !timeElement || !totalElement || !missElement) {
    console.log('Result elements not found, cannot save results');
    return;
  }
  
  if (!currentSession || !isTypingInProgress) {
    console.log('Cannot save results: No active session or typing not in progress');
    return;
  }
  
  // Parse results
  const score = parseInt(scoreElement.textContent || '0', 10);
  const time = parseFloat(timeElement.textContent || '0');
  const totalKeystrokes = parseInt(totalElement.textContent || '0', 10);
  const mistakes = parseInt(missElement.textContent || '0', 10);
  
  console.log('Parsed results:', { score, time, totalKeystrokes, mistakes });
  
  // Update current session
  currentSession.endTime = new Date().toISOString();
  currentSession.result = {
    score,
    time,
    totalKeystrokes,
    mistakes
  };
  
  // Save to localStorage
  saveSessionToStorage(currentSession);
  
  console.log('Typing session completed and saved:', currentSession);
  
  // Update UI
  updateSessionStatusUI('Session: Completed');
  
  // Reset session state
  isTypingInProgress = false;
  
  // Re-enable toggle controls
  enableToggleControls();
}

function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function saveSessionToStorage(session: TypingSession): void {
  try {
    // Get existing sessions
    chrome.storage.local.get({ typingSessions: [] }, (data) => {
      try {
        const sessions = data.typingSessions || [];
        sessions.push(session);
        
        // Save updated sessions
        chrome.storage.local.set({ typingSessions: sessions }, () => {
          if (chrome.runtime.lastError) {
            console.error('Error saving session:', chrome.runtime.lastError);
            return;
          }
          console.log('Session saved to storage');
        });
      } catch (error) {
        console.error('Error processing storage data:', error);
      }
    });
  } catch (error) {
    console.error('Error accessing chrome storage:', error);
    // If we can't save to Chrome storage, try to save to sessionStorage as a fallback
    try {
      const sessions = JSON.parse(sessionStorage.getItem('typingSessions') || '[]');
      sessions.push(session);
      sessionStorage.setItem('typingSessions', JSON.stringify(sessions));
      console.log('Session saved to sessionStorage as fallback');
    } catch (sessionError) {
      console.error('Failed to save to sessionStorage:', sessionError);
    }
  }
}

function updateSessionStatusUI(status: string): void {
  const statusElement = document.getElementById('typing-extension-session-status');
  if (statusElement) {
    statusElement.textContent = status;
    
    // Change color based on status
    if (status.includes('In progress')) {
      statusElement.style.color = '#007bff';
    } else if (status.includes('Completed')) {
      statusElement.style.color = '#28a745';
    } else {
      statusElement.style.color = '#666';
    }
  }
}

function disableToggleControls(): void {
  const toggles = document.querySelectorAll('#typing-extension-controls input[type="checkbox"]');
  toggles.forEach((toggle) => {
    if (toggle instanceof HTMLInputElement) {
      toggle.disabled = true;
    }
  });
}

function enableToggleControls(): void {
  const toggles = document.querySelectorAll('#typing-extension-controls input[type="checkbox"]');
  toggles.forEach((toggle) => {
    if (toggle instanceof HTMLInputElement) {
      toggle.disabled = false;
    }
  });
}
