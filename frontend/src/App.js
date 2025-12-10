import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

import LocationsList from "./pages/LocationsList";
import LocationDetail from "./pages/LocationDetail";

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <div className="header-inner">
            <h1>CSCI2720 Project</h1>
            <nav>
              <Link to="/">Locations</Link>
            </nav>
          </div>
        </header>
        
        <main>
          <Routes>
            {/* MAIN PAGE — Locations list */}
            <Route path="/" element={<LocationsList />} />
            
            {/* Single location page */}
            <Route path="/locations/:id" element={<LocationDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
