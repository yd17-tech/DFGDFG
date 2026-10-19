import React from 'react';
import { Briefcase, X, Atom, BookOpen } from 'lucide-react';
import { ElementSymbol } from '../types/game';
import { ELEMENTS } from '../data/chemistry';

interface ElementInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: { [key in ElementSymbol]?: number };
}

export const ElementInventoryModal: React.FC<ElementInventoryModalProps> = ({
  isOpen,
  onClose,
  elements
}) => {
  if (!isOpen) return null;

  const totalAtoms = Object.values(elements).reduce((acc, c) => acc + (c || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none">
      <div className="w-full max-w-3xl bg-slate-900 border border-cyan-500/50 rounded-2xl p-5 sm:p-6 shadow-2xl relative text-slate-100 my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">소지 원소 가방 (Element Inventory)</h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/40">
                총 {totalAtoms}개 원자
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              탐색을 통해 수집한 화학 원소 목록과 원자 특성입니다.
            </p>
          </div>
        </div>

        {/* Elements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
          {(Object.keys(ELEMENTS) as ElementSymbol[]).map((symbol) => {
            const el = ELEMENTS[symbol];
            const count = elements[symbol] || 0;

            return (
              <div
                key={symbol}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                  count > 0 
                    ? 'bg-slate-950/90 border-slate-700 hover:border-cyan-400 shadow-md' 
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                }`}
              >
                <div>
                  {/* Top: Atomic Number & Mass */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>원자번호 #{el.atomicNumber}</span>
                    <span>{el.atomicMass.toFixed(2)} u</span>
                  </div>

                  {/* Center: Large Symbol & Korean Name */}
                  <div className="flex items-center gap-3 my-1">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-2xl shadow-inner border"
                      style={{
                        backgroundColor: el.bgColor,
                        color: el.color,
                        borderColor: el.color
                      }}
                    >
                      {el.symbol}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100">{el.nameKo.split(' ')[0]}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{el.nameEn}</div>
                      <div className="text-[11px] font-bold font-mono text-cyan-300 mt-0.5">
                        보유: {count}개
                      </div>
                    </div>
                  </div>

                  {/* Chemical Valency info */}
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Atom className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>결합수: {el.valency.join(', ')}가</span>
                  </div>

                  {/* Educational Description & Hint */}
                  <p className="mt-1.5 text-[11px] text-slate-300 leading-snug line-clamp-2">
                    {el.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-amber-300/90 leading-tight">
                  💡 {el.hint}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>원소가 부족할 경우 연구소 내 보관함을 추가 수색하거나 중화 반응을 고려하세요.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-colors cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
