import React, { useState } from 'react';
import { KeyRound, User, Play, LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { loadStudentProgress, loginWithGoogle } from '../firebase';
import { StudentProgress } from '../types/game';

interface StudentAuthModalProps {
  isOpen: boolean;
  onStartNewGame: (code: string, name: string) => void;
  onResumeGame: (progress: StudentProgress) => void;
  currentCode: string;
  currentName: string;
  onClose?: () => void;
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onStartNewGame,
  onResumeGame,
  currentCode,
  currentName,
  onClose
}) => {
  const [code, setCode] = useState(currentCode || 'CHEM-101');
  const [name, setName] = useState(currentName || '학생 요원');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleResume = async () => {
    const cleanCode = code.trim().toUpperCase().replace(/[^a-zA-Z0-9_\-]/g, '');
    if (!cleanCode) {
      setErrorMsg('인증번호(학번 또는 PIN)를 입력해 주세요.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const saved = await loadStudentProgress(cleanCode);
      if (saved) {
        onResumeGame(saved);
      } else {
        setErrorMsg(`[${cleanCode}] 인증번호로 저장된 이전 게임 기록이 없습니다. '새 게임 시작'을 눌러주세요.`);
      }
    } catch {
      setErrorMsg('클라우드 저장소 확인 중 오류가 발생했습니다. 새 게임으로 시작할 수 있습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNew = () => {
    const cleanCode = code.trim().toUpperCase().replace(/[^a-zA-Z0-9_\-]/g, '') || 'CHEM-101';
    const cleanName = name.trim() || '연구 요원';
    onStartNewGame(cleanCode, cleanName);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await loginWithGoogle();
      if (res.user) {
        const generatedCode = (res.user.email?.split('@')[0] || res.user.uid.slice(0, 8)).toUpperCase();
        setCode(generatedCode);
        setName(res.user.displayName || '구글 요원');
        // Check if existing progress
        const saved = await loadStudentProgress(generatedCode);
        if (saved) {
          onResumeGame(saved);
        } else {
          onStartNewGame(generatedCode, res.user.displayName || '구글 요원');
        }
      }
    } catch (e: unknown) {
      console.warn("Google login canceled or failed:", e);
      setErrorMsg('구글 로그인에 실패했습니다. 일반 인증번호로 시작해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-cyan-500/50 rounded-2xl p-6 shadow-2xl relative text-slate-100">
        {/* Glow corner decoration */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/60 text-cyan-400 mb-3 shadow-lg shadow-cyan-950">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">학생 요원 인증 & 데이터 연동</h2>
          <p className="text-xs text-slate-400 mt-1">
            같은 인증번호(학번/PIN)를 입력하면 앱을 다시 켜도 언제든 이어서 플레이할 수 있습니다.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {/* Student Code / PIN Input */}
          <div>
            <label className="block text-xs font-semibold text-cyan-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>학생 인증번호 (학번 / PIN 번호)</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="예: CHEM-2026, 10204, MY-PIN"
              maxLength={24}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none font-mono text-cyan-200 text-sm"
            />
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>학생 이름 / 호출 부호 (Nickname)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 홍길동 (연구원)"
              maxLength={20}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-slate-100 text-sm"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleResume}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/30 hover:scale-[1.01] active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? '클라우드 확인 중...' : '기존 기록 이어서 하기 (Resume)'}</span>
          </button>

          <button
            onClick={handleStartNew}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer"
          >
            <Play className="w-4 h-4 text-emerald-400" />
            <span>새 게임 시작하기</span>
          </button>

          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900 px-2 text-slate-500">또는</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl font-semibold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center gap-2 transition-all text-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>구글 계정으로 연동 로그인</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-300 py-1 transition-colors cursor-pointer"
            >
              닫기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
