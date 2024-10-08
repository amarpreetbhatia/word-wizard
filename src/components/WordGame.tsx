import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Volume2, RefreshCw, Star } from 'lucide-react';

interface WordList {
  id: string;
  name: string;
  words: string[];
  played: boolean;
  wordsLearned: number;
}

const WordGame: React.FC = () => {
  const { listName } = useParams<{ listName: string }>();
  const location = useLocation();
  const listId = location.state?.listId;
  const [wordList, setWordList] = useState<WordList | null>(null);
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [userGuess, setUserGuess] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [hintUsed, setHintUsed] = useState(false);
  const [achievement, setAchievement] = useState('');

  useEffect(() => {
    const savedLists = localStorage.getItem('wordLists');
    if (savedLists) {
      const lists: WordList[] = JSON.parse(savedLists);
      const selectedList = lists.find((list) => list.id === listId);
      if (selectedList) {
        setWordList(selectedList);
        setNewWord(selectedList.words);
      }
    }
  }, [listId]);

  const setNewWord = (words: string[]) => {
    const newWord = getRandomWord(words);
    setCurrentWord(newWord);
    setScrambledWord(scrambleWord(newWord));
    setHintUsed(false);
  };

  const getRandomWord = (words: string[]) => {
    return words[Math.floor(Math.random() * words.length)];
  };

  const scrambleWord = (word: string) => {
    return word
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  };

  const handleGuess = () => {
    if (userGuess.toLowerCase() === currentWord.toLowerCase()) {
      setScore(score + 1);
      setStreak(streak + 1);
      setFeedback('Correct! Great job! 🎉');
      playSound('success');
      if (streak === 2) {
        setAchievement("Wow! You're on fire! 🔥");
      } else if (streak === 5) {
        setAchievement("Amazing! You're a Word Wizard! 🧙‍♂️");
      }
    } else {
      setStreak(0);
      setFeedback(`Oops! The correct word was "${currentWord}". Try again! 💪`);
      playSound('error');
      setAchievement('');
    }

    if (wordList) {
      const remainingWords = wordList.words.filter(
        (word) => word.toLowerCase() !== currentWord.toLowerCase()
      );
      if (remainingWords.length > 0) {
        setNewWord(remainingWords);
      } else {
        setGameOver(true);
        updateWordList();
      }
    }
    setUserGuess('');
  };

  const updateWordList = () => {
    if (wordList) {
      const updatedList = {
        ...wordList,
        played: true,
        wordsLearned: score,
      };
      const savedLists = localStorage.getItem('wordLists');
      if (savedLists) {
        const lists: WordList[] = JSON.parse(savedLists);
        const updatedLists = lists.map((list) =>
          list.id === updatedList.id ? updatedList : list
        );
        localStorage.setItem('wordLists', JSON.stringify(updatedLists));
      }
    }
  };

  const playSound = (type: 'success' | 'error') => {
    const audio = new Audio(
      type === 'success' ? '/sounds/success.mp3' : '/sounds/error.mp3'
    );
    audio.play();
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord);
      speechSynthesis.speak(utterance);
    }
  };

  const showHint = () => {
    setHintUsed(true);
    setUserGuess(
      currentWord[0] +
        '_'.repeat(currentWord.length - 2) +
        currentWord[currentWord.length - 1]
    );
  };

  if (!wordList) {
    return (
      <div className="text-center text-white text-2xl mt-10">
        Loading... If this persists, the word list might not exist.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 min-h-screen text-white">
      <Link
        to="/"
        className="flex items-center mb-4 text-white hover:text-yellow-300 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Word Lists
      </Link>
      <h1 className="text-4xl font-bold mb-4 text-center text-yellow-300">
        Word Wizard: {wordList.name}
      </h1>
      {!gameOver ? (
        <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-lg">
          <p className="mb-4 text-2xl font-semibold">Unscramble this word:</p>
          <p className="mb-4 text-4xl font-bold text-center tracking-wide">
            {scrambledWord}
          </p>
          <div className="flex justify-center mb-4">
            <input
              type="text"
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              placeholder="Your guess"
              className="border-2 border-yellow-300 p-2 mr-2 rounded text-black text-xl w-full max-w-md"
            />
          </div>
          <div className="flex justify-center space-x-4 mb-4">
            <button
              onClick={handleGuess}
              className="bg-green-500 text-white p-2 rounded text-xl hover:bg-green-600 transition-colors"
            >
              Submit Guess
            </button>
            <button
              onClick={speakWord}
              className="bg-blue-500 text-white p-2 rounded text-xl hover:bg-blue-600 transition-colors"
            >
              <Volume2 size={24} />
            </button>
            <button
              onClick={showHint}
              disabled={hintUsed}
              className={`bg-yellow-500 text-white p-2 rounded text-xl hover:bg-yellow-600 transition-colors ${
                hintUsed ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Hint
            </button>
          </div>
          <p className="mt-4 text-xl">{feedback}</p>
          {achievement && (
            <p className="mt-2 text-2xl font-bold text-yellow-300">
              {achievement}
            </p>
          )}
          <div className="mt-4 flex justify-between items-center">
            <p className="text-xl">
              Score: {score}/{wordList.words.length}
            </p>
            <p className="text-xl">Streak: {streak} 🔥</p>
          </div>
        </div>
      ) : (
        <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
          <p className="text-xl mb-2">
            Congratulations! You've completed the game.
          </p>
          <p className="text-2xl font-semibold mb-4">
            Final Score: {score}/{wordList.words.length}
          </p>
          <div className="flex justify-center space-x-4">
            {[...Array(Math.min(5, Math.ceil(score / 2)))].map((_, i) => (
              <Star key={i} size={32} className="text-yellow-300" />
            ))}
          </div>
          <Link
            to="/"
            className="mt-4 inline-block bg-blue-500 text-white p-2 rounded text-xl hover:bg-blue-600 transition-colors"
          >
            Play Again
          </Link>
        </div>
      )}
    </div>
  );
};

export default WordGame;
