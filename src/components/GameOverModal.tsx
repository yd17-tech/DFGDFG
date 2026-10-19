import React from 'react';
import { Skull, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  reason: 'OXYGEN_DEPLETED' | 'MONSTER_CAUGHT';
  onRestart: () => void;
  onResumeCheckpoint: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  reason,
  onRestart,
  onResumeCheckpoint
}) => {
  if (!isOpen) return null;

  const isOxygen = reason === 'OXYGEN_DEPLETED';

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-slate-950 border border-red-600/80 rounded-2xl p-6 shadow-2xl text-slate-100 text-center relative overflow-hidden">
        {/* Red emergency pulse backdrop */}
        <div className="absolute inset-0 bg-red-950/20 animate-pulse pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-950/90 border border-red-500 text-red-500 mb-4 shadow-lg shadow-red-900/40">
            <Skull className="w-9 h-9" />
          </div>

          <h2 className="text-2xl font-black text-red-500 tracking-wide uppercase">
            {isOxygen ? '산소 고갈 (Asphyxiation)' : '외눈 거인에게 포획됨 (Captured)'}
          </h2>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {isOxygen 
              ? '체내 산소 수치가 0%에 도달하여 의식을 잃었습니다. 질주 시 심박수가 급상승하여 산소가 빠르게 소모되므로 주의해야 합니다.' 
              : '어둠 속에서 발소리나 격렬한 움직임으로 위치가 발각되어 거인에게 포획되었습니다. HCl 눈뽕, NH₃ 악취, H₂SO₄ 슬로우를 전술적으로 활용하세요!'}
          </p>

          {/* Scientific Survival Tip */}
          <div className="my-5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-left text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>화학 전술 조언 (Tactical Tip)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {isOxygen
                ? '산소 원자 2개를 결합(O₂)하여 고농축 산소팩을 즉시 흡입하면 산소를 +25% 회복할 수 있습니다.'
                : '괴물이 15m 이내로 접근했을 때 HCl(H+Cl)을 발사해 눈을 멀게 하거나, NH₃(N+3H)를 터뜨려 후각을 마비시키면 안전하게 거리를 벌릴 수 있습니다.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <button
              onClick={onResumeCheckpoint}
              className="w-full py-3 px-4 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/50 hover:scale-[1.01] active:scale-98 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>체크포인트에서 즉시 재도전</span>
            </button>

            <button
              onClick={onRestart}
              className="w-full py-2.5 px-4 rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center gap-2 transition-all text-xs cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>연구소 입구부터 처음으로 다시 시작</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
