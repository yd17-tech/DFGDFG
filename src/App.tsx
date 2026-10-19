/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CorridorView 
} from './components/CorridorView';
import { WristHUD } from './components/WristHUD';
import { MolecularSynthesizer } from './components/MolecularSynthesizer';
import { StudentAuthModal } from './components/StudentAuthModal';
import { IntroRulesModal } from './components/IntroRulesModal';
import { ElementInventoryModal } from './components/ElementInventoryModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';

import { 
  ElementSymbol, 
  CompoundId, 
  GameStage, 
  StudentProgress, 
  LeaderboardEntry 
} from './types/game';
import { COMPOUNDS, ELEMENTS } from './data/chemistry';
import { sound } from './utils/sound';
import { saveStudentProgress, submitLeaderboardScore } from './firebase';
import { 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  Flame, 
  DoorOpen 
} from 'lucide-react';

export default function App() {
  // Player & Auth State
  const [studentCode, setStudentCode] = useState<string>('CHEM-101');
  const [studentName, setStudentName] = useState<string>('학생 요원');

  // Game Progress State
  const [stage, setStage] = useState<GameStage>('LAB_CELL');
  const [oxygen, setOxygen] = useState<number>(100);
  const [heartRate, setHeartRate] = useState<number>(75);
  const [noiseLevel, setNoiseLevel] = useState<number>(5);
  const [monsterDistance, setMonsterDistance] = useState<number>(45); // in meters
  const [wallIntegrity, setWallIntegrity] = useState<number>(100); // 0 to 100%

  // Tactical debuffs on monster
  const [monsterStunnedTime, setMonsterStunnedTime] = useState<number>(0);
  const [monsterSlowedTime, setMonsterSlowedTime] = useState<number>(0);
  const [monsterDistractedTime, setMonsterDistractedTime] = useState<number>(0);

  // Inventories
  const [elements, setElements] = useState<{ [key in ElementSymbol]?: number }>({
    H: 3,
    C: 1,
    O: 2,
    N: 1,
    Cl: 1,
    S: 1,
    Na: 1
  });
  const [inventoryCompounds, setInventoryCompounds] = useState<{ [key in CompoundId]?: number }>({});
  const [craftedHistory, setCraftedHistory] = useState<CompoundId[]>([]);
  const [scavengedLocations, setScavengedLocations] = useState<string[]>([]);
  const [chemicalLog, setChemicalLog] = useState<string[]>([
    '비밀 화학 연구실 수용실에서 정신을 차렸습니다. 주위 보관함을 수색해 원소를 확보하세요.'
  ]);

  // Player action state
  const [isHiding, setIsHiding] = useState<boolean>(false);
  const [isSprinting, setIsSprinting] = useState<boolean>(false);
  const [escapeTimeSeconds, setEscapeTimeSeconds] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [saveStatusText, setSaveStatusText] = useState<string>('저장됨');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState<boolean>(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState<boolean>(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<'OXYGEN_DEPLETED' | 'MONSTER_CAUGHT'>('OXYGEN_DEPLETED');
  const [isVictoryOpen, setIsVictoryOpen] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number>(0);

  // Check if initial visit, show Intro/Rules modal & unlock audio on user gesture
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('chemescape_has_seen_intro');
    if (!hasSeenIntro) {
      setIsRulesModalOpen(true);
      sessionStorage.setItem('chemescape_has_seen_intro', 'true');
    }

    const unlockAudio = () => {
      sound.startAtmosphere();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === '1') {
        handleDeployCompound('HCl');
      } else if (e.key === '2') {
        handleDeployCompound('NH3');
      } else if (e.key === '3') {
        handleDeployCompound('H2SO4');
      } else if (e.key === '4') {
        handleDeployCompound('CH4');
      } else if (e.key === '5') {
        handleDeployCompound('O2');
      } else if (e.key.toLowerCase() === 'w' || e.key === 'ArrowUp') {
        handleMoveStealth();
      } else if (e.key === 'Shift') {
        handleSprint();
      } else if (e.key.toLowerCase() === 'c' || e.key === ' ') {
        e.preventDefault();
        handleTakeCover();
      } else if (e.key.toLowerCase() === 'i') {
        setIsInventoryModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Sync mute state
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  // Log tactical notification
  const addLog = useCallback((msg: string) => {
    setChemicalLog((prev) => [msg, ...prev.slice(0, 19)]);
  }, []);

  // Save progress to Firebase Firestore
  const handleSaveToCloud = useCallback(async () => {
    if (stage === 'ESCAPED' || stage === 'GAME_OVER') return;
    setSaveStatusText('저장 중...');
    const progress: StudentProgress = {
      studentCode,
      studentName,
      stage,
      oxygen,
      heartRate,
      monsterDistance,
      elements,
      craftedCompounds: craftedHistory,
      chemicalLog,
      wallIntegrity,
      monsterStunnedTime,
      monsterSlowedTime,
      monsterDistractedTime,
      updatedAt: new Date().toISOString()
    };
    try {
      await saveStudentProgress(progress);
      setSaveStatusText('클라우드 저장됨');
      setTimeout(() => setSaveStatusText('저장'), 2500);
    } catch {
      setSaveStatusText('로컬 보관');
    }
  }, [
    studentCode,
    studentName,
    stage,
    oxygen,
    heartRate,
    monsterDistance,
    elements,
    craftedHistory,
    chemicalLog,
    wallIntegrity,
    monsterStunnedTime,
    monsterSlowedTime,
    monsterDistractedTime
  ]);

  // Auto-save progress every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleSaveToCloud();
    }, 15000);
    return () => clearInterval(timer);
  }, [handleSaveToCloud]);

  // Main game tick (every 1 second)
  useEffect(() => {
    if (stage === 'ESCAPED' || stage === 'GAME_OVER') return;

    const interval = setInterval(() => {
      setEscapeTimeSeconds((prev) => prev + 1);

      // 1. Oxygen Depletion & Heart Rate physics
      setOxygen((prevOx) => {
        // Base drain 0.25%/s. Higher heart rate drains oxygen faster!
        const rateFactor = 0.2 + (heartRate / 100) * 0.25;
        const multiplier = isSprinting ? 2.2 : isHiding ? 0.6 : 1.0;
        const newOx = Math.max(0, prevOx - rateFactor * multiplier);

        if (newOx <= 0) {
          setGameOverReason('OXYGEN_DEPLETED');
          setIsGameOverOpen(true);
          setStage('GAME_OVER');
          sound.playMonsterGrowl();
        }
        return newOx;
      });

      // 2. Heart rate decay / recovery
      setHeartRate((prevHr) => {
        if (isSprinting) {
          return Math.min(175, prevHr + 6);
        } else if (isHiding) {
          return Math.max(65, prevHr - 5);
        } else {
          // Slowly normalize to 80
          if (prevHr > 80) return Math.max(80, prevHr - 2);
          if (prevHr < 75) return Math.min(75, prevHr + 1);
          return prevHr;
        }
      });

      // 3. Noise level decay
      setNoiseLevel((prevNoise) => {
        if (isSprinting) {
          return Math.min(95, prevNoise + 15);
        } else if (isHiding) {
          return Math.max(3, prevNoise - 12);
        } else {
          return Math.max(10, prevNoise - 6);
        }
      });

      // 4. Debuffs on Monster (decrement timers)
      setMonsterStunnedTime((prev) => Math.max(0, prev - 1));
      setMonsterSlowedTime((prev) => Math.max(0, prev - 1));
      setMonsterDistractedTime((prev) => Math.max(0, prev - 1));

      // 5. Monster Movement & Proximity AI
      if (stage === 'DARK_CORRIDOR' || stage === 'EXIT_BLAST') {
        setMonsterDistance((prevDist) => {
          // If monster is stunned by HCl, cannot move
          if (monsterStunnedTime > 0) return prevDist;

          // If monster is distracted by NH3 odor, wanders backward!
          if (monsterDistractedTime > 0) {
            return Math.min(50, prevDist + 1.2);
          }

          // Base approach speed: 1.0 m/s
          let speed = 1.0;
          if (monsterSlowedTime > 0) {
            speed *= 0.25; // Slowed 75% by H2SO4!
          }

          // If noise is very loud or sprinting, monster sprints towards player!
          if (noiseLevel > 65 || isSprinting) {
            speed += 1.8;
          } else if (isHiding) {
            speed *= 0.5; // Loses track
          }

          const nextDist = prevDist - speed;

          if (nextDist <= 1.0) {
            setGameOverReason('MONSTER_CAUGHT');
            setIsGameOverOpen(true);
            setStage('GAME_OVER');
            sound.playMonsterGrowl();
            return 0;
          }

          return nextDist;
        });
      }

      // Play procedural heartbeat
      if (heartRate > 90) {
        sound.playHeartbeat(heartRate);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    stage,
    heartRate,
    isSprinting,
    isHiding,
    noiseLevel,
    monsterStunnedTime,
    monsterSlowedTime,
    monsterDistractedTime
  ]);

  // Scavenge in Stage 1: LAB_CELL
  const handleScavenge = (location: string) => {
    sound.playClick();
    setScavengedLocations((prev) => [...prev, location]);

    if (location === 'CABINET_1') {
      setElements((prev) => ({
        ...prev,
        H: (prev.H || 0) + 4,
        O: (prev.O || 0) + 4
      }));
      addLog('냉각 보관함 #01 수색: 수소(H) 4개, 산소(O) 4개 획득!');
    } else if (location === 'CABINET_2') {
      setElements((prev) => ({
        ...prev,
        C: (prev.C || 0) + 3,
        N: (prev.N || 0) + 2,
        Cl: (prev.Cl || 0) + 3
      }));
      addLog('시약 랙 #02 수색: 탄소(C) 3개, 질소(N) 2개, 염소(Cl) 3개 획득!');
    } else if (location === 'CABINET_3') {
      setElements((prev) => ({
        ...prev,
        S: (prev.S || 0) + 2,
        Na: (prev.Na || 0) + 2
      }));
      addLog('위험물 금고 #03 수색: 황(S) 2개, 나트륨(Na) 2개 획득!');
    }
  };

  // Molecular Synthesis Handler
  const handleSynthesize = (compoundId: CompoundId, required: { [key in ElementSymbol]?: number }) => {
    // Deduct elements
    setElements((prev) => {
      const updated = { ...prev };
      for (const [sym, count] of Object.entries(required)) {
        const symbol = sym as ElementSymbol;
        updated[symbol] = (updated[symbol] || 0) - (count || 0);
      }
      return updated;
    });

    // Add to inventory compounds
    setInventoryCompounds((prev) => ({
      ...prev,
      [compoundId]: (prev[compoundId] || 0) + 1
    }));

    if (!craftedHistory.includes(compoundId)) {
      setCraftedHistory((prev) => [...prev, compoundId]);
    }

    const comp = COMPOUNDS[compoundId];
    addLog(`[화학 결합 성공] ${comp.nameKo} (${comp.formula}) 합성! - ${comp.tacticalEffect}`);

    // Making chemical synthesis makes faint hiss noise
    setNoiseLevel((prev) => Math.min(100, prev + 15));
  };

  // Deploy Tactical Chemical Compound
  const handleDeployCompound = (compoundId: CompoundId) => {
    const count = inventoryCompounds[compoundId] || 0;
    if (count <= 0) return;

    // Deduct 1 count
    setInventoryCompounds((prev) => ({
      ...prev,
      [compoundId]: prev[compoundId]! - 1
    }));

    const comp = COMPOUNDS[compoundId];

    if (compoundId === 'HCl') {
      // HCl Flash Stun: 8 seconds stun, knock back monster +8m
      sound.playGasSpray();
      setMonsterStunnedTime(8);
      setMonsterDistance((prev) => Math.min(50, prev + 8));
      addLog('⚡ [HCl 눈뽕] 염화수소 가스가 외눈 거인의 눈을 직격하여 8초간 극심한 고통으로 기절했습니다!');
      setNoiseLevel((prev) => Math.min(100, prev + 25));
    } else if (compoundId === 'NH3') {
      // NH3 Ammonia odor confusion: 10 seconds distraction, monster wanders back +14m
      sound.playGasSpray();
      setMonsterDistractedTime(10);
      setMonsterDistance((prev) => Math.min(50, prev + 14));
      addLog('💨 [NH₃ 악취 마비] 자극적인 암모니아 악취가 퍼져 괴물의 예민한 후각을 마비시키고 멀리 쫓아냈습니다!');
      setNoiseLevel((prev) => Math.min(100, prev + 20));
    } else if (compoundId === 'H2SO4') {
      // H2SO4 Sulfuric Acid Mire: slows monster speed by 75% for 12s
      sound.playAcidSizzle();
      setMonsterSlowedTime(12);
      addLog('☣ [H₂SO₄ 슬로우 늪] 바닥에 진한 황산 늪을 살포하여 거인의 발을 부식시키고 이동을 75% 둔화시켰습니다!');
      setNoiseLevel((prev) => Math.min(100, prev + 15));
    } else if (compoundId === 'CH4') {
      // CH4 Demolition Blast
      sound.playExplosion();
      if (stage === 'EXIT_BLAST') {
        const nextInteg = Math.max(0, wallIntegrity - 50);
        setWallIntegrity(nextInteg);
        addLog(`💥 [CH₄ 메탄 폭파] 강력한 연소 폭발로 방폭 격벽에 거대한 균열 발생! (내구도: ${nextInteg}%)`);

        if (nextInteg <= 0) {
          // VICTORY ESCAPE!
          triggerVictory();
        }
      } else {
        // In corridor, blasts monster backward +18m
        setMonsterDistance((prev) => Math.min(50, prev + 18));
        setMonsterStunnedTime(6);
        addLog('💥 [CH₄ 메탄 폭발] 메탄 연소 폭풍으로 거인을 저 멀리 날려버렸습니다!');
      }
      setNoiseLevel((prev) => 100);
    } else if (compoundId === 'O2') {
      // O2 pack: +25% oxygen, -15 bpm
      sound.playSynthesizeSuccess();
      setOxygen((prev) => Math.min(100, prev + 25));
      setHeartRate((prev) => Math.max(65, prev - 15));
      addLog('🫁 [O₂ 흡입] 고농축 산소팩 흡입 완료! 산소 +25% 회복 및 심박수가 안정화되었습니다.');
    } else if (compoundId === 'H2O') {
      sound.playSynthesizeSuccess();
      setHeartRate((prev) => Math.max(60, prev - 25));
      addLog('💧 [H₂O 냉각수] 진정수 섭취 완료! 심박수 -25 bpm 급속 안정화.');
    }
  };

  // Movement Action: Stealth Walk
  const handleMoveStealth = () => {
    sound.playClick();
    setIsSprinting(false);
    setIsHiding(false);
    setNoiseLevel((prev) => Math.min(100, prev + 8));
    setHeartRate((prev) => Math.min(120, prev + 3));

    // Progress towards next objective
    if (stage === 'DARK_CORRIDOR') {
      // Decreasing monster distance is relative to room, or increasing distance to exit
      setMonsterDistance((prev) => {
        // Stealth walking carefully keeps player distancing or advancing
        return prev;
      });
      addLog('조용히 발걸음을 옮깁니다. (소음 억제)');
    }
  };

  // Movement Action: Sprint
  const handleSprint = () => {
    sound.playClick();
    setIsSprinting((prev) => !prev);
    setIsHiding(false);
    if (!isSprinting) {
      setNoiseLevel((prev) => Math.min(100, prev + 35));
      setHeartRate((prev) => Math.min(170, prev + 18));
      addLog('⚠️ [전력 질주] 급박하게 달립니다! 발자국 진동으로 괴물이 즉각 추적을 시작합니다!');
      sound.playHeartbeat(140);
    } else {
      addLog('질주를 멈추고 보폭을 늦춥니다.');
    }
  };

  // Movement Action: Take Cover / Hold Breath
  const handleTakeCover = () => {
    sound.playClick();
    setIsHiding((prev) => !prev);
    setIsSprinting(false);
    if (!isHiding) {
      setNoiseLevel(3);
      setHeartRate((prev) => Math.max(65, prev - 12));
      addLog('🛡 [엄폐 & 숨 참기] 바리케이드 뒤에 몸을 숨겼습니다. 소음과 심박수가 가라앉습니다.');
    } else {
      addLog('엄폐물에서 나와 이동을 재개합니다.');
    }
  };

  // Advance from Stage 1 (LAB_CELL) to Stage 2 (DARK_CORRIDOR)
  const handleLeaveCell = () => {
    sound.playClick();
    setStage('DARK_CORRIDOR');
    setMonsterDistance(42);
    addLog('수용실 철문을 열고 어둡고 축축한 지하 복도로 진입했습니다. 저 멀리서 붉은 외눈의 실루엣이 감지됩니다!');
    sound.playMonsterGrowl();
  };

  // Advance from Stage 2 to Stage 3 (EXIT_BLAST)
  const handleReachBlastDoor = () => {
    sound.playClick();
    setStage('EXIT_BLAST');
    setWallIntegrity(100);
    setMonsterDistance(30);
    addLog('🚨 [최종 탈출구 방폭벽 도달] 두꺼운 강철 격벽이 가로막고 있습니다! 메탄(CH₄) 가스 연소 폭약으로 벽을 파괴하세요!');
  };

  // Trigger Victory & Submit to Firebase
  const triggerVictory = async () => {
    setStage('ESCAPED');
    setIsVictoryOpen(true);

    // Calculate score
    const timeScore = Math.max(0, 1800 - escapeTimeSeconds * 5);
    const oxygenScore = Math.round(oxygen * 20);
    const craftScore = craftedHistory.length * 300;
    const calculatedScore = timeScore + oxygenScore + craftScore + 5000;
    setFinalScore(calculatedScore);

    // Auto submit to Firebase leaderboard
    const entry: LeaderboardEntry = {
      studentCode,
      studentName,
      escapeTimeSeconds,
      remainingOxygen: oxygen,
      synthesizedCount: craftedHistory.length,
      score: calculatedScore,
      compoundsUsed: craftedHistory,
      escapedAt: new Date().toISOString()
    };

    try {
      await submitLeaderboardScore(entry);
    } catch (e) {
      console.warn("Leaderboard submit error:", e);
    }
  };

  // Restart / Reset Game
  const handleRestartNewGame = (code: string, name: string) => {
    setStudentCode(code);
    setStudentName(name);
    setStage('LAB_CELL');
    setOxygen(100);
    setHeartRate(75);
    setNoiseLevel(5);
    setMonsterDistance(45);
    setWallIntegrity(100);
    setMonsterStunnedTime(0);
    setMonsterSlowedTime(0);
    setMonsterDistractedTime(0);
    setElements({
      H: 3,
      C: 1,
      O: 2,
      N: 1,
      Cl: 1,
      S: 1,
      Na: 1
    });
    setInventoryCompounds({});
    setCraftedHistory([]);
    setScavengedLocations([]);
    setEscapeTimeSeconds(0);
    setIsHiding(false);
    setIsSprinting(false);
    setIsGameOverOpen(false);
    setIsVictoryOpen(false);
    setIsAuthModalOpen(false);
    setChemicalLog([
      '새로운 탐사가 시작되었습니다. 수용실 보관함을 수색해 필수 원소를 확보하세요.'
    ]);
  };

  // Resume saved game from Firebase
  const handleResumeGame = (progress: StudentProgress) => {
    setStudentCode(progress.studentCode);
    setStudentName(progress.studentName);
    setStage(progress.stage === 'GAME_OVER' ? 'LAB_CELL' : progress.stage);
    setOxygen(progress.oxygen);
    setHeartRate(progress.heartRate);
    setMonsterDistance(progress.monsterDistance || 40);
    setElements(progress.elements || {});
    setInventoryCompounds({});
    setCraftedHistory(progress.craftedCompounds || []);
    setChemicalLog(progress.chemicalLog || []);
    setWallIntegrity(progress.wallIntegrity || 100);
    setIsGameOverOpen(false);
    setIsVictoryOpen(false);
    setIsAuthModalOpen(false);
    addLog(`[클라우드 로드 완료] 학생 요원 (${progress.studentName})의 이전 탐사 데이터를 불러왔습니다.`);
  };

  // Retry from Checkpoint
  const handleRetryCheckpoint = () => {
    setIsGameOverOpen(false);
    setOxygen(75);
    setHeartRate(80);
    setNoiseLevel(10);
    setMonsterDistance(38);
    setMonsterStunnedTime(0);
    setMonsterSlowedTime(0);
    setMonsterDistractedTime(0);
    setStage(stage === 'EXIT_BLAST' ? 'EXIT_BLAST' : 'DARK_CORRIDOR');
    addLog('⚡ 마지막 체크포인트에서 긴급 산소 투여 후 재도전합니다!');
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. TOP & WRIST HUD */}
      <WristHUD
        oxygen={oxygen}
        heartRate={heartRate}
        noiseLevel={noiseLevel}
        elements={elements}
        studentCode={studentCode}
        studentName={studentName}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenInventory={() => setIsInventoryModalOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardModalOpen(true)}
        onOpenRules={() => setIsRulesModalOpen(true)}
        onManualSave={handleSaveToCloud}
        saveStatusText={saveStatusText}
      />

      {/* 2. CENTER STAGE / CORRIDOR / ATMOSPHERIC CANVAS */}
      <main className="flex-1 relative w-full overflow-hidden flex flex-col p-2 sm:p-4 bg-slate-950">
        <div className="relative w-full h-full flex flex-col justify-between">
          {/* Main Visual Canvas */}
          <div className="flex-1 relative w-full h-full min-h-[280px]">
            <CorridorView
              stage={stage}
              monsterDistance={monsterDistance}
              monsterStunnedTime={monsterStunnedTime}
              monsterSlowedTime={monsterSlowedTime}
              monsterDistractedTime={monsterDistractedTime}
              heartRate={heartRate}
              noiseLevel={noiseLevel}
              isHiding={isHiding}
              isSprinting={isSprinting}
              wallIntegrity={wallIntegrity}
              onScavenge={handleScavenge}
              scavengedLocations={scavengedLocations}
            />

            {/* Stage Transition Overlays / Interactive Story Triggers */}
            {stage === 'LAB_CELL' && (
              <div className="absolute bottom-4 right-4 sm:right-6 z-20">
                <button
                  onClick={handleLeaveCell}
                  className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-sm flex items-center gap-2 shadow-xl shadow-orange-950/60 hover:scale-105 transition-all cursor-pointer border border-amber-400"
                >
                  <DoorOpen className="w-5 h-5" />
                  <span>수용실 문을 열고 복도로 진입</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {stage === 'DARK_CORRIDOR' && (
              <div className="absolute bottom-4 right-4 sm:right-6 z-20">
                <button
                  onClick={handleReachBlastDoor}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl hover:scale-105 transition-all cursor-pointer border border-cyan-400"
                >
                  <Flame className="w-4 h-4" />
                  <span>최종 탈출구 방폭 격벽으로 접근</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Tactical Action Log Stream (Live Feed in top-left) */}
            <div className="absolute top-3 left-3 max-w-[280px] sm:max-w-md pointer-events-none select-none">
              <div className="p-2 sm:p-2.5 rounded-xl bg-black/75 border border-slate-800 backdrop-blur-md text-[11px] font-mono space-y-1">
                <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>화학 전술 통신 로그</span>
                </div>
                {chemicalLog.slice(0, 2).map((log, idx) => (
                  <p key={idx} className={`leading-tight ${idx === 0 ? 'text-slate-200' : 'text-slate-500'}`}>
                    › {log}
                  </p>
                ))}
              </div>
            </div>

            {/* Stage Info Badge (Top Right) */}
            <div className="absolute top-3 right-3 select-none">
              <div className="px-3 py-1.5 rounded-xl bg-black/75 border border-slate-800 backdrop-blur-md text-xs font-mono text-slate-300 flex items-center gap-2">
                <span className="text-slate-500">구역:</span>
                <span className="font-bold text-cyan-400">
                  {stage === 'LAB_CELL' && '지하 수용실 (Cell #09)'}
                  {stage === 'DARK_CORRIDOR' && '칠흑 같은 복도 (B3 Corridor)'}
                  {stage === 'EXIT_BLAST' && '방폭 출구 격벽 (Blast Vault)'}
                  {stage === 'ESCAPED' && '지상 탈출 완료 (Extracted)'}
                  {stage === 'GAME_OVER' && '통신 두절 (Terminated)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. BOTTOM UI: WRIST MOLECULAR SYNTHESIZER */}
      <footer className="w-full shrink-0">
        <MolecularSynthesizer
          elements={elements}
          inventoryCompounds={inventoryCompounds}
          onSynthesize={handleSynthesize}
          onDeployCompound={handleDeployCompound}
          onMoveStealth={handleMoveStealth}
          onSprint={handleSprint}
          onTakeCover={handleTakeCover}
          isHiding={isHiding}
          isSprinting={isSprinting}
          stage={stage}
        />
      </footer>

      {/* MODALS */}
      {/* Student PIN Auth Modal */}
      <StudentAuthModal
        isOpen={isAuthModalOpen}
        onStartNewGame={handleRestartNewGame}
        onResumeGame={handleResumeGame}
        currentCode={studentCode}
        currentName={studentName}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Intro Rules Modal */}
      <IntroRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        onStartOrResume={() => {
          setIsRulesModalOpen(false);
          sound.startAtmosphere();
        }}
      />

      {/* Element Bag Inventory Modal */}
      <ElementInventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        elements={elements}
      />

      {/* Global Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardModalOpen}
        onClose={() => setIsLeaderboardModalOpen(false)}
        currentStudentCode={studentCode}
      />

      {/* Game Over Screen */}
      <GameOverModal
        isOpen={isGameOverOpen}
        reason={gameOverReason}
        onRestart={() => handleRestartNewGame(studentCode, studentName)}
        onResumeCheckpoint={handleRetryCheckpoint}
      />

      {/* Victory Celebration Screen */}
      <VictoryModal
        isOpen={isVictoryOpen}
        studentName={studentName}
        studentCode={studentCode}
        escapeTimeSeconds={escapeTimeSeconds}
        remainingOxygen={oxygen}
        craftedCount={craftedHistory.length}
        score={finalScore}
        compoundsUsed={craftedHistory}
        onOpenLeaderboard={() => {
          setIsVictoryOpen(false);
          setIsLeaderboardModalOpen(true);
        }}
        onPlayAgain={() => handleRestartNewGame(studentCode, studentName)}
      />
    </div>
  );
}
