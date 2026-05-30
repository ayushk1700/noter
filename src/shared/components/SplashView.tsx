import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Quote } from 'lucide-react';

const getDynamicGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Late night focus';
};

const fallBackQuotes = [
  { text: "Design is not just what it looks like and feels like. Design is how it works.", author: "Steve Jobs" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Good design is obvious. Great design is transparent.", author: "Joe Sparano" },
  { text: "Whitespace is like air: it is necessary for design to breathe.", author: "Wojciech Zieliński" }
];

interface SplashViewProps {
  onNewNote: () => void;
  onGoToWorkspace: () => void;
  onQuickCapture: (thought: string) => void;
  themeMode?: 'light' | 'dark';
  isChronoEnabled?: boolean;
  onToggleTheme?: () => void;
  onToggleChrono?: () => void;
}

export default function SplashView({ 
  onNewNote, 
  onGoToWorkspace, 
  onQuickCapture,
  themeMode = 'light',
  isChronoEnabled = false,
  onToggleTheme,
  onToggleChrono
}: SplashViewProps) {
  
  const [quickThought, setQuickThought] = useState('');
  const [greeting, setGreeting] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [currentQuote, setCurrentQuote] = useState({ text: '', author: '' });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const isDark = themeMode === 'dark';

  useEffect(() => {
    setGreeting(getDynamicGreeting());
    const randomQuote = fallBackQuotes[Math.floor(Math.random() * fallBackQuotes.length)];
    setCurrentQuote(randomQuote);
  }, []);

  const handleQuickCapture = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && quickThought.trim()) {
      onQuickCapture(quickThought);
      setQuickThought('');
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div 
      onClick={onGoToWorkspace}
      className={`flex flex-col h-[100dvh] w-full justify-center items-center p-8 transition-colors duration-700 relative z-10 cursor-pointer overflow-hidden font-sans
        ${isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-50 text-neutral-900'}`}
    >

      {/* Grid Pattern Background */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 z-0
          ${isFocused ? 'opacity-20' : 'opacity-100'}`}
        style={{
          backgroundImage: isDark 
            ? 'linear-gradient(to right, #ffffff0a 1px, transparent 1px), linear-gradient(to bottom, #ffffff0a 1px, transparent 1px)' 
            : 'linear-gradient(to right, #0000000a 1px, transparent 1px), linear-gradient(to bottom, #0000000a 1px, transparent 1px)',
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)'
        }}
      />

      {/* Static Dim Overlay for Focus Mode */}
      <div 
        className={`fixed inset-0 z-20 transition-opacity duration-700 pointer-events-none
          ${isFocused ? 'opacity-100' : 'opacity-0'}
          ${isDark ? 'bg-black/80' : 'bg-black/40'}`}
      />

      <div className={`w-full max-w-2xl flex flex-col items-center space-y-12 z-10 transition-all duration-700 
        ${isFocused ? 'opacity-0 blur-md scale-95 -translate-y-8 pointer-events-none' : 'opacity-100 blur-0 scale-100 translate-y-0'}`}>
        
        {/* Greeting & Date */}
        <div className="text-center space-y-4">
          <h1 className={`text-balance font-serif text-6xl md:text-7xl font-extrabold tracking-tight transition-colors
            ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            {greeting}.
          </h1>
          <div className={`flex items-center justify-center space-x-3 font-bold tracking-widest uppercase text-xs
            ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            <Sparkles className="w-4 h-4 text-[#FF7D54]" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Spotlight Input - Skeleton B&W Type Design */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className={`w-full relative flex items-center group max-w-lg mx-auto mt-12 cursor-default z-30 transition-all duration-500
          ${isFocused ? 'scale-105' : 'scale-100'}`}
      >
        <div className={`w-full p-2 flex items-center transition-all duration-300 border-2 
          ${isDark 
            ? (isFocused 
                ? 'bg-neutral-950 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]' 
                : 'bg-transparent border-dashed border-neutral-600 hover:border-white hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]') 
            : (isFocused 
                ? 'bg-white border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' 
                : 'bg-transparent border-dashed border-neutral-400 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]')}
          `}
        >
          {/* Terminal / Type prompt */}
          <div className={`absolute left-6 font-mono text-sm opacity-50 ${isDark ? 'text-white' : 'text-black'}`}>
            {'>'}
          </div>
          
          <input 
            ref={inputRef}
            type="text"
            value={quickThought}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setQuickThought(e.target.value)}
            onKeyDown={handleQuickCapture}
            placeholder="Capture thought..." 
            className={`w-full bg-transparent outline-none text-center font-mono text-lg py-4 px-12 transition-colors
              ${isDark 
                ? 'text-white placeholder-neutral-600' 
                : 'text-black placeholder-neutral-400'}`}
          />
          
          {quickThought.trim() && (
            <button 
              onClick={() => handleQuickCapture({ key: 'Enter' } as React.KeyboardEvent)} 
              className={`p-3 absolute right-3 transition-all duration-300 border-2 flex items-center justify-center
                ${isDark 
                  ? 'bg-neutral-950 border-white text-white hover:bg-white hover:text-black' 
                  : 'bg-white border-black text-black hover:bg-black hover:text-white'}`}
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Spotlight Active Indicator */}
        <div className={`absolute -top-10 left-1/2 transform -translate-x-1/2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-500
          ${isFocused ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} 
          ${isDark ? 'text-white' : 'text-black'}`}
        >
          <span className="w-1.5 h-1.5 bg-current animate-pulse" />
          Focus Mode
        </div>
      </div>

      {/* Quote Footer (Replaces Intention Setting) */}
      <div 
        className={`absolute bottom-12 w-full max-w-md text-center flex flex-col items-center space-y-3 z-10 transition-all duration-700
          ${isFocused ? 'opacity-0 blur-md translate-y-4 pointer-events-none' : 'opacity-40 hover:opacity-100 blur-0 translate-y-0'}`}
      >
        <Quote className={`w-5 h-5 rotate-180 transition-colors duration-300 
          ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`} />
        <p className={`text-balance text-sm italic font-medium leading-relaxed max-w-sm px-4
          ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
          &ldquo;{currentQuote.text}&rdquo;
        </p>
        <span className={`text-[10px] uppercase tracking-widest font-bold mt-2
          ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
          — {currentQuote.author}
        </span>
      </div>
      
    </div>
  );
}