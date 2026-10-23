import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ReportPage } from './pages/ReportPage';

export function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/report/:id" element={<ReportPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
