import React from 'react';
import { 
  Play, 
  FlaskConical, 
  EyeOff, 
  Wind, 
  Biohazard, 
  Flame, 
  Ear, 
  Heart, 
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';

interface IntroRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartOrResume?: () => void;
}

export const IntroRulesModal: React.FC<IntroRulesModalProps> = ({
  isOpen,
  onClose,
  onStartOrResume
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/50 rounded-2xl p-5 sm:p-7 shadow-2xl relative text-slate-100 my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-400">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300">
              ChemEscape: 지하 연구소의 탈출
            </h2>
            <p className="text-xs text-slate-400">
              화학 결합(분자식)과 반응 지식을 전술적으로 활용하는 과학 생존 탈출 게임
            </p>
          </div>
        </div>

        {/* Creator Intent Quote Banner */}
        <div className="mb-5 p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-xs sm:text-sm text-cyan-200 flex items-start gap-2.5 leading-relaxed">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">핵심 메시지: </strong>
            "우리 주변의 모든 물질은 원자의 결합이며, 화학 반응 지식으로 위기 상황을 극복할 수 있다."
          </div>
        </div>

        {/* Section 1: Narrative Flow (진행 흐름) */}
        <div className="mb-5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
            <span>진행 흐름 (Mission Flow)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Step 1 */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 font-mono font-bold text-[10px]">
                  01. 시작
                </span>
                <h4 className="font-bold text-slate-200 mt-1.5 mb-1">수용실 기상 & 원소 수집</h4>
                <p className="text-slate-400 text-[11px] leading-snug">
                  지하 비밀 연구소 수용실에서 눈을 뜨고, 주변 보관함을 수색해 H, C, O, N, S, Cl, Na 원소를 수집합니다.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 font-mono font-bold text-[10px]">
                  02. 전개
                </span>
                <h4 className="font-bold text-slate-200 mt-1.5 mb-1">괴물 추적 회피 & 화학 합성</h4>
                <p className="text-slate-400 text-[11px] leading-snug">
                  청각·후각이 극도로 발달한 외눈 거인을 피해 조심히 이동하며, 손목 합성기로 전술 화학 물질을 제조합니다.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 font-mono font-bold text-[10px]">
                  03. 결말
                </span>
                <h4 className="font-bold text-slate-200 mt-1.5 mb-1">황산 발 묶기 & 메탄 벽 폭파</h4>
                <p className="text-slate-400 text-[11px] leading-snug">
                  황산(H₂SO₄)으로 거인의 발을 묶고, 메탄(CH₄) 가스 연소 폭발로 방폭벽을 뚫고 지상으로 탈출합니다!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Core Rules & Chemical Skills */}
        <div className="mb-5 space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-1">
            핵심 생존 규칙 및 전술 화학 스킬
          </h3>

          {/* Tactical chemical skills grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* HCl */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-lime-800/50 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-lime-950 text-lime-400 shrink-0">
                <EyeOff className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <strong className="text-lime-300 font-mono">HCl (H + Cl)</strong>
                  <span className="text-[10px] text-lime-400/80 bg-lime-950/80 px-1 rounded">눈뽕 기절</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  염화수소 자극 가스를 거인의 외눈에 분사하여 8초간 통증 기절 및 후퇴시킵니다.
                </p>
              </div>
            </div>

            {/* NH3 */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-purple-800/50 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-purple-950 text-purple-400 shrink-0">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <strong className="text-purple-300 font-mono">NH₃ (N + 3H)</strong>
                  <span className="text-[10px] text-purple-400/80 bg-purple-950/80 px-1 rounded">악취 마비</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  강렬한 알칼리성 암모니아 악취로 괴물의 예민한 후각을 10초간 완전히 마비시킵니다.
                </p>
              </div>
            </div>

            {/* H2SO4 */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-800/50 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 shrink-0">
                <Biohazard className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <strong className="text-amber-300 font-mono">H₂SO₄ (2H + S + 4O)</strong>
                  <span className="text-[10px] text-amber-400/80 bg-amber-950/80 px-1 rounded">슬로우 늪</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  바닥에 진한 황산 부식성 늪을 깔아 거인의 발을 녹이고 이동속도를 75% 감소시킵니다.
                </p>
              </div>
            </div>

            {/* CH4 */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-orange-800/50 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-orange-950 text-orange-400 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <strong className="text-orange-300 font-mono">CH₄ (C + 4H)</strong>
                  <span className="text-[10px] text-orange-400/80 bg-orange-950/80 px-1 rounded">벽 폭파</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  고에너지 메탄 가스를 방폭벽에 주입해 폭파시킵니다. (2회 점화 폭발 시 최종 탈출 성공!)
                </p>
              </div>
            </div>
          </div>

          {/* Environmental stealth & bio-mechanics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
              <Ear className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <strong className="text-slate-200">청각·진동 센서 시스템</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  뛰거나 소음을 내면 괴물이 즉시 추적합니다. '살금살금 걷기'와 '엄폐'를 활용하세요.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <strong className="text-slate-200">산소 타임어택 & 심박수 (BPM)</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  산소가 0%가 되면 질식합니다. 질주하면 심박수가 치솟아 산소가 더 빠르게 소모됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={() => {
            onClose();
            if (onStartOrResume) onStartOrResume();
          }}
          className="w-full py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/25 hover:scale-[1.01] active:scale-98 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>연구소 진입 및 생존 시작</span>
        </button>
      </div>
    </div>
  );
};
