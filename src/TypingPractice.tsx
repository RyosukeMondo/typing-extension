import React, { useState, useEffect, useRef } from 'react';
import { StatsService } from './services/StatsService';
import { TypingResult } from './types';

interface TypingPracticeProps {
  onClose: () => void;
}

const sampleTexts = [
  'The quick brown fox jumps over the lazy dog.',
  'Programming is the art of telling another human what one wants the computer to do.',
  'Typing practice helps improve your speed and accuracy on the keyboard.',
  'Practice makes perfect. Keep typing to enhance your skills.'
];

const TypingPractice: React.FC<TypingPracticeProps> = ({ onClose }) => {
  const [text, setText] = useState<string>(sampleTexts[0]);
  const [input, setInput] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [resultSaved, setResultSaved] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input field when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Start timer on first keystroke
    if (input.length === 1 && startTime === null) {
      setStartTime(Date.now());
    }

    // Calculate results when text is completed
    if (input.length === text.length) {
      setEndTime(Date.now());
    }
  }, [input, text.length, startTime]);

  useEffect(() => {
    // Calculate WPM and accuracy when typing is completed
    if (startTime && endTime) {
      const timeInMinutes = (endTime - startTime) / 60000;
      const words = text.split(' ').length;
      const calculatedWpm = Math.round(words / timeInMinutes);
      
      // Calculate accuracy
      let correctChars = 0;
      for (let i = 0; i < input.length; i++) {
        if (input[i] === text[i]) {
          correctChars++;
        }
      }
      const calculatedAccuracy = Math.round((correctChars / text.length) * 100);
      
      setWpm(calculatedWpm);
      setAccuracy(calculatedAccuracy);

      // Save result to storage
      if (!resultSaved) {
        const result: TypingResult = {
          date: new Date().toISOString(),
          wpm: calculatedWpm,
          accuracy: calculatedAccuracy,
          text: text
        };
        
        StatsService.saveResult(result)
          .then(() => {
            setResultSaved(true);
          })
          .catch(error => {
            console.error('Error saving result:', error);
          });
      }
    }
  }, [endTime, startTime, text, input, resultSaved]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow input up to the length of the text
    if (e.target.value.length <= text.length) {
      setInput(e.target.value);
    }
  };

  const resetPractice = () => {
    setInput('');
    setStartTime(null);
    setEndTime(null);
    setWpm(null);
    setAccuracy(null);
    setResultSaved(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const changeText = () => {
    // Get a random text different from the current one
    let newTextIndex;
    do {
      newTextIndex = Math.floor(Math.random() * sampleTexts.length);
    } while (sampleTexts[newTextIndex] === text && sampleTexts.length > 1);
    
    setText(sampleTexts[newTextIndex]);
    resetPractice();
  };

  // Render characters with highlighting for correct/incorrect typing
  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = '';
      
      if (index < input.length) {
        className = input[index] === char ? 'text-green-500' : 'text-red-500';
      }
      
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="p-4 w-full max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Typing Practice</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          Back
        </button>
      </div>

      <div className="bg-gray-100 p-3 rounded-md mb-4 text-lg leading-relaxed">
        {renderText()}
      </div>

      <div className="mb-4">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          className="w-full p-2 border rounded-md"
          placeholder="Start typing..."
          disabled={endTime !== null}
        />
      </div>

      {endTime && (
        <div className="bg-blue-50 p-3 rounded-md mb-4">
          <h3 className="font-bold mb-2">Results</h3>
          <p>Words per minute: <span className="font-medium">{wpm}</span></p>
          <p>Accuracy: <span className="font-medium">{accuracy}%</span></p>
          <div className="mt-2 flex space-x-2">
            <button
              onClick={resetPractice}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded text-sm"
            >
              Try Again
            </button>
            <button
              onClick={changeText}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-1 px-3 rounded text-sm"
            >
              New Text
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingPractice;
