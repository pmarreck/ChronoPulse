import React, { useMemo, useEffect, useRef } from 'react';
import { useClockTime } from '../hooks/useClockTime';

interface AnalogClockProps {
  size?: number;
  theme: 'dark' | 'light';
  isSmooth: boolean;
  isSoundEnabled: boolean;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({ size = 400, theme, isSmooth, isSoundEnabled }) => {
  const { date, hours, minutes, seconds, milliseconds } = useClockTime(isSmooth);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const lastSecondRef = useRef(seconds);

  // Initialize AudioContext safely
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }
    return audioContextRef.current;
  };

  // Play Tick Sound
  const playTick = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Resume context if suspended (browser policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Create noise buffer if it doesn't exist
    if (!noiseBufferRef.current) {
        const bufferSize = ctx.sampleRate * 1; // 1 second buffer is plenty
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            // White noise generation
            data[i] = Math.random() * 2 - 1;
        }
        noiseBufferRef.current = buffer;
    }

    // Source: Noise Buffer
    const source = ctx.createBufferSource();
    source.buffer = noiseBufferRef.current;

    // Filter: Bandpass to create a sharp mechanical "click"
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    // 2000Hz is a good sweet spot for a generic quartz clock tick
    filter.frequency.value = 2000; 
    filter.Q.value = 5; // Resonant enough to have tone, broad enough to be a click

    // Envelope: Percussive and short
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    
    // Subtle volume
    const volume = theme === 'dark' ? 0.25 : 0.15;

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.002); // Very fast attack
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05); // Fast decay

    // Connect graph
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(t);
    source.stop(t + 0.1);
  };

  // Effect to trigger sound on second change
  useEffect(() => {
    if (isSoundEnabled && !isSmooth && seconds !== lastSecondRef.current) {
      playTick();
      lastSecondRef.current = seconds;
    } else {
        // Sync ref if we switch modes so we don't double tick or miss
        lastSecondRef.current = seconds;
    }
  }, [seconds, isSoundEnabled, isSmooth, theme]);


  // Calculate rotations
  const secondDegrees = isSmooth 
    ? (seconds + milliseconds / 1000) * 6 
    : seconds * 6;
    
  const minuteDegrees = minutes * 6 + seconds * 0.1; // 360 / 60 + slight creep based on seconds
  const hourDegrees = (hours % 12) * 30 + minutes * 0.5; // 360 / 12 + slight creep

  // Determine colors based on theme
  const colors = theme === 'dark' ? {
    face: 'fill-slate-800',
    rim: 'stroke-slate-700',
    rimGradientFrom: '#1e293b', // slate-800
    rimGradientTo: '#0f172a',   // slate-900
    tickMajor: 'stroke-slate-300',
    tickMinor: 'stroke-slate-600',
    number: 'fill-slate-300',
    handHour: 'stroke-slate-200',
    handMinute: 'stroke-slate-200',
    handSecond: 'stroke-orange-500',
    centerDot: 'fill-slate-200',
    centerDotInner: 'fill-slate-900',
    shadow: 'rgba(0,0,0,0.5)',
    dateBg: 'fill-slate-900',
    dateStroke: 'stroke-slate-700',
    dateTextMonth: 'fill-slate-500',
    dateTextDay: 'fill-slate-200'
  } : {
    face: 'fill-white',
    rim: 'stroke-gray-200',
    rimGradientFrom: '#ffffff',
    rimGradientTo: '#f3f4f6',
    tickMajor: 'stroke-gray-800',
    tickMinor: 'stroke-gray-300',
    number: 'fill-gray-800',
    handHour: 'stroke-gray-900',
    handMinute: 'stroke-gray-700',
    handSecond: 'stroke-red-600',
    centerDot: 'fill-gray-800',
    centerDotInner: 'fill-white',
    shadow: 'rgba(0,0,0,0.15)',
    dateBg: 'fill-gray-50',
    dateStroke: 'stroke-gray-300',
    dateTextMonth: 'fill-gray-500',
    dateTextDay: 'fill-gray-900'
  };

  // Generate Ticks
  const ticks = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => {
      const isHour = i % 5 === 0;
      const angle = i * 6; // 0 to 360
      return (
        <line
          key={i}
          x1="100"
          y1={isHour ? "15" : "18"}
          x2="100"
          y2={isHour ? "25" : "22"}
          transform={`rotate(${angle} 100 100)`}
          className={`${isHour ? colors.tickMajor : colors.tickMinor}`}
          strokeWidth={isHour ? "2" : "1"}
          strokeLinecap="round"
        />
      );
    });
  }, [colors]);

  // Generate Numbers
  const numbers = useMemo(() => {
    return [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => {
      const angle = (num * 30 - 90) * (Math.PI / 180);
      const radius = 65;
      const x = 100 + radius * Math.cos(angle);
      const y = 100 + radius * Math.sin(angle);

      return (
        <text
          key={num}
          x={x}
          y={y}
          dy="5"
          textAnchor="middle"
          className={`text-[14px] font-medium ${colors.number} font-sans`}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {num}
        </text>
      );
    });
  }, [colors]);

  const monthStr = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const dayStr = date.getDate();

  return (
    <div className="relative select-none" style={{ width: size, height: size }}>
      {/* Main SVG */}
      <svg
        viewBox="0 0 200 200"
        className={`w-full h-full drop-shadow-2xl rounded-full transition-all duration-700`}
      >
        <defs>
          <linearGradient id="rimGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.rimGradientFrom} />
            <stop offset="100%" stopColor={colors.rimGradientTo} />
          </linearGradient>
          
          <filter id="handShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1" dy="1" stdDeviation="1.5" floodColor={colors.shadow} />
          </filter>
          
          <radialGradient id="faceGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
             <stop offset="80%" stopColor={theme === 'dark' ? '#1e293b' : '#ffffff'} stopOpacity="1" />
             <stop offset="100%" stopColor={theme === 'dark' ? '#0f172a' : '#e5e7eb'} stopOpacity="1" />
          </radialGradient>
        </defs>

        {/* Clock Body */}
        <circle
          cx="100"
          cy="100"
          r="98"
          stroke="url(#rimGradient)"
          strokeWidth="4"
          fill="url(#faceGradient)"
          className="transition-all duration-700"
        />
        
        <circle
          cx="100"
          cy="100"
          r="92"
          stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
          strokeWidth="1"
          fill="none"
        />

        <g className="transition-colors duration-700">
            {ticks}
        </g>

        <g className="transition-colors duration-700">
            {numbers}
        </g>

        {/* Date Display */}
        <g transform="translate(134, 100)">
           <rect 
             x="-21" y="-9" width="42" height="18" rx="2" 
             className={`${colors.dateBg} ${colors.dateStroke} transition-colors duration-700`}
             strokeWidth="1"
           />
           <text 
             y="4" 
             textAnchor="middle" 
             className="text-[9px] font-bold font-sans pointer-events-none select-none"
           >
             <tspan className={`${colors.dateTextMonth} transition-colors duration-700`}>{monthStr}</tspan>
             <tspan dx="3" className={`${colors.dateTextDay} transition-colors duration-700`}>{dayStr}</tspan>
           </text>
        </g>

        <text
          x="100"
          y="140"
          textAnchor="middle"
          className={`text-[5px] uppercase tracking-[0.3em] ${theme === 'dark' ? 'fill-slate-600' : 'fill-gray-400'}`}
        >
          {isSmooth ? 'Automatic' : 'Quartz'}
        </text>

        {/* Hands Container */}
        <g filter="url(#handShadow)">
          {/* Hour Hand */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="55"
            className={`${colors.handHour} smooth-transition`}
            strokeWidth="4"
            strokeLinecap="round"
            style={{
              transform: `rotate(${hourDegrees}deg)`,
              transformOrigin: '100px 100px',
            }}
          />
          
          {/* Minute Hand */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="35"
            className={`${colors.handMinute} smooth-transition`}
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              transform: `rotate(${minuteDegrees}deg)`,
              transformOrigin: '100px 100px',
            }}
          />

          {/* Second Hand */}
          {/* 
              Logic for transition: 
              If isSmooth is true, we want NO CSS transition (or linear) because React updates the DOM 60fps.
              If isSmooth is false, we want the 'tick' transition.
          */}
          <line
            x1="100"
            y1="120"
            x2="100"
            y2="30"
            className={`${colors.handSecond}`}
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{
              transform: `rotate(${secondDegrees}deg)`,
              transformOrigin: '100px 100px',
              transition: isSmooth 
                ? 'none' 
                : (seconds === 0 ? 'none' : 'transform 0.15s cubic-bezier(0.4, 2.08, 0.55, 0.44)')
            }}
          />
          
           <circle
            cx="100"
            cy="100"
            r="2"
            className={`${colors.handSecond}`}
             style={{
              transform: `rotate(${secondDegrees}deg) translate(0, 20px)`,
              transformOrigin: '100px 100px',
              transition: isSmooth 
                ? 'none' 
                : (seconds === 0 ? 'none' : 'transform 0.15s cubic-bezier(0.4, 2.08, 0.55, 0.44)')
            }}
           />
        </g>

        <circle cx="100" cy="100" r="3.5" className={`${colors.centerDot} transition-colors duration-700`} />
        <circle cx="100" cy="100" r="1.5" className={`${colors.centerDotInner} transition-colors duration-700`} />

      </svg>
    </div>
  );
};