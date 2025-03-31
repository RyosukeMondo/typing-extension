// Common types used across options components

export interface TypingSessionSettings {
  japanese: boolean;
  map: boolean;
  sound: boolean;
  spell: boolean;
}

export interface TypingSessionResult {
  score: number;
  time: number;
  totalKeystrokes: number;
  mistakes: number;
}

export interface TypingSession {
  id: string;
  startTime: string;
  endTime?: string;
  settings: TypingSessionSettings;
  result?: TypingSessionResult;
  url: string;
  title: string;
  section?: string;
}

export interface Stats {
  totalSessions: number;
  avgScore: string;
  avgTime: string;
  avgAccuracy: string;
}
