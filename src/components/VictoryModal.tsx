import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle, Clock, Wind, Sparkles, Award, RotateCcw } from 'lucide-react';
import { sound } from '../utils/sound';

interface VictoryModalProps {
  isOpen: boolean;
  studentName: string;
  studentCode: string;
  escapeTimeSeconds: number;
  remainingOxygen: number;
  craftedCount: number;
  score: number;
  compoundsUsed: string[];
  onOpenLeaderboard: () => void;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  studentName,
  studentCode,
  escapeTimeSeconds,
  remainingOxygen,
  craftedCount,
  score,
  compoundsUsed,
  onOpenLeaderboard,
  onPlayAgain
}) => {
  useEffect(() => {
    if (isOpen) {
      sound.playSynthesizeSuccess();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const mins = Math.floor(escapeTimeSeconds / 60);
  const secs = escapeTimeSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 my-auto text-center">
        {/* Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-400 text-emerald-400 mb-3 shadow-lg shadow-emerald-950">
            <Trophy className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
            연구소 탈출 성공! (ESCAPED)
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            황산(H₂SO₄)으로 거인의 발을 묶고 메탄(CH₄) 폭발로 방폭벽을 부수고 지상으로 탈출했습니다!
          </p>

          {/* Student Badge & Cloud confirmation */}
          <div className="my-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-emerald-500/40 text-xs font-mono text-emerald-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>{studentName} ({studentCode}) 님의 기록이 Firebase 랭킹에 등록되었습니다</span>
          </div>

          {/* Score & Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <Clock className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <div className="text-[10px] text-slate-400">탈출 소요 시간</div>
              <div className="font-bold text-sm text-cyan-200 mt-0.5">{mins}분 {secs}초</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <Wind className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-[10px] text-slate-400">산소 잔여량</div>
              <div className="font-bold text-sm text-emerald-300 mt-0.5">{Math.round(remainingOxygen)}%</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <Sparkles className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <div className="text-[10px] text-slate-400">화학 분자 합성</div>
              <div className="font-bold text-sm text-purple-300 mt-0.5">{craftedCount}회</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 bg-amber-950/20">
              <Award className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-[10px] text-amber-300">최종 과학 점수</div>
              <div className="font-bold text-sm text-amber-400 mt-0.5">{score.toLocaleString()} pt</div>
            </div>
          </div>

          {/* Core Science Certificate */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-left text-xs mb-5">
            <div className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
              <span>🔬 화학 결합 & 반응 마스터 인증</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              "우리 주변의 모든 물질은 원자의 결합이며, 화학 반응 지식으로 위기 상황을 극복할 수 있다."
            </p>
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              {compoundsUsed.map((comp) => (
                <span key={comp} className="px-2 py-0.5 rounded bg-slate-900 border border-cyan-800 text-cyan-300 font-mono text-[10px]">
                  {comp}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={onOpenLeaderboard}
              className="flex-1 py-3 px-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-950 hover:scale-[1.01] active:scale-98 cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>명예의 전당 랭킹 확인</span>
            </button>

            <button
              onClick={onPlayAgain}
              className="py-3 px-4 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>새로운 도전하기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
