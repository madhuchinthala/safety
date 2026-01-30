
import React, { useState } from 'react';

interface SimpleLoginProps {
  onEnter: (name: string) => void;
}

const SimpleLogin: React.FC<SimpleLoginProps> = ({ onEnter }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onEnter(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 mb-2">SentientGuardian</h1>
        <p className="text-gray-500 mb-8">Enter your name to activate the safety system.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            autoFocus
            className="w-full text-center text-xl font-bold px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-0 outline-none transition-all placeholder-gray-300"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95"
          >
            Enter Safe Mode
          </button>
        </form>
      </div>
    </div>
  );
};

export default SimpleLogin;
