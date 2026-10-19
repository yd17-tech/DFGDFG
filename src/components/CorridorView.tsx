import React, { useRef, useEffect } from 'react';
import { GameStage } from '../types/game';

interface CorridorViewProps {
  stage: GameStage;
  monsterDistance: number; // 0 to 50 meters
  monsterStunnedTime: number;
  monsterSlowedTime: number;
  monsterDistractedTime: number;
  heartRate: number;
  noiseLevel: number; // 0 to 100
  isHiding: boolean;
  isSprinting: boolean;
  wallIntegrity: number;
  onScavenge?: (location: string) => void;
  scavengedLocations?: string[];
}

export const CorridorView: React.FC<CorridorViewProps> = ({
  stage,
  monsterDistance,
  monsterStunnedTime,
  monsterSlowedTime,
  monsterDistractedTime,
  heartRate,
  noiseLevel,
  isHiding,
  isSprinting,
  wallIntegrity,
  onScavenge,
  scavengedLocations = []
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.03;
      const width = canvas.width;
      const height = canvas.height;

      // Clear dark background
      ctx.fillStyle = '#06070a';
      ctx.fillRect(0, 0, width, height);

      // Camera shake based on sprint, high heart rate, or nearby monster
      const shakeIntensity = 
        (isSprinting ? 4 : 0) + 
        (heartRate > 130 ? (heartRate - 130) * 0.05 : 0) + 
        (monsterDistance < 10 && monsterStunnedTime <= 0 ? (10 - monsterDistance) * 0.6 : 0);
      const shakeX = (Math.random() - 0.5) * shakeIntensity;
      const shakeY = (Math.random() - 0.5) * shakeIntensity;

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Vanishing point in the center
      const vpX = width / 2;
      const vpY = height * 0.45;

      // 1. Perspective Corridor / Underground Cell Walls
      // Ceiling, floor, walls
      const gradFloor = ctx.createLinearGradient(0, vpY, 0, height);
      gradFloor.addColorStop(0, '#0a0d14');
      gradFloor.addColorStop(1, '#131924');
      ctx.fillStyle = gradFloor;
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(width, height);
      ctx.lineTo(vpX + 40, vpY + 20);
      ctx.lineTo(vpX - 40, vpY + 20);
      ctx.closePath();
      ctx.fill();

      // Floor grid lines (metal grating)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      for (let i = -6; i <= 6; i++) {
        ctx.beginPath();
        ctx.moveTo(vpX + i * 8, vpY + 20);
        ctx.lineTo(vpX + i * (width * 0.1), height);
        ctx.stroke();
      }
      // Horizontal grating steps
      for (let d = 0.2; d <= 1.0; d += 0.12) {
        const y = vpY + (height - vpY) * Math.pow(d, 2.2);
        const w = (vpX - 40) + ((width * 0.5) * d);
        ctx.beginPath();
        ctx.moveTo(vpX - w, y);
        ctx.lineTo(vpX + w, y);
        ctx.stroke();
      }

      // Ceiling
      const gradCeil = ctx.createLinearGradient(0, 0, 0, vpY);
      gradCeil.addColorStop(0, '#090b10');
      gradCeil.addColorStop(1, '#05070a');
      ctx.fillStyle = gradCeil;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(vpX + 45, vpY - 25);
      ctx.lineTo(vpX - 45, vpY - 25);
      ctx.closePath();
      ctx.fill();

      // Overhead pipes & cable lines
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.08);
      ctx.lineTo(vpX - 40, vpY - 25);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width, height * 0.08);
      ctx.lineTo(vpX + 40, vpY - 25);
      ctx.stroke();

      // Walls
      ctx.fillStyle = '#0b0f19';
      // Left Wall
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(vpX - 45, vpY - 25);
      ctx.lineTo(vpX - 40, vpY + 20);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Right Wall
      ctx.fillStyle = '#0a0e17';
      ctx.beginPath();
      ctx.moveTo(width, 0);
      ctx.lineTo(vpX + 45, vpY - 25);
      ctx.lineTo(vpX + 40, vpY + 20);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Emergency Light Strobe Pulse (Red glowing alarm lamp in the distance)
      const strobeAlpha = 0.15 + Math.sin(time * 3) * 0.12;
      const strobeGrad = ctx.createRadialGradient(vpX, vpY - 40, 5, vpX, vpY - 40, width * 0.6);
      strobeGrad.addColorStop(0, `rgba(239, 68, 68, ${strobeAlpha + 0.1})`);
      strobeGrad.addColorStop(0.5, `rgba(185, 28, 28, ${strobeAlpha * 0.4})`);
      strobeGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = strobeGrad;
      ctx.fillRect(0, 0, width, height);

      // Emergency lamp fixture
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(vpX, vpY - 40, 4, 0, Math.PI * 2);
      ctx.fill();

      // 2. STAGE SPECIFIC GRAPHICS
      if (stage === 'LAB_CELL') {
        // Lab Cell interior: Examination table, element cabinets, observation window
        ctx.fillStyle = '#1e293b';
        // Broken chemical shelf on left
        ctx.fillRect(width * 0.1, height * 0.42, width * 0.16, height * 0.38);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(width * 0.1, height * 0.42, width * 0.16, height * 0.38);

        // Lab warning decal
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '11px monospace';
        ctx.fillText('CRYO-CONTAINMENT 09', width * 0.11, height * 0.46);

        // Chemical Locker on right
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(width * 0.74, height * 0.42, width * 0.16, height * 0.38);
        ctx.strokeStyle = '#fbbf24';
        ctx.strokeRect(width * 0.74, height * 0.42, width * 0.16, height * 0.38);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('ELEMENT STORAGE', width * 0.75, height * 0.46);
      } else if (stage === 'EXIT_BLAST') {
        // Giant reinforced blast bulkhead door at the end of the corridor
        const doorW = width * 0.48;
        const doorH = height * 0.52;
        const doorX = vpX - doorW / 2;
        const doorY = vpY - doorH * 0.38;

        // Blast door frame
        ctx.fillStyle = '#18181b';
        ctx.fillRect(doorX, doorY, doorW, doorH);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 4;
        ctx.strokeRect(doorX, doorY, doorW, doorH);

        // Warning Hazard stripes on bulkhead
        for (let s = 0; s < doorW; s += 24) {
          ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
          ctx.beginPath();
          ctx.moveTo(doorX + s, doorY);
          ctx.lineTo(doorX + s + 12, doorY);
          ctx.lineTo(doorX + s - 10, doorY + doorH);
          ctx.lineTo(doorX + s - 22, doorY + doorH);
          ctx.closePath();
          ctx.fill();
        }

        // Structural cracks if damaged by CH4
        if (wallIntegrity < 100) {
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = (100 - wallIntegrity) * 0.05 + 1;
          ctx.beginPath();
          ctx.moveTo(doorX + doorW * 0.5, doorY + doorH * 0.3);
          ctx.lineTo(doorX + doorW * 0.4, doorY + doorH * 0.6);
          ctx.lineTo(doorX + doorW * 0.6, doorY + doorH * 0.85);
          ctx.stroke();

          // Spark particles
          for (let p = 0; p < 8; p++) {
            const px = doorX + doorW * 0.5 + (Math.sin(time * 5 + p) * 30);
            const py = doorY + doorH * 0.6 + (Math.cos(time * 7 + p) * 20);
            ctx.fillStyle = '#fed7aa';
            ctx.fillRect(px, py, 2, 2);
          }
        }
      }

      // 3. CHEMICAL TRAPS ON GROUND
      // H2SO4 Sulfuric Acid Pool on the floor
      if (monsterSlowedTime > 0) {
        const puddleY = height * 0.68;
        const puddleW = width * 0.35;
        const puddleH = height * 0.12;

        const acidGrad = ctx.createRadialGradient(vpX, puddleY, 10, vpX, puddleY, puddleW * 0.6);
        acidGrad.addColorStop(0, 'rgba(234, 179, 8, 0.85)');
        acidGrad.addColorStop(0.6, 'rgba(132, 204, 22, 0.5)');
        acidGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = acidGrad;
        ctx.beginPath();
        ctx.ellipse(vpX, puddleY, puddleW / 2, puddleH / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Acid bubbles
        for (let b = 0; b < 6; b++) {
          const bx = vpX + Math.sin(time * 4 + b * 2) * (puddleW * 0.3);
          const by = puddleY + Math.cos(time * 3 + b) * (puddleH * 0.3);
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(bx, by, 3 + Math.sin(time * 8 + b) * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. THE ONE-EYED CYCLOPS MONSTER (외눈 거인)
      // Only appears if stage is CORRIDOR or EXIT_BLAST
      if (stage === 'DARK_CORRIDOR' || stage === 'EXIT_BLAST') {
        // Monster scale & position depends inversely on monsterDistance (0m = huge, 50m = tiny silhouette)
        const distRatio = Math.max(0, Math.min(1, (50 - monsterDistance) / 50));
        // Exponential scale for dramatic 3D approach
        const scale = 0.08 + Math.pow(distRatio, 2.2) * 1.35;
        const monsterW = 220 * scale;
        const monsterH = 340 * scale;

        // Position along corridor center with slight swaying
        const swayX = Math.sin(time * 1.5) * (15 * scale);
        const monsterX = vpX - monsterW / 2 + swayX;
        // Ground contact point
        const monsterY = vpY + (height * 0.5 - vpY) * distRatio - monsterH * 0.35;

        // Monster shadow on ground
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.ellipse(monsterX + monsterW / 2, monsterY + monsterH * 0.95, monsterW * 0.65, monsterH * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Monster Body Silhouette (Bulky mutant biomechanical titan)
        ctx.fillStyle = '#090b10';
        // Torso & shoulders
        ctx.beginPath();
        ctx.ellipse(monsterX + monsterW / 2, monsterY + monsterH * 0.45, monsterW * 0.45, monsterH * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Massive muscular arms
        ctx.fillRect(monsterX, monsterY + monsterH * 0.3, monsterW * 0.22, monsterH * 0.5);
        ctx.fillRect(monsterX + monsterW * 0.78, monsterY + monsterH * 0.3, monsterW * 0.22, monsterH * 0.5);

        // Head
        ctx.beginPath();
        ctx.ellipse(monsterX + monsterW / 2, monsterY + monsterH * 0.18, monsterW * 0.26, monsterH * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Thick horns/spikes
        ctx.beginPath();
        ctx.moveTo(monsterX + monsterW * 0.3, monsterY + monsterH * 0.15);
        ctx.lineTo(monsterX + monsterW * 0.15, monsterY + monsterH * 0.02);
        ctx.lineTo(monsterX + monsterW * 0.35, monsterY + monsterH * 0.1);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(monsterX + monsterW * 0.7, monsterY + monsterH * 0.15);
        ctx.lineTo(monsterX + monsterW * 0.85, monsterY + monsterH * 0.02);
        ctx.lineTo(monsterX + monsterW * 0.65, monsterY + monsterH * 0.1);
        ctx.closePath();
        ctx.fill();

        // THE GLOWING ONE EYE (외눈)
        const eyeX = monsterX + monsterW / 2;
        const eyeY = monsterY + monsterH * 0.18;
        const eyeRadius = Math.max(3, 18 * scale);

        // Eye glow gradient
        let eyeColorCore = '#ef4444';
        let eyeGlowColor = 'rgba(239, 68, 68, 0.45)';

        if (monsterStunnedTime > 0) {
          // Eye is flash blinded / impaired by HCl
          eyeColorCore = '#fef08a';
          eyeGlowColor = 'rgba(254, 240, 138, 0.7)';
        } else if (monsterDistractedTime > 0) {
          // Eye is confused / smelling NH3
          eyeColorCore = '#a855f7';
          eyeGlowColor = 'rgba(168, 85, 247, 0.5)';
        }

        const eyeGlow = ctx.createRadialGradient(eyeX, eyeY, eyeRadius * 0.2, eyeX, eyeY, eyeRadius * 3);
        eyeGlow.addColorStop(0, eyeColorCore);
        eyeGlow.addColorStop(0.5, eyeGlowColor);
        eyeGlow.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = eyeGlow;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeRadius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Eye Sclera & Iris
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Glowing Iris
        ctx.fillStyle = eyeColorCore;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeRadius * 0.75, 0, Math.PI * 2);
        ctx.fill();

        // Slit Pupil
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(eyeX, eyeY, eyeRadius * 0.18, eyeRadius * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();

        // Status Effects floating above monster
        if (monsterStunnedTime > 0) {
          ctx.fillStyle = '#fde047';
          ctx.font = `bold ${Math.max(12, 16 * scale)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(`⚡ HCl 기절! (${Math.ceil(monsterStunnedTime)}s)`, eyeX, eyeY - eyeRadius * 3);
        } else if (monsterDistractedTime > 0) {
          ctx.fillStyle = '#c084fc';
          ctx.font = `bold ${Math.max(12, 16 * scale)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(`💨 NH₃ 악취 마비! (${Math.ceil(monsterDistractedTime)}s)`, eyeX, eyeY - eyeRadius * 3);
        } else if (monsterSlowedTime > 0) {
          ctx.fillStyle = '#facc15';
          ctx.font = `bold ${Math.max(12, 16 * scale)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(`☣ H₂SO₄ 슬로우 (-75%)`, eyeX, eyeY - eyeRadius * 3);
        }
      }

      // 5. Tactical chemical vapors & ambient smoke in foreground
      // Stun HCl vapor cloud
      if (monsterStunnedTime > 0) {
        ctx.fillStyle = 'rgba(74, 222, 128, 0.15)';
        for (let i = 0; i < 4; i++) {
          const cx = vpX + Math.sin(time * 2 + i) * 80;
          const cy = vpY + Math.cos(time * 1.5 + i) * 40;
          ctx.beginPath();
          ctx.arc(cx, cy, 70 + Math.sin(time + i) * 20, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // NH3 pungent fog
      if (monsterDistractedTime > 0) {
        ctx.fillStyle = 'rgba(192, 132, 252, 0.16)';
        for (let i = 0; i < 4; i++) {
          const cx = vpX + Math.cos(time * 2 + i) * 70;
          const cy = vpY + Math.sin(time * 2.5 + i) * 40;
          ctx.beginPath();
          ctx.arc(cx, cy, 80 + Math.cos(time + i) * 20, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 6. Flashlight Vignette / Darkness Effect
      const torchR = isHiding ? width * 0.28 : width * 0.48;
      const vignette = ctx.createRadialGradient(vpX, vpY + 30, 20, vpX, vpY + 30, torchR);
      vignette.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
      vignette.addColorStop(0.65, 'rgba(0, 0, 0, 0.45)');
      vignette.addColorStop(1, 'rgba(2, 3, 6, 0.94)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // 7. Sound / Footstep Vibration Shockwaves
      if (noiseLevel > 15) {
        const ringRadius = (time * 140) % (width * 0.5);
        const ringAlpha = Math.max(0, 1 - (ringRadius / (width * 0.5))) * (noiseLevel / 100) * 0.6;
        ctx.strokeStyle = noiseLevel > 65 ? `rgba(239, 68, 68, ${ringAlpha})` : `rgba(56, 189, 248, ${ringAlpha})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(width / 2, height * 0.85, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 8. Hiding cover overlay
      if (isHiding) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#38bdf8';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🛡 엄폐 중 - 소음 및 진동 감소, 심박수 안정화 중...', width / 2, height * 0.88);
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    stage,
    monsterDistance,
    monsterStunnedTime,
    monsterSlowedTime,
    monsterDistractedTime,
    heartRate,
    noiseLevel,
    isHiding,
    isSprinting,
    wallIntegrity
  ]);

  return (
    <div className="relative w-full h-full min-h-[380px] bg-black overflow-hidden select-none border border-cyan-900/40 rounded-xl shadow-2xl">
      <canvas
        ref={canvasRef}
        width={960}
        height={520}
        className="w-full h-full object-cover"
      />

      {/* Scavenge Interactivity in Stage 1: LAB_CELL */}
      {stage === 'LAB_CELL' && onScavenge && (
        <div className="absolute inset-0 pointer-events-auto flex items-center justify-between px-8 md:px-16">
          {/* Cabinet 1 */}
          <button
            onClick={() => onScavenge('CABINET_1')}
            disabled={scavengedLocations.includes('CABINET_1')}
            className={`group px-4 py-3 rounded-xl border backdrop-blur-md transition-all ${
              scavengedLocations.includes('CABINET_1')
                ? 'bg-slate-900/40 border-slate-700/50 text-slate-500 cursor-not-allowed'
                : 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200 hover:bg-cyan-900 hover:scale-105 hover:shadow-cyan-500/20 shadow-lg'
            }`}
          >
            <div className="text-xs font-mono text-cyan-400">수납장 #01</div>
            <div className="text-sm font-bold flex items-center gap-1.5">
              <span>{scavengedLocations.includes('CABINET_1') ? '✓ 수색 완료' : '🔍 냉각 보관함 탐색'}</span>
            </div>
            {!scavengedLocations.includes('CABINET_1') && (
              <div className="text-[11px] text-cyan-300/70 mt-0.5">수소(H), 산소(O) 용기 보관</div>
            )}
          </button>

          {/* Cabinet 2 */}
          <button
            onClick={() => onScavenge('CABINET_2')}
            disabled={scavengedLocations.includes('CABINET_2')}
            className={`group px-4 py-3 rounded-xl border backdrop-blur-md transition-all ${
              scavengedLocations.includes('CABINET_2')
                ? 'bg-slate-900/40 border-slate-700/50 text-slate-500 cursor-not-allowed'
                : 'bg-amber-950/80 border-amber-500/60 text-amber-200 hover:bg-amber-900 hover:scale-105 hover:shadow-amber-500/20 shadow-lg'
            }`}
          >
            <div className="text-xs font-mono text-amber-400">시약 랙 #02</div>
            <div className="text-sm font-bold flex items-center gap-1.5">
              <span>{scavengedLocations.includes('CABINET_2') ? '✓ 수색 완료' : '🔍 화학 시약 랙 탐색'}</span>
            </div>
            {!scavengedLocations.includes('CABINET_2') && (
              <div className="text-[11px] text-amber-300/70 mt-0.5">탄소(C), 질소(N), 염소(Cl) 보관</div>
            )}
          </button>

          {/* Cabinet 3 */}
          <button
            onClick={() => onScavenge('CABINET_3')}
            disabled={scavengedLocations.includes('CABINET_3')}
            className={`group px-4 py-3 rounded-xl border backdrop-blur-md transition-all ${
              scavengedLocations.includes('CABINET_3')
                ? 'bg-slate-900/40 border-slate-700/50 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200 hover:bg-emerald-900 hover:scale-105 hover:shadow-emerald-500/20 shadow-lg'
            }`}
          >
            <div className="text-xs font-mono text-emerald-400">위험물 금고 #03</div>
            <div className="text-sm font-bold flex items-center gap-1.5">
              <span>{scavengedLocations.includes('CABINET_3') ? '✓ 수색 완료' : '🔍 광물 원소함 탐색'}</span>
            </div>
            {!scavengedLocations.includes('CABINET_3') && (
              <div className="text-[11px] text-emerald-300/70 mt-0.5">황(S), 나트륨(Na) 보관</div>
            )}
          </button>
        </div>
      )}

      {/* Distance Telemetry HUD overlay in center top */}
      {(stage === 'DARK_CORRIDOR' || stage === 'EXIT_BLAST') && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/75 border border-red-500/40 backdrop-blur-md text-xs font-mono">
          <div className="flex items-center gap-1.5 text-red-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>괴물 탐지 거리:</span>
          </div>
          <span className={`font-bold text-sm ${monsterDistance < 12 ? 'text-red-500 animate-pulse' : 'text-amber-300'}`}>
            {monsterDistance.toFixed(1)} m
          </span>
          <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div 
              className={`h-full transition-all duration-300 ${monsterDistance < 12 ? 'bg-red-500' : monsterDistance < 25 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.max(5, (monsterDistance / 50) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Stage 3 Blast Door HUD */}
      {stage === 'EXIT_BLAST' && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-lg bg-yellow-950/80 border border-yellow-500/50 text-[11px] font-mono text-yellow-300">
          <span>방폭벽 내구도:</span>
          <span className="font-bold text-orange-400">{wallIntegrity}%</span>
          <span className="text-slate-400">(CH₄ 메탄 폭발로 파괴 필요)</span>
        </div>
      )}
    </div>
  );
};
