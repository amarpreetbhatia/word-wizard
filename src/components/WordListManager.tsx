import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Save, Play, Trash2, AlertCircle } from 'lucide-react'

interface WordList {
  id: string
  name: string
  words: string[]
  played: boolean
  wordsLearned: number
}

const WordListManager: React.FC = () => {
  const [wordLists, setWordLists] = useState<WordList[]>([])
  const [currentList, setCurrentList] = useState<WordList>({ id: '', name: '', words: [], played: false, wordsLearned: 0 })
  const [newWord, setNewWord] = useState('')
  const [showWarning, setShowWarning] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const savedLists = localStorage.getItem('wordLists')
    if (savedLists) {
      setWordLists(JSON.parse(savedLists))
    }
  }, [])

  const saveList = () => {
    if (currentList.name.trim() === '') return
    if (currentList.words.length > 10) {
      setShowWarning(true)
      return
    }

    const updatedLists = currentList.id
      ? wordLists.map(list => (list.id === currentList.id ? currentList : list))
      : [...wordLists, { ...currentList, id: Date.now().toString() }]

    setWordLists(updatedLists)
    localStorage.setItem('wordLists', JSON.stringify(updatedLists))
    setCurrentList({ id: '', name: '', words: [], played: false, wordsLearned: 0 })
    setShowWarning(false)
  }

  const addWord = () => {
    if (newWord.trim() === '') return
    if (currentList.words.length >= 10) {
      setShowWarning(true)
      return
    }
    setCurrentList(prev => ({ ...prev, words: [...prev.words, newWord.trim()] }))
    setNewWord('')
  }

  const removeWord = (index: number) => {
    setCurrentList(prev => ({
      ...prev,
      words: prev.words.filter((_, i) => i !== index)
    }))
    setShowWarning(false)
  }

  const deleteList = (id: string) => {
    const updatedLists = wordLists.filter(list => list.id !== id)
    setWordLists(updatedLists)
    localStorage.setItem('wordLists', JSON.stringify(updatedLists))
  }

  const startGame = (list: WordList) => {
    navigate(`/game/${encodeURIComponent(list.name)}`, { state: { listId: list.id } })
  }

  return (
    <div className="container mx-auto p-4 bg-gradient-to-r from-green-400 to-blue-500 min-h-screen">
      <h1 className="text-4xl font-bold mb-4 text-white text-center">Word Wizard</h1>
      <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Create New Word List</h2>
        <div className="mb-4">
          <input
            type="text"
            value={currentList.name}
            onChange={e => setCurrentList(prev => ({ ...prev, name: e.target.value }))}
            placeholder="List Name"
            className="border-2 border-gray-300 p-2 mr-2 rounded w-full mb-2"
          />
          <div className="flex">
            <input
              type="text"
              value={newWord}
              onChange={e => setNewWord(e.target.value)}
              placeholder="Add word"
              className="border-2 border-gray-300 p-2 mr-2 rounded flex-grow"
            />
            <button onClick={addWord} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors">
              <Plus size={20} />
            </button>
          </div>
        </div>
        {showWarning && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
            <p className="font-bold">Warning</p>
            <p>We suggest making multiple lists with up to 10 words each. It's easier for kids to learn this way!</p>
          </div>
        )}
        <ul className="mb-4 max-h-40 overflow-y-auto">
          {currentList.words.map((word, index) => (
            <li key={index} className="mb-1 flex justify-between items-center bg-gray-100 p-2 rounded">
              <span>{word}</span>
              <button onClick={() => removeWord(index)} className="text-red-500 hover:text-red-700">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
        <button onClick={saveList} className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors">
          <Save size={20} className="inline mr-2" /> Save List
        </button>
      </div>
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Saved Word Lists</h2>
        <ul>
          {wordLists.map(list => (
            <li key={list.id} className="mb-2 flex items-center justify-between bg-gray-100 p-3 rounded">
              <div>
                <span className="font-semibold text-gray-700">{list.name} ({list.words.length} words)</span>
                <p className="text-sm text-gray-500">
                  Status: {list.played ? 'Played' : 'Not played yet'}
                </p>
                <p className="text-sm text-gray-500">
                  Words learned: {list.wordsLearned}/{list.words.length}
                </p>
              </div>
              <div>
                <button onClick={() => startGame(list)} className="bg-purple-500 text-white p-2 rounded mr-2 hover:bg-purple-600 transition-colors">
                  <Play size={20} />
                </button>
                <button onClick={() => deleteList(list.id)} className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default WordListManager