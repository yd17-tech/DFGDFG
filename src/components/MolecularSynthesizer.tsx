import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  Plus, 
  Minus, 
  Trash2, 
  EyeOff, 
  Wind, 
  Biohazard, 
  Flame, 
  HeartPulse, 
  Droplets,
  Footprints,
  Shield,
  Zap,
  FastForward
} from 'lucide-react';
import { ElementSymbol, CompoundId } from '../types/game';
import { ELEMENTS, COMPOUNDS } from '../data/chemistry';
import { sound } from '../utils/sound';

interface MolecularSynthesizerProps {
  elements: { [key in ElementSymbol]?: number };
  inventoryCompounds: { [key in CompoundId]?: number };
  onSynthesize: (formula: CompoundId, required: { [key in ElementSymbol]?: number }) => void;
  onDeployCompound: (compoundId: CompoundId) => void;
  onMoveStealth: () => void;
  onSprint: () => void;
  onTakeCover: () => void;
  isHiding: boolean;
  isSprinting: boolean;
  stage: string;
}

export const MolecularSynthesizer: React.FC<MolecularSynthesizerProps> = ({
  elements,
  inventoryCompounds,
  onSynthesize,
  onDeployCompound,
  onMoveStealth,
  onSprint,
  onTakeCover,
  isHiding,
  isSprinting,
  stage
}) => {
  // Current element selected on the dial
  const elementList: ElementSymbol[] = ['H', 'C', 'O', 'N', 'S', 'Cl', 'Na'];
  const [selectedElementIndex, setSelectedElementIndex] = useState<number>(0);

  // Staged atoms for chemical combination
  const [stagedAtoms, setStagedAtoms] = useState<{ [key in ElementSymbol]?: number }>({});
  const [synthesisMessage, setSynthesisMessage] = useState<{ text: string; isSuccess?: boolean } | null>(null);

  const currentElementSymbol = elementList[selectedElementIndex];
  const currentElement = ELEMENTS[currentElementSymbol];
  const availableCount = elements[currentElementSymbol] || 0;

  // Rotate dial
  const rotateDial = (direction: 'next' | 'prev') => {
    sound.playClick();
    if (direction === 'next') {
      setSelectedElementIndex((prev) => (prev + 1) % elementList.length);
    } else {
      setSelectedElementIndex((prev) => (prev - 1 + elementList.length) % elementList.length);
    }
  };

  // Add atom to synthesis chamber
  const addAtom = (symbol: ElementSymbol) => {
    const totalAvail = elements[symbol] || 0;
    const currentStaged = stagedAtoms[symbol] || 0;
    if (currentStaged >= totalAvail) {
      sound.playSynthesizeError();
      setSynthesisMessage({ text: `${symbol} 원소의 소지량이 부족합니다!`, isSuccess: false });
      return;
    }
    sound.playClick();
    setStagedAtoms((prev) => ({
      ...prev,
      [symbol]: (prev[symbol] || 0) + 1
    }));
    setSynthesisMessage(null);
  };

  // Remove atom
  const removeAtom = (symbol: ElementSymbol) => {
    sound.playClick();
    setStagedAtoms((prev) => {
      const nextCount = (prev[symbol] || 0) - 1;
      if (nextCount <= 0) {
        const copy = { ...prev };
        delete copy[symbol];
        return copy;
      }
      return { ...prev, [symbol]: nextCount };
    });
    setSynthesisMessage(null);
  };

  // Clear chamber
  const clearChamber = () => {
    sound.playClick();
    setStagedAtoms({});
    setSynthesisMessage(null);
  };

  // Quick recipe auto-fill
  const loadRecipe = (compoundId: CompoundId) => {
    const comp = COMPOUNDS[compoundId];
    if (!comp) return;

    // Check availability
    let canFill = true;
    for (const [sym, needed] of Object.entries(comp.requiredElements)) {
      if ((elements[sym as ElementSymbol] || 0) < (needed || 0)) {
        canFill = false;
        break;
      }
    }

    if (!canFill) {
      sound.playSynthesizeError();
      setSynthesisMessage({ text: `${comp.nameKo} 합성에 필요한 원소가 부족합니다!`, isSuccess: false });
      return;
    }

    sound.playClick();
    setStagedAtoms(comp.requiredElements);
    setSynthesisMessage({ text: `공식 장전: ${comp.reactionEquation}`, isSuccess: true });
  };

  // Check matching compound for current staged atoms
  const findMatchingCompound = (): CompoundId | null => {
    for (const [id, comp] of Object.entries(COMPOUNDS)) {
      const required = comp.requiredElements;
      const reqKeys = Object.keys(required) as ElementSymbol[];
      const stagedKeys = Object.keys(stagedAtoms) as ElementSymbol[];

      if (reqKeys.length !== stagedKeys.length) continue;

      let match = true;
      for (const k of reqKeys) {
        if (required[k] !== stagedAtoms[k]) {
          match = false;
          break;
        }
      }
      if (match) return id as CompoundId;
    }
    return null;
  };

  const matchedCompoundId = findMatchingCompound();
  const matchedCompound = matchedCompoundId ? COMPOUNDS[matchedCompoundId] : null;

  // Execute synthesis
  const handleSynthesizeClick = () => {
    if (!matchedCompoundId || !matchedCompound) {
      sound.playSynthesizeError();
      setSynthesisMessage({
        text: '불안정한 화학 결합입니다! 화학식 규칙(HCl, NH₃, H₂SO₄, CH₄ 등)을 확인하세요.',
        isSuccess: false
      });
      return;
    }

    // Call synthesize in parent
    onSynthesize(matchedCompoundId, matchedCompound.requiredElements);
    sound.playSynthesizeSuccess();
    setSynthesisMessage({
      text: `[합성 성공] ${matchedCompound.nameKo} (${matchedCompound.formula}) 제조 완료!`,
      isSuccess: true
    });
    setStagedAtoms({});
  };

  return (
    <div className="w-full bg-slate-950/95 border-t border-cyan-800/50 backdrop-blur-md px-3 sm:px-6 py-3 text-slate-200 select-none shadow-2xl">
      {/* Top action row: Tactical Movement & Stealth Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            <span>이동 및 전술 행동:</span>
          </span>
          
          {/* Stealth Walk */}
          <button
            onClick={onMoveStealth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
            title="소리를 죽이고 천천히 전진 (소음 최소화)"
          >
            <Footprints className="w-3.5 h-3.5 text-cyan-400" />
            <span>살금살금 전진</span>
          </button>

          {/* Sprint */}
          <button
            onClick={onSprint}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              isSprinting
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="빠르게 질주 (심박수 및 진동 급증, 괴물 즉시 추적 주의!)"
          >
            <FastForward className="w-3.5 h-3.5 text-rose-400" />
            <span>질주하기 (주의)</span>
          </button>

          {/* Take Cover / Breath */}
          <button
            onClick={onTakeCover}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              isHiding
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="바리케이드 뒤에 숨어 심박수와 소음을 낮춤"
          >
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>{isHiding ? '엄폐 해제' : '엄폐 & 숨 참기'}</span>
          </button>
        </div>

        {/* Tactical Quick-Belt Launcher (제조된 화학 물질 즉시 사용) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-amber-400 font-bold font-mono mr-1">전술 화학 벨트:</span>

          {/* HCl Launcher */}
          <button
            onClick={() => onDeployCompound('HCl')}
            disabled={!inventoryCompounds.HCl}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
              inventoryCompounds.HCl 
                ? 'bg-lime-950/90 border-lime-500 text-lime-300 hover:scale-105 shadow-md shadow-lime-900/30 cursor-pointer' 
                : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="HCl (염화수소산 가스): 외눈 거인 안구에 분사하여 눈뽕 기절 (8초)"
          >
            <EyeOff className="w-3.5 h-3.5 text-lime-400" />
            <span>HCl 눈뽕 ({inventoryCompounds.HCl || 0})</span>
          </button>

          {/* NH3 Odor Mist */}
          <button
            onClick={() => onDeployCompound('NH3')}
            disabled={!inventoryCompounds.NH3}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
              inventoryCompounds.NH3 
                ? 'bg-purple-950/90 border-purple-500 text-purple-300 hover:scale-105 shadow-md shadow-purple-900/30 cursor-pointer' 
                : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="NH₃ (암모니아): 강한 악취로 괴물의 예민한 후각 마비 (10초)"
          >
            <Wind className="w-3.5 h-3.5 text-purple-400" />
            <span>NH₃ 악취 ({inventoryCompounds.NH3 || 0})</span>
          </button>

          {/* H2SO4 Acid Mire */}
          <button
            onClick={() => onDeployCompound('H2SO4')}
            disabled={!inventoryCompounds.H2SO4}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
              inventoryCompounds.H2SO4 
                ? 'bg-amber-950/90 border-amber-500 text-amber-300 hover:scale-105 shadow-md shadow-amber-900/30 cursor-pointer' 
                : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="H₂SO₄ (진한 황산): 바닥에 부식성 늪을 깔아 이동속도 75% 감소 (12초)"
          >
            <Biohazard className="w-3.5 h-3.5 text-amber-400" />
            <span>H₂SO₄ 늪 ({inventoryCompounds.H2SO4 || 0})</span>
          </button>

          {/* CH4 Demolition Blast */}
          <button
            onClick={() => onDeployCompound('CH4')}
            disabled={!inventoryCompounds.CH4}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
              inventoryCompounds.CH4 
                ? 'bg-orange-950/90 border-orange-500 text-orange-300 hover:scale-105 shadow-md shadow-orange-900/30 cursor-pointer' 
                : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="CH₄ (메탄 가스 폭약): 출구 방폭 격벽을 폭파하여 탈출구 개방!"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>CH₄ 폭파 ({inventoryCompounds.CH4 || 0})</span>
          </button>

          {/* O2 pack */}
          {inventoryCompounds.O2 ? (
            <button
              onClick={() => onDeployCompound('O2')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border bg-cyan-950/90 border-cyan-500 text-cyan-300 hover:scale-105 cursor-pointer"
              title="O₂ (고농축 산소팩): 산소 잔여량 +25% 즉시 회복"
            >
              <HeartPulse className="w-3.5 h-3.5 text-cyan-400" />
              <span>O₂ 흡입 ({inventoryCompounds.O2})</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Main Synthesizer Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Left: Futuristic Molecular Dial Selector (4 cols) */}
        <div className="lg:col-span-4 flex items-center gap-3 bg-slate-900/80 p-2.5 rounded-xl border border-cyan-900/50">
          {/* Dial Turn buttons */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => rotateDial('prev')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-400 hover:scale-105 transition-all cursor-pointer"
              title="이전 원소 다이얼 돌리기"
            >
              <RotateCw className="w-4 h-4 -scale-x-100" />
            </button>
            <button
              onClick={() => rotateDial('next')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-400 hover:scale-105 transition-all cursor-pointer"
              title="다음 원소 다이얼 돌리기"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Dial Focus Card */}
          <div className="flex-1 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950 border border-cyan-800/80 shadow-inner">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-xl shadow-md border"
                style={{ 
                  backgroundColor: currentElement.bgColor, 
                  color: currentElement.color,
                  borderColor: currentElement.color 
                }}
              >
                {currentElement.symbol}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100">{currentElement.nameKo.split(' ')[0]}</span>
                  <span className="text-[10px] font-mono text-slate-400">#{currentElement.atomicNumber}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  소지량: <strong className="text-cyan-300 font-mono">{availableCount}개</strong>
                </div>
              </div>
            </div>

            {/* Quick Add Atom Button */}
            <button
              onClick={() => addAtom(currentElementSymbol)}
              disabled={availableCount <= (stagedAtoms[currentElementSymbol] || 0)}
              className={`p-2 rounded-lg border font-bold transition-all ${
                availableCount > (stagedAtoms[currentElementSymbol] || 0)
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 border-cyan-400 shadow-md hover:scale-105 cursor-pointer'
                  : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
              }`}
              title="합성 챔버에 원자 투입"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Element Quick Carousel Dots */}
          <div className="flex flex-col gap-1">
            {elementList.map((sym, idx) => (
              <button
                key={sym}
                onClick={() => {
                  sound.playClick();
                  setSelectedElementIndex(idx);
                }}
                className={`w-4 h-2.5 rounded-sm transition-all cursor-pointer ${
                  selectedElementIndex === idx ? 'bg-cyan-400 w-6' : 'bg-slate-700 hover:bg-slate-500'
                }`}
                title={ELEMENTS[sym].nameKo}
              />
            ))}
          </div>
        </div>

        {/* Center: Reaction Chamber & Staged Atoms (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 p-2.5 rounded-xl border border-cyan-900/50 flex flex-col justify-between min-h-[88px]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
            <span>[분자 결합 챔버]</span>
            {Object.keys(stagedAtoms).length > 0 && (
              <button
                onClick={clearChamber}
                className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>비우기</span>
              </button>
            )}
          </div>

          {/* Staged Atom Chips */}
          <div className="flex items-center gap-2 flex-wrap min-h-[36px]">
            {Object.keys(stagedAtoms).length === 0 ? (
              <span className="text-xs text-slate-500 italic">
                다이얼에서 원소를 선택하고 '+' 버튼을 눌러 결합할 원자를 추가하세요.
              </span>
            ) : (
              (Object.keys(stagedAtoms) as ElementSymbol[]).map((sym) => (
                <div
                  key={sym}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs shadow-inner"
                >
                  <span 
                    className="font-bold font-mono"
                    style={{ color: ELEMENTS[sym].color }}
                  >
                    {sym}
                  </span>
                  <span className="font-mono text-cyan-300 font-bold">
                    ×{stagedAtoms[sym]}
                  </span>
                  <button
                    onClick={() => removeAtom(sym)}
                    className="text-slate-400 hover:text-rose-400 p-0.5 cursor-pointer"
                    title="1개 제거"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Chemical Analysis Feedback preview */}
          {matchedCompound ? (
            <div className="mt-1 text-xs text-emerald-300 flex items-center justify-between font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
              <span>결합 예측: <strong>{matchedCompound.nameKo} ({matchedCompound.formula})</strong></span>
              <span className="text-[11px] text-emerald-400">{matchedCompound.tacticalEffect.split(' ')[0]}</span>
            </div>
          ) : Object.keys(stagedAtoms).length > 0 ? (
            <div className="mt-1 text-[11px] text-amber-400/90 font-mono">
              안정된 분자식을 형성하도록 원자 비율을 조절하세요.
            </div>
          ) : null}
        </div>

        {/* Right: Synthesis Execute & Recipe Shortcuts (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-1.5">
          {/* Big Synthesize Button */}
          <button
            onClick={handleSynthesizeClick}
            disabled={!matchedCompound}
            className={`w-full py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
              matchedCompound
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 hover:scale-[1.02] shadow-cyan-500/25 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">화학 결합 합성</span>
          </button>

          {/* Quick Recipe Shortcuts */}
          <div className="grid grid-cols-4 gap-1">
            <button
              onClick={() => loadRecipe('HCl')}
              className="px-1 py-1 text-[11px] font-mono font-bold rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-lime-400 text-center cursor-pointer"
              title="HCl 염화수소 자동 배치 (H+Cl)"
            >
              HCl
            </button>
            <button
              onClick={() => loadRecipe('NH3')}
              className="px-1 py-1 text-[11px] font-mono font-bold rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-purple-400 text-center cursor-pointer"
              title="NH₃ 암모니아 자동 배치 (N+3H)"
            >
              NH₃
            </button>
            <button
              onClick={() => loadRecipe('H2SO4')}
              className="px-1 py-1 text-[11px] font-mono font-bold rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 text-center cursor-pointer"
              title="H₂SO₄ 황산 자동 배치 (2H+S+4O)"
            >
              H₂SO₄
            </button>
            <button
              onClick={() => loadRecipe('CH4')}
              className="px-1 py-1 text-[11px] font-mono font-bold rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-orange-400 text-center cursor-pointer"
              title="CH₄ 메탄 자동 배치 (C+4H)"
            >
              CH₄
            </button>
          </div>
        </div>
      </div>

      {/* Synthesis Message Banner */}
      {synthesisMessage && (
        <div className={`mt-2 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between border ${
          synthesisMessage.isSuccess 
            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200' 
            : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
        }`}>
          <span>{synthesisMessage.text}</span>
          <button 
            onClick={() => setSynthesisMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
