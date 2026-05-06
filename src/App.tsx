/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import StrangeWorks from "./pages/StrangeWorks";

export default function App() {
  return (
    <Router basename="/ketAI">
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/strange-works" element={<StrangeWorks />} />
          </Routes>
        </main>
        
        <footer className="py-12 border-t border-neutral-100 bg-white">
          <div className="max-w-[1440px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-neutral-300 text-[10px] font-bold uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} |ketAI&gt; / RESEARCH & ENGINEERING
            </p>
            <div className="flex gap-10 items-center">
              {localStorage.getItem("adminKey") && (
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black uppercase text-neutral-400 tracking-widest">Master Key: {localStorage.getItem("adminKey") === 'eth::aei' ? 'DEFAULT' : 'CUSTOM'}</span>
                  <button 
                    onClick={() => { localStorage.removeItem("adminKey"); window.location.reload(); }}
                    className="text-neutral-900 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-all border border-neutral-900 px-3 py-1"
                  >
                    Logout
                  </button>
                </div>
              )}
              <a href="https://github.com/r-karra" target="_blank" rel="noreferrer" className="text-neutral-300 hover:text-neutral-900 text-[10px] font-bold uppercase tracking-widest transition-all">GitHub</a>
              <a href="https://www.kaggle.com/rajeshkumarkarra" target="_blank" rel="noreferrer" className="text-neutral-300 hover:text-neutral-900 text-[10px] font-bold uppercase tracking-widest transition-all">Kaggle</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
