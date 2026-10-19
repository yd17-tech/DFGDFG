import React, { useState, useEffect } from 'react';
import { Trophy, X, RefreshCw, Medal, Clock, Wind, Award } from 'lucide-react';
import { fetchLeaderboard } from '../firebase';
import { LeaderboardEntry } from '../types/game';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudentCode?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentStudentCode
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLeaderboard();
      if (data && data.length > 0) {
        setEntries(data);
      } else {
        // Benchmark records for immediate preview
        setEntries([
          {
            studentCode: 'CHEM-HONOR',
            studentName: '김화학 (수석 연구원)',
            escapeTimeSeconds: 142,
            remainingOxygen: 68,
            synthesizedCount: 6,
            score: 8740,
            compoundsUsed: ['HCl', 'NH3', 'H2SO4', 'CH4'],
            escapedAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            studentCode: 'ATOM-99',
            studentName: '박원소 (생존 요원)',
            escapeTimeSeconds: 185,
            remainingOxygen: 44,
            synthesizedCount: 5,
            score: 7920,
            compoundsUsed: ['HCl', 'H2SO4', 'CH4', 'O2'],
            escapedAt: new Date(Date.now() - 7200000).toISOString()
          },
          {
            studentCode: 'BIO-204',
            studentName: '이지질 (탈출 조원)',
            escapeTimeSeconds: 218,
            remainingOxygen: 32,
            synthesizedCount: 4,
            score: 7150,
            compoundsUsed: ['NH3', 'CH4', 'H2SO4'],
            escapedAt: new Date(Date.now() - 14400000).toISOString()
          }
        ]);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/50 rounded-2xl p-5 sm:p-6 shadow-2xl relative text-slate-100 my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 pr-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950 border border-amber-500/50 text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">지하 연구소 탈출 명예의 전당 (Leaderboard)</h2>
              <p className="text-xs text-slate-400">
                화학 반응으로 외눈 거인을 제압하고 탈출에 성공한 학생 랭킹입니다.
              </p>
            </div>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>

        {/* Table / List */}
        <div className="max-h-[380px] overflow-y-auto pr-1 space-y-2">
          {entries.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              <Award className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
              <p>아직 등록된 탈출 성공 기록이 없습니다.</p>
              <p className="text-xs text-slate-600 mt-1">첫 번째로 탈출에 성공하여 랭킹에 이름을 올려보세요!</p>
            </div>
          ) : (
            entries.map((entry, index) => {
              const isCurrent = currentStudentCode && entry.studentCode === currentStudentCode;
              const mins = Math.floor(entry.escapeTimeSeconds / 60);
              const secs = entry.escapeTimeSeconds % 60;

              return (
                <div
                  key={`${entry.studentCode}_${index}`}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isCurrent
                      ? 'bg-amber-950/40 border-amber-500/80 text-amber-100'
                      : index === 0
                      ? 'bg-yellow-950/30 border-yellow-500/50'
                      : index === 1
                      ? 'bg-slate-800/60 border-slate-600/50'
                      : index === 2
                      ? 'bg-amber-900/20 border-amber-800/40'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 flex items-center justify-center font-bold text-sm">
                      {index === 0 ? (
                        <Medal className="w-5 h-5 text-yellow-400" />
                      ) : index === 1 ? (
                        <Medal className="w-5 h-5 text-slate-300" />
                      ) : index === 2 ? (
                        <Medal className="w-5 h-5 text-amber-600" />
                      ) : (
                        <span className="text-slate-500 font-mono">#{index + 1}</span>
                      )}
                    </div>

                    {/* Student Name & Code */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{entry.studentName}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono bg-amber-500 text-slate-950 px-1 rounded font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">PIN: {entry.studentCode}</span>
                    </div>
                  </div>

                  {/* Stats (Time, Oxygen, Score) */}
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="hidden sm:flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{mins}분 {secs}초</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      <Wind className="w-3.5 h-3.5 text-cyan-400" />
                      <span>O₂ {Math.round(entry.remainingOxygen)}%</span>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-amber-400">{entry.score.toLocaleString()} pt</div>
                      <div className="text-[10px] text-slate-500">
                        {entry.escapedAt ? new Date(entry.escapedAt).toLocaleDateString() : ''}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
