import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>CSCI2720 Project</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div>
      <h2>Welcome to CSCI2720 Project</h2>
      <p>Project setup complete!</p>
    </div>
  );
}

export default App;
