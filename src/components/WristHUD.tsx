import React from 'react';
import { 
  Heart, 
  Wind, 
  Briefcase, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Trophy, 
  User, 
  ShieldAlert,
  Save
} from 'lucide-react';
import { ElementSymbol } from '../types/game';

interface WristHUDProps {
  oxygen: number;
  heartRate: number;
  noiseLevel: number;
  elements: { [key in ElementSymbol]?: number };
  studentCode: string;
  studentName: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenInventory: () => void;
  onOpenLeaderboard: () => void;
  onOpenRules: () => void;
  onManualSave: () => void;
  saveStatusText: string;
}

export const WristHUD: React.FC<WristHUDProps> = ({
  oxygen,
  heartRate,
  noiseLevel,
  elements,
  studentCode,
  studentName,
  isMuted,
  onToggleMute,
  onOpenInventory,
  onOpenLeaderboard,
  onOpenRules,
  onManualSave,
  saveStatusText
}) => {
  // Count total atoms collected
  const totalElements = Object.values(elements).reduce((acc, count) => acc + (count || 0), 0);

  // Oxygen alert style
  const isOxygenCritical = oxygen <= 20;
  const isHeartRateHigh = heartRate >= 135;

  return (
    <header className="w-full bg-slate-950/90 border-b border-cyan-800/40 backdrop-blur-md px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-slate-100 select-none shadow-xl">
      {/* Left: Bio-Wristband Monitor (Oxygen & Heart Rate) */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Oxygen Gauge */}
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border ${
            isOxygenCritical 
              ? 'bg-red-950 border-red-500 text-red-400 animate-pulse' 
              : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-400'
          }`}>
            <Wind className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>산소 잔여량 (O₂)</span>
              {isOxygenCritical && (
                <span className="text-[10px] text-red-400 font-bold animate-ping">CRITICAL</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-base sm:text-lg font-black font-mono tracking-tight ${
                isOxygenCritical ? 'text-red-400' : oxygen < 40 ? 'text-amber-400' : 'text-cyan-300'
              }`}>
                {Math.round(oxygen)}%
              </span>
              <div className="w-16 sm:w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className={`h-full transition-all duration-300 ${
                    isOxygenCritical ? 'bg-red-500 animate-pulse' : oxygen < 40 ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${Math.max(2, oxygen)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Heart Rate (BPM) */}
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border ${
            isHeartRateHigh 
              ? 'bg-rose-950 border-rose-500 text-rose-400 animate-bounce' 
              : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
          }`}>
            <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">심박수 (BPM)</span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className={`text-base sm:text-lg font-black ${
                isHeartRateHigh ? 'text-rose-400' : heartRate > 100 ? 'text-amber-300' : 'text-emerald-300'
              }`}>
                {Math.round(heartRate)}
              </span>
              <span className="text-[10px] text-slate-500">bpm</span>
              {/* EKG mini wave */}
              <span className={`text-[11px] ${isHeartRateHigh ? 'text-rose-500 font-bold' : 'text-emerald-500'}`}>
                {isHeartRateHigh ? '▲▲ 질주/공포' : '─/\─ 정상'}
              </span>
            </div>
          </div>
        </div>

        {/* Noise / Vibration Meter */}
        <div className="hidden lg:flex items-center gap-2 border-l border-slate-800 pl-4">
          <div className={`p-1.5 rounded-lg border ${
            noiseLevel > 60 
              ? 'bg-amber-950 border-amber-500 text-amber-400 animate-pulse' 
              : 'bg-slate-900 border-slate-700 text-slate-400'
          }`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">진동/소음 감지</span>
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className={`h-full transition-all duration-200 ${
                    noiseLevel > 60 ? 'bg-rose-500' : noiseLevel > 30 ? 'bg-amber-400' : 'bg-blue-400'
                  }`}
                  style={{ width: `${Math.max(2, noiseLevel)}%` }}
                />
              </div>
              <span className="text-xs font-mono text-slate-400">{Math.round(noiseLevel)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Actions, Element Inventory Bag, Student Info, Settings */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Element Bag Button (소지 원소 가방) */}
        <button
          onClick={onOpenInventory}
          className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-200 transition-all hover:scale-105 active:scale-95 shadow-md group cursor-pointer"
          title="소지한 화학 원소 가방 열기"
        >
          <Briefcase className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span className="text-xs sm:text-sm font-bold">원소 가방</span>
          <span className="px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 font-mono font-bold text-xs">
            {totalElements}
          </span>
        </button>

        {/* Student Profile PIN Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-300 font-semibold">{studentName || '요원'}</span>
          <span className="text-cyan-400 font-mono text-[11px] bg-cyan-950 px-1 py-0.5 rounded border border-cyan-800/60">
            {studentCode || 'GUEST'}
          </span>
        </div>

        {/* Save button & status */}
        <button
          onClick={onManualSave}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
          title="현재 진행상황 Firebase 클라우드 저장"
        >
          <Save className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline text-[11px]">{saveStatusText || '저장'}</span>
        </button>

        {/* Leaderboard button */}
        <button
          onClick={onOpenLeaderboard}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 hover:text-amber-300 transition-all cursor-pointer"
          title="학생 탈출 랭킹 보기"
        >
          <Trophy className="w-4 h-4" />
        </button>

        {/* Chemical Help / Rules Guide button */}
        <button
          onClick={onOpenRules}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer"
          title="게임 규칙 및 화학 공식 가이드"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Audio Mute / Unmute */}
        <button
          onClick={onToggleMute}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            isMuted 
              ? 'bg-rose-950/60 border-rose-800/80 text-rose-400' 
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title={isMuted ? '음소거 해제' : '음소거'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
