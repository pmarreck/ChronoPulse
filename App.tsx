import React, { useState } from 'react';
import { AnalogClock } from './components/AnalogClock';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSmooth, setIsSmooth] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(false);

  // When switching to smooth, sound must be disabled as per requirement
  const toggleSmooth = () => {
    const newValue = !isSmooth;
    setIsSmooth(newValue);
    if (newValue) {
      setIsSoundEnabled(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-700 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200' 
        : 'bg-gradient-to-br from-gray-100 via-white to-gray-200 text-slate-800'
    }`}>
      
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${theme === 'dark' ? 'bg-emerald-500' : 'bg-emerald-600'}`} />
          <h1 className="text-xl font-bold tracking-wider uppercase opacity-80">ChronoPulse</h1>
        </div>
        
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase border transition-all duration-300 ${
            theme === 'dark' 
              ? 'border-slate-700 hover:bg-slate-800 hover:border-slate-500 text-slate-400' 
              : 'border-gray-300 hover:bg-white hover:border-gray-400 text-gray-600 shadow-sm'
          }`}
        >
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </header>

      <main className="flex flex-col items-center gap-10 scale-90 md:scale-100 transition-transform duration-500">
        <div className="relative">
          {/* Outer Glow for depth */}
          <div className={`absolute -inset-4 rounded-full blur-2xl opacity-40 transition-colors duration-700 ${
            theme === 'dark' ? 'bg-blue-500/30' : 'bg-gray-400/40'
          }`} />
          
          <AnalogClock theme={theme} isSmooth={isSmooth} isSoundEnabled={isSoundEnabled} />
        </div>

        {/* Controls */}
        <div className={`flex flex-col sm:flex-row gap-6 items-center justify-center p-6 rounded-2xl backdrop-blur-sm border transition-all duration-500 ${
          theme === 'dark' 
            ? 'bg-slate-800/30 border-slate-700/50' 
            : 'bg-white/30 border-white/50 shadow-lg'
        }`}>
          
          {/* Smooth Toggle */}
          <div className="flex items-center gap-3">
            <span className={`text-xs uppercase tracking-wider font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Smooth Sweep
            </span>
            <button
              onClick={toggleSmooth}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                isSmooth 
                  ? (theme === 'dark' ? 'bg-emerald-500' : 'bg-emerald-500') 
                  : (theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300')
              }`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                isSmooth ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Separator */}
          <div className={`hidden sm:block w-px h-8 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300'}`} />

          {/* Sound Toggle */}
          <div className={`flex items-center gap-3 transition-opacity duration-300 ${isSmooth ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}`}>
            <span className={`text-xs uppercase tracking-wider font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Ticking Sound
            </span>
            <button
              onClick={() => !isSmooth && setIsSoundEnabled(!isSoundEnabled)}
              disabled={isSmooth}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                isSoundEnabled && !isSmooth
                  ? (theme === 'dark' ? 'bg-emerald-500' : 'bg-emerald-500') 
                  : (theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300')
              }`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                isSoundEnabled && !isSmooth ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        <div className={`text-center space-y-2 transition-opacity duration-500 ${theme === 'dark' ? 'opacity-60' : 'opacity-80'}`}>
          <p className="text-xs uppercase tracking-[0.2em]">{isSmooth ? 'High Frequency Movement' : 'Quartz Step Movement'}</p>
          <p className="text-xs uppercase tracking-[0.2em]">System Synchronized</p>
        </div>
      </main>

      <footer className="absolute bottom-6 text-center opacity-40 text-[10px] tracking-widest uppercase">
        Design & Engineering
      </footer>
    </div>
  );
};

export default App;