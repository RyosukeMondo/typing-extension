export interface TypingResult {
  date: string;
  wpm: number;
  accuracy: number;
  text: string;
}

export interface TypingStats {
  results: TypingResult[];
  averageWpm: number;
  averageAccuracy: number;
  bestWpm: number;
  bestAccuracy: number;
  totalPractices: number;
}
