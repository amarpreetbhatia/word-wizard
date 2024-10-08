import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import WordListManager from "./components/WordListManager";
import WordGame from "./components/WordGame";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<WordListManager />} />
          <Route path="/game/:listId" element={<WordGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
