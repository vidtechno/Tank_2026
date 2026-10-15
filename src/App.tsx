/**
 * Steel Front: Tank Defense
 * Main Application Component & Game HUD Interface
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Crosshair,
  Award,
  Info,
  Lock,
  ChevronRight,
  Flame,
  Radio,
  Globe,
  Skull,
  Trophy,
  Zap
} from 'lucide-react';
import { GameEngine } from './game/engine';
import { GameState, LevelDefinition, PowerUpType } from './game/types';
import { LEVELS, getLevel } from './game/levels';
import { Sound } from './game/audio';
import { Storage } from './game/storage';
import { Language, TRANSLATIONS } from './game/i18n';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // UI State - Default to 'menu' so Start Game screen is shown immediately upon entering!
  const [gameState, setGameState] = useState<GameState>('menu');
  const [language, setLanguage] = useState<Language>(Storage.getLanguage());
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showIntel, setShowIntel] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(Sound.isMuted());

  // Battle Records
  const [battleStats, setBattleStats] = useState({
    totalKills: Storage.getTotalKills(),
    totalVictories: Storage.getTotalVictories()
  });

  // Current translation strings
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // In-Game Live Stats
  const [stats, setStats] = useState({
    score: 0,
    highScore: Storage.getHighScore(),
    currentLevel: 1,
    unlockedLevel: Storage.getUnlockedLevel(),
    lives: 3,
    playerHp: 2,
    maxPlayerHp: 2,
    enemiesRemaining: 10,
    baseHealth: 3,
    maxBaseHealth: 3,
    activeEnemiesCount: 0,
    reloadingRatio: 1,
    activePowerUps: [] as { type: PowerUpType; label: string; remaining: number }[],
    comboCount: 0,
    comboMultiplier: 1
  });

  // Modal Dialog Details
  const [gameOverInfo, setGameOverInfo] = useState({ reason: '', score: 0, levelId: 1 });
  const [levelClearInfo, setLevelClearInfo] = useState({
    levelId: 1,
    score: 0,
    enemiesDefeated: 0,
    baseBonus: 0,
    livesBonus: 0
  });
  const [victoryScore, setVictoryScore] = useState<number>(0);

  // Switch Language
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    Storage.setLanguage(newLang);
  };

  // Initialize Game Engine on Canvas Mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const engine = new GameEngine(canvas, {
      onStateChange: (state) => {
        setGameState(state);
        // Refresh battle records
        setBattleStats({
          totalKills: Storage.getTotalKills(),
          totalVictories: Storage.getTotalVictories()
        });
      },
      onStatsUpdate: (newStats) => setStats((prev) => ({ ...prev, ...newStats })),
      onLevelComplete: (summary) => {
        setLevelClearInfo(summary);
      },
      onGameOver: (reason, score, levelId) => {
        setGameOverInfo({ reason, score, levelId });
      },
      onVictory: (score) => {
        setVictoryScore(score);
        setBattleStats({
          totalKills: Storage.getTotalKills(),
          totalVictories: Storage.getTotalVictories()
        });
      }
    });

    engineRef.current = engine;
    engine.startLoop();

    // Canvas Auto-Resizing
    const handleResize = () => {
      if (!canvas) return;
      const container = canvas.parentElement;
      const w = container?.clientWidth || window.innerWidth || 360;
      const h = container?.clientHeight || 360;
      const size = Math.max(260, Math.min(w - 12, h - 12, 512));
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(512 * dpr);
      canvas.height = Math.round(512 * dpr);
    };

    handleResize();
    const t1 = setTimeout(handleResize, 60);
    const t2 = setTimeout(handleResize, 300);
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
      engine.stopLoop();
    };
  }, []);

  // Desktop Keyboard Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      const code = e.code;
      const key = e.key ? e.key.toLowerCase() : '';

      // Prevent browser page scrolling on game keys
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code) ||
        ['w', 's', 'a', 'd'].includes(key)
      ) {
        e.preventDefault();
      }

      Sound.initContext();

      if (code === 'ArrowUp' || code === 'KeyW' || key === 'w') engine.setInput({ up: true });
      if (code === 'ArrowDown' || code === 'KeyS' || key === 's') engine.setInput({ down: true });
      if (code === 'ArrowLeft' || code === 'KeyA' || key === 'a') engine.setInput({ left: true });
      if (code === 'ArrowRight' || code === 'KeyD' || key === 'd') engine.setInput({ right: true });

      if (code === 'KeyP' || code === 'Escape') {
        if (engine.state === 'playing') engine.pause();
        else if (engine.state === 'paused') engine.resume();
      }

      if (code === 'KeyR' && engine.state === 'playing') {
        engine.restartCurrentLevel();
      }

      if (code === 'Enter' || code === 'Space') {
        if (engine.state === 'menu') {
          handleDeployLevel(stats.unlockedLevel);
        } else if (engine.state === 'game_over') {
          handleDeployLevel(gameOverInfo.levelId);
        } else if (engine.state === 'level_clear') {
          handleNextLevel();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      const code = e.code;
      const key = e.key ? e.key.toLowerCase() : '';

      if (code === 'ArrowUp' || code === 'KeyW' || key === 'w') engine.setInput({ up: false });
      if (code === 'ArrowDown' || code === 'KeyS' || key === 's') engine.setInput({ down: false });
      if (code === 'ArrowLeft' || code === 'KeyA' || key === 'a') engine.setInput({ left: false });
      if (code === 'ArrowRight' || code === 'KeyD' || key === 'd') engine.setInput({ right: false });
    };

    const handleBlur = () => {
      engineRef.current?.setInput({ up: false, down: false, left: false, right: false, fire: false });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [stats.unlockedLevel, gameOverInfo.levelId]);

  // Audio Toggle
  const toggleAudio = useCallback(() => {
    Sound.initContext();
    const muted = Sound.toggleMute();
    setIsMuted(muted);
  }, []);

  // Deploy / Start Game
  const handleDeployLevel = useCallback((levelId: number) => {
    Sound.initContext();
    setShowLevelSelect(false);
    setShowIntel(false);
    engineRef.current?.loadLevel(levelId, false);
  }, []);

  // Next Level Progression
  const handleNextLevel = useCallback(() => {
    if (levelClearInfo.levelId < LEVELS.length) {
      engineRef.current?.loadLevel(levelClearInfo.levelId + 1, true);
    } else {
      setGameState('victory');
    }
  }, [levelClearInfo.levelId]);

  // Mobile D-Pad Pointer Handlers
  const handleDirectionPress = (dir: 'up' | 'down' | 'left' | 'right', pressed: boolean) => {
    Sound.initContext();
    engineRef.current?.setInput({ [dir]: pressed });
  };

  const currentLevelDef: LevelDefinition = getLevel(stats.currentLevel);

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between select-none overflow-hidden font-sans">
      {/* Tactical HUD Header */}
      <header className="w-full max-w-xl px-4 py-2 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between z-20 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{t.sector}</span>
            <span className="text-sm font-black text-amber-400 tabular-nums">0{stats.currentLevel}/06</span>
          </div>

          <div className="h-6 w-px bg-slate-800 mx-0.5" />

          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{t.score}</span>
            <span className="text-sm font-extrabold text-slate-100 tabular-nums">
              {String(stats.score).padStart(5, '0')}
            </span>
          </div>

          <div className="hidden sm:flex flex-col ml-0.5">
            <span className="text-[9px] font-semibold text-slate-500 uppercase">{t.best}</span>
            <span className="text-xs font-bold text-amber-500/90 tabular-nums">
              {String(stats.highScore).padStart(5, '0')}
            </span>
          </div>
        </div>

        {/* Center / Right Clusters: Base HP, Armor & Lives */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Base Integrity */}
          <div className="flex flex-col items-end" title="Command Core Integrity">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>{t.core}</span>
            </div>
            <div className="flex gap-1 mt-0.5">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className={`w-3 h-2 rounded-[2px] transition-colors ${
                    idx < stats.baseHealth ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Tank Armor HP (2 Hits) */}
          <div className="flex flex-col items-end" title="Armor: 2 Hits to Explode">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t.armor}</span>
            <div className="flex gap-1 mt-0.5">
              {[0, 1].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center transition-all ${
                    idx < stats.playerHp
                      ? stats.playerHp === 2
                        ? 'bg-emerald-400 text-slate-950 font-black text-[9px] shadow-sm shadow-emerald-400/50'
                        : 'bg-amber-400 text-slate-950 font-black text-[9px] shadow-sm shadow-amber-400/50 animate-pulse'
                      : 'bg-slate-800 text-slate-600 font-bold text-[9px]'
                  }`}
                >
                  {idx < stats.playerHp ? '🛡' : '✕'}
                </div>
              ))}
            </div>
          </div>

          {/* Lives */}
          <div className="flex flex-col items-end" title="Player Tank Units">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t.lives}</span>
            <div className="flex gap-1 mt-0.5">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center transition-all ${
                    idx < stats.lives
                      ? 'bg-amber-400 text-slate-950 font-black text-[9px] shadow-sm shadow-amber-400/50'
                      : 'bg-slate-800 text-slate-600 font-bold text-[9px]'
                  }`}
                >
                  ▲
                </div>
              ))}
            </div>
          </div>

          {/* Language Selector in Header */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            {(['uz', 'en', 'ru'] as Language[]).map((lng) => (
              <button
                key={lng}
                onClick={() => handleLanguageChange(lng)}
                className={`px-1.5 py-1 text-[10px] font-extrabold rounded ${
                  language === lng ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                } transition-colors`}
              >
                {lng.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Controls: Audio & Pause */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleAudio}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 transition-transform active:scale-90"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={() => {
                if (gameState === 'playing') engineRef.current?.pause();
                else if (gameState === 'paused') engineRef.current?.resume();
              }}
              disabled={gameState !== 'playing' && gameState !== 'paused'}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 transition-transform active:scale-90 disabled:opacity-40"
              title="Pause"
            >
              {gameState === 'paused' ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Playfield Viewport */}
      <main className="relative flex-1 w-full max-w-xl flex items-center justify-center p-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={512}
          height={512}
          className="rounded-md shadow-2xl shadow-black border border-slate-800 bg-[#060911]"
        />

        {/* Active Power-Ups Banner */}
        {stats.activePowerUps.length > 0 && (
          <div className="absolute top-2.5 left-2.5 right-2.5 flex flex-wrap gap-1.5 z-20 pointer-events-none">
            {stats.activePowerUps.map((p, idx) => (
              <div
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-900/95 border border-amber-400/60 text-[10px] font-black text-amber-300 shadow-lg backdrop-blur-sm flex items-center gap-1 animate-pulse"
              >
                <span>{p.type === 'shield' ? '🛡️' : p.type === 'freeze' ? '❄️' : p.type === 'fortify' ? '🧱' : '⚡'}</span>
                <span>{p.label}: {p.remaining}s</span>
              </div>
            ))}
          </div>
        )}

        {/* Combo Multiplier Toast */}
        {stats.comboCount >= 2 && (
          <div className="absolute top-10 right-3 px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-[11px] rounded-md shadow-lg z-20 pointer-events-none animate-bounce">
            COMBO x{stats.comboMultiplier}!
          </div>
        )}

        {/* Life Lost Respawn Toast */}
        {gameState === 'life_lost' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 bg-slate-900/95 border border-rose-500 rounded-xl text-center shadow-2xl backdrop-blur-sm z-30 animate-pulse">
            <div className="text-rose-400 font-black text-sm tracking-widest uppercase">{t.unitCompromised}</div>
            <div className="text-slate-300 text-xs font-semibold mt-0.5">{t.reinforcing}</div>
          </div>
        )}
      </main>

      {/* Status Bar: Cannon Recharge & Hostile Radar */}
      <div className="w-full max-w-xl px-4 py-1.5 flex items-center justify-between text-xs text-slate-400 font-semibold border-t border-slate-900 bg-slate-950/70 z-10">
        {/* Cannon Ready Gauge */}
        <div className="flex items-center gap-2 flex-1 mr-4">
          <Crosshair className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-bold text-slate-300">{t.autoCannon}:</span>
          <div className="flex-1 max-w-[120px] h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-75"
              style={{ width: `${Math.round(stats.reloadingRatio * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-amber-400 font-mono">
            {stats.reloadingRatio >= 0.95 ? t.firing : t.ready}
          </span>
        </div>

        {/* Enemy Radar Count */}
        <div className="flex items-center gap-1.5" title="Hostiles Remaining">
          <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="text-[11px] font-bold text-slate-300">{t.hostiles}:</span>
          <span className="font-mono font-bold text-rose-400 text-sm tabular-nums">
            {stats.enemiesRemaining}
          </span>
        </div>
      </div>

      {/* Mobile Controls Zone: Ergonomic D-Pad on Left */}
      <footer className="w-full max-w-xl px-4 py-2 pb-5 flex items-center justify-between z-20 touch-none">
        {/* 4-Way D-Pad */}
        <div className="relative w-36 h-36 select-none">
          {/* Up */}
          <button
            onPointerDown={(e) => { e.preventDefault(); handleDirectionPress('up', true); }}
            onPointerUp={(e) => { e.preventDefault(); handleDirectionPress('up', false); }}
            onPointerCancel={() => handleDirectionPress('up', false)}
            className="absolute top-0 left-12 w-12 h-12 rounded-t-xl bg-slate-800/95 active:bg-amber-500 border border-slate-700 flex items-center justify-center text-slate-200 active:text-slate-950 font-black text-xl shadow-lg shadow-black/50 transition-colors"
            aria-label="Move Up"
          >
            ▲
          </button>

          {/* Down */}
          <button
            onPointerDown={(e) => { e.preventDefault(); handleDirectionPress('down', true); }}
            onPointerUp={(e) => { e.preventDefault(); handleDirectionPress('down', false); }}
            onPointerCancel={() => handleDirectionPress('down', false)}
            className="absolute bottom-0 left-12 w-12 h-12 rounded-b-xl bg-slate-800/95 active:bg-amber-500 border border-slate-700 flex items-center justify-center text-slate-200 active:text-slate-950 font-black text-xl shadow-lg shadow-black/50 transition-colors"
            aria-label="Move Down"
          >
            ▼
          </button>

          {/* Left */}
          <button
            onPointerDown={(e) => { e.preventDefault(); handleDirectionPress('left', true); }}
            onPointerUp={(e) => { e.preventDefault(); handleDirectionPress('left', false); }}
            onPointerCancel={() => handleDirectionPress('left', false)}
            className="absolute top-12 left-0 w-12 h-12 rounded-l-xl bg-slate-800/95 active:bg-amber-500 border border-slate-700 flex items-center justify-center text-slate-200 active:text-slate-950 font-black text-xl shadow-lg shadow-black/50 transition-colors"
            aria-label="Move Left"
          >
            ◀
          </button>

          {/* Right */}
          <button
            onPointerDown={(e) => { e.preventDefault(); handleDirectionPress('right', true); }}
            onPointerUp={(e) => { e.preventDefault(); handleDirectionPress('right', false); }}
            onPointerCancel={() => handleDirectionPress('right', false)}
            className="absolute top-12 right-0 w-12 h-12 rounded-r-xl bg-slate-800/95 active:bg-amber-500 border border-slate-700 flex items-center justify-center text-slate-200 active:text-slate-950 font-black text-xl shadow-lg shadow-black/50 transition-colors"
            aria-label="Move Right"
          >
            ▶
          </button>

          {/* D-Pad Center Cap */}
          <div className="absolute top-12 left-12 w-12 h-12 bg-slate-900 border border-slate-800 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-700" />
          </div>
        </div>

        {/* Center / Right: Auto-fire status & tactical info */}
        <div className="flex flex-col gap-2 items-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-bold text-amber-400 shadow-inner">
            <Crosshair className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{t.autoFireDesc.split(':')[0] || 'AUTO-FIRE'}</span>
          </div>

          <button
            onClick={() => setShowIntel(true)}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.intelAndCrates}</span>
          </button>

          <span className="text-[10px] text-slate-500 font-mono tracking-tight text-center">
            WASD / ARROWS / D-PAD
          </span>
        </div>
      </footer>

      {/* OVERLAY: Main Menu / Start Game Screen */}
      {gameState === 'menu' && !showLevelSelect && !showIntel && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-6 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl text-center relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />

            {/* Language Selector inside Main Menu */}
            <div className="flex justify-center mb-3">
              <div className="flex items-center bg-slate-950 rounded-full p-1 border border-slate-800 gap-1">
                {(['uz', 'en', 'ru'] as Language[]).map((lng) => (
                  <button
                    key={lng}
                    onClick={() => handleLanguageChange(lng)}
                    className={`px-3 py-1 text-xs font-black rounded-full transition-all ${
                      language === lng
                        ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lng === 'uz' ? '🇺🇿 O\'zbek' : lng === 'en' ? '🇬🇧 English' : '🇷🇺 Русский'}
                  </button>
                ))}
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>{t.tagline}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-0.5">
              {t.title}
            </h1>
            <p className="text-xs sm:text-sm font-extrabold tracking-widest text-amber-400 uppercase mb-3">
              {t.subtitle}
            </p>

            <p className="text-xs text-slate-300 leading-relaxed mb-4 px-1">
              {t.briefing}
            </p>

            {/* Battle Records Row */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 mb-4 text-center">
              <div>
                <span className="text-[10px] text-slate-500 block font-semibold">{t.best}</span>
                <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">{stats.highScore}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-semibold">{t.totalKills}</span>
                <span className="text-xs sm:text-sm font-black text-rose-400 font-mono">{battleStats.totalKills}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-semibold">{t.totalVictories}</span>
                <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">{battleStats.totalVictories}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => handleDeployLevel(stats.unlockedLevel)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/30 active:scale-98 transition-all flex items-center justify-center gap-2 group cursor-pointer animate-pulse"
              >
                <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
                <span>{t.startGame} (SECTOR {stats.unlockedLevel})</span>
              </button>

              <button
                onClick={() => setShowLevelSelect(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs tracking-wide active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.missionSelect}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setShowIntel(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.intelAndCrates}</span>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>{t.desktopControls.split(':')[0]}: <strong>WASD / ENTER</strong></span>
              <span>6 SECTORS</span>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY: Level Select Screen */}
      {showLevelSelect && (
        <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-amber-400" />
                <span>{t.missionSelect}</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                6 SECTORS
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">{t.highestSector}: Sector {stats.unlockedLevel}</p>

            <div className="flex flex-col gap-2.5 mb-4 overflow-y-auto pr-1 max-h-[58vh]">
              {LEVELS.map((lvl) => {
                const isUnlocked = lvl.id <= stats.unlockedLevel;
                return (
                  <div
                    key={lvl.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isUnlocked
                        ? 'bg-slate-800/80 border-slate-700 hover:border-amber-400/50 cursor-pointer'
                        : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                    }`}
                    onClick={() => isUnlocked && handleDeployLevel(lvl.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {isUnlocked ? (
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span className="font-extrabold text-sm text-slate-100">{lvl.name}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">
                        {lvl.waves.length} HOSTILES
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] text-amber-400/90 font-semibold">{lvl.codeName}</span>
                      {lvl.theme && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {lvl.theme.name}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{lvl.terrainSummary}</div>

                    {isUnlocked && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeployLevel(lvl.id);
                        }}
                        className="mt-2 w-full py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>{t.startGame}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowLevelSelect(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
            >
              {t.backToHQ}
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY: Tactical Intel / Crates Modal (Supports UZ, EN, RU) */}
      {showIntel && (
        <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-400" />
                <span>{t.intelTitle}</span>
              </h2>

              {/* Language Switch Tabs inside Intel Modal */}
              <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 gap-1">
                {(['uz', 'en', 'ru'] as Language[]).map((lng) => (
                  <button
                    key={lng}
                    onClick={() => handleLanguageChange(lng)}
                    className={`px-2 py-1 text-[11px] font-black rounded ${
                      language === lng
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    } transition-colors`}
                  >
                    {lng.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-4">{t.intelSubtitle}</p>

            <div className="space-y-4 text-xs mb-5">
              {/* Tactical Crates Section */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-black text-amber-400 text-sm block mb-1">{t.cratesTitle}</span>
                <p className="text-slate-400 text-[11px] mb-3">{t.cratesSubtitle}</p>

                <div className="grid grid-cols-1 gap-2.5">
                  {t.crates.map((crate, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                      <div className="text-2xl">{crate.icon}</div>
                      <div>
                        <strong className="text-amber-300 font-bold block text-xs">{crate.name}</strong>
                        <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">{crate.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hostiles Section (including Commander Smart Tank) */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-black text-amber-400 text-sm block mb-2">{t.hostilesTitle}</span>
                <div className="space-y-2">
                  {t.enemies.map((enemy, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-slate-100">{enemy.name}</span>
                          <span
                            className="text-[9px] font-black px-1.5 py-0.5 rounded text-slate-950"
                            style={{ backgroundColor: enemy.color }}
                          >
                            {enemy.badge}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{enemy.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Controls & Mechanics */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-black text-amber-400 text-sm block mb-1">{t.controlsTitle}</span>
                <p className="text-slate-300">⚡ <strong>{t.autoFireDesc}</strong></p>
                <p className="text-slate-300">🛡️ <strong>{t.reinforcedArmorDesc}</strong></p>
                <p className="text-slate-300">💻 {t.desktopControls}</p>
                <p className="text-slate-300">📱 {t.mobileControls}</p>
              </div>
            </div>

            <button
              onClick={() => setShowIntel(false)}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer shadow-md"
            >
              OK / {t.backToHQ}
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY: Pause Modal */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center">
            <h2 className="text-2xl font-black text-white mb-1">{t.resumeGame}</h2>
            <p className="text-xs text-slate-400 mb-5">{currentLevelDef.name}</p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => engineRef.current?.resume()}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs tracking-wider cursor-pointer"
              >
                {t.resumeGame}
              </button>

              <button
                onClick={() => engineRef.current?.restartCurrentLevel()}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.restartSector}</span>
              </button>

              <button
                onClick={() => {
                  engineRef.current?.pause();
                  setGameState('menu');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 font-semibold text-xs cursor-pointer"
              >
                {t.abortToMenu}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY: Level Completed Modal */}
      {gameState === 'level_clear' && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />

            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6" />
            </div>

            <h2 className="text-2xl font-black text-white mb-1">{t.sectorSecured}</h2>
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">
              {currentLevelDef.codeName}
            </p>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 mb-5 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">{t.score}:</span>
                <span className="font-mono font-bold text-amber-400">{levelClearInfo.score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.totalKills}:</span>
                <span className="font-mono text-slate-200">{levelClearInfo.enemiesDefeated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Base Bonus:</span>
                <span className="font-mono text-emerald-400">+{levelClearInfo.baseBonus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Life Bonus:</span>
                <span className="font-mono text-emerald-400">+{levelClearInfo.livesBonus}</span>
              </div>
            </div>

            <button
              onClick={handleNextLevel}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs tracking-wider shadow-lg shadow-emerald-500/25 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{t.advanceSector} {levelClearInfo.levelId + 1}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY: Game Over Modal */}
      {gameState === 'game_over' && (
        <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />

            <h2 className="text-2xl font-black text-rose-500 mb-1">{t.missionFailed}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              {gameOverInfo.reason}
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-5 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">{t.score}:</span>
                <span className="font-mono font-bold text-amber-400">{gameOverInfo.score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.sector}:</span>
                <span className="font-mono text-slate-200">Sector {gameOverInfo.levelId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.best}:</span>
                <span className="font-mono text-slate-200">{stats.highScore}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleDeployLevel(gameOverInfo.levelId)}
                className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs tracking-wider shadow-lg shadow-amber-400/25 active:scale-98 transition-all cursor-pointer"
              >
                {t.retrySector}
              </button>

              <button
                onClick={() => setGameState('menu')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                {t.returnToMenu}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY: Campaign Victory Modal */}
      {gameState === 'victory' && (
        <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-amber-500/50 rounded-2xl p-6 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500" />

            <div className="w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto mb-3 animate-bounce">
              <Award className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-amber-400 mb-1">{t.campaignComplete}</h2>
            <p className="text-xs font-extrabold text-slate-300 uppercase tracking-widest mb-4">
              ALL 6 SECTORS SECURED
            </p>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {t.campaignVictoryMsg}
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-5 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">{t.score}:</span>
                <span className="font-mono font-bold text-amber-400 text-base">{victoryScore || stats.score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.best}:</span>
                <span className="font-mono text-slate-200">{stats.highScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.totalKills}:</span>
                <span className="font-mono text-emerald-400">{battleStats.totalKills}</span>
              </div>
            </div>

            <button
              onClick={() => setGameState('menu')}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs tracking-wider shadow-lg shadow-amber-500/25 active:scale-98 transition-all cursor-pointer"
            >
              {t.backToHQ}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
