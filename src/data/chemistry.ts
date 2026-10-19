import { ChemicalElement, ChemicalCompound, ElementSymbol, CompoundId } from '../types/game';

export const ELEMENTS: Record<ElementSymbol, ChemicalElement> = {
  H: {
    symbol: 'H',
    nameKo: '수소 (Hydrogen)',
    nameEn: 'Hydrogen',
    atomicNumber: 1,
    atomicMass: 1.008,
    valency: [1],
    color: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.2)',
    description: '우주에서 가장 풍부하고 가벼운 원소. 결합손 1개.',
    hint: 'CH₄, HCl, NH₃, H₂SO₄, H₂O 등의 핵심 구성 원소입니다.'
  },
  C: {
    symbol: 'C',
    nameKo: '탄소 (Carbon)',
    nameEn: 'Carbon',
    atomicNumber: 6,
    atomicMass: 12.011,
    valency: [4],
    color: '#a8a29e',
    bgColor: 'rgba(168, 162, 158, 0.2)',
    description: '4개의 원자가 전자를 가져 다양한 유기화합물의 뼈대를 이룹니다.',
    hint: '수소와 1:4로 결합하면 폭발적인 메탄 가스(CH₄)가 됩니다.'
  },
  O: {
    symbol: 'O',
    nameKo: '산소 (Oxygen)',
    nameEn: 'Oxygen',
    atomicNumber: 8,
    atomicMass: 15.999,
    valency: [2],
    color: '#f87171',
    bgColor: 'rgba(248, 113, 113, 0.2)',
    description: '호흡에 필수적이며 강력한 산화제입니다. 결합손 2개.',
    hint: '산소 분자(O₂)는 생체 산소를 회복시키고, 황산(H₂SO₄)의 주요 성분입니다.'
  },
  N: {
    symbol: 'N',
    nameKo: '질소 (Nitrogen)',
    nameEn: 'Nitrogen',
    atomicNumber: 7,
    atomicMass: 14.007,
    valency: [3],
    color: '#60a5fa',
    bgColor: 'rgba(96, 165, 250, 0.2)',
    description: '지구 대기의 78%를 차지하며 삼각뿔형 분자를 형성합니다.',
    hint: '수소 3개와 결합(NH₃)하면 강한 자극성 악취 물질이 생성됩니다.'
  },
  S: {
    symbol: 'S',
    nameKo: '황 (Sulfur)',
    nameEn: 'Sulfur',
    atomicNumber: 16,
    atomicMass: 32.06,
    valency: [2, 4, 6],
    color: '#facc15',
    bgColor: 'rgba(250, 204, 21, 0.2)',
    description: '노란색 비금속 원소로 강력한 산(H₂SO₄)의 중심 원자입니다.',
    hint: '수소와 산소와 결합하여 초강산인 황산(H₂SO₄)을 만듭니다.'
  },
  Cl: {
    symbol: 'Cl',
    nameKo: '염소 (Chlorine)',
    nameEn: 'Chlorine',
    atomicNumber: 17,
    atomicMass: 35.45,
    valency: [1],
    color: '#4ade80',
    bgColor: 'rgba(74, 222, 128, 0.2)',
    description: '할로젠 원소로 강한 반응성과 살균·부식성을 지닙니다.',
    hint: '수소와 1:1로 결합(HCl)하면 거인의 눈을 자극하는 기절 가스가 됩니다.'
  },
  Na: {
    symbol: 'Na',
    nameKo: '나트륨 (Sodium)',
    nameEn: 'Sodium',
    atomicNumber: 11,
    atomicMass: 22.99,
    valency: [1],
    color: '#fb923c',
    bgColor: 'rgba(251, 146, 60, 0.2)',
    description: '반응성이 매우 큰 알칼리 금속. 전자를 1개 잃고 Na⁺가 됨.',
    hint: '염소(Cl)와 결합하여 식염(NaCl)을 형성하거나 전도성 용액을 만듭니다.'
  }
};

export const COMPOUNDS: Record<CompoundId, ChemicalCompound> = {
  HCl: {
    id: 'HCl',
    formula: 'HCl',
    nameKo: '염화수소 / 염산 가스',
    nameEn: 'Hydrogen Chloride',
    description: '강한 자극성 산성 기체로 외눈 거인의 안구 점막에 극심한 통증을 유발합니다.',
    tacticalEffect: '눈뽕 기절 (괴물 8초간 행동 마비 및 후퇴)',
    iconName: 'EyeOff',
    requiredElements: { H: 1, Cl: 1 },
    reactionEquation: 'H + Cl → HCl (염화수소 산성 가스)',
    scienceFact: '수소와 염소는 1:1 단일 공유결합을 형성하며, 물에 녹으면 강산인 염산이 됩니다.',
    type: 'OFFENSE'
  },
  NH3: {
    id: 'NH3',
    formula: 'NH₃',
    nameKo: '암모니아 가스',
    nameEn: 'Ammonia',
    description: '코를 찌르는 강렬한 알칼리성 냄새로 괴물의 예민한 후각 기관을 완전히 마비시킵니다.',
    tacticalEffect: '악취 마비 (괴물 후각 교란 10초, 반대 방향으로 배회)',
    iconName: 'Wind',
    requiredElements: { N: 1, H: 3 },
    reactionEquation: 'N + 3H → NH₃ (삼각뿔 구조 암모니아)',
    scienceFact: '질소 원자 1개와 수소 원자 3개가 공유결합을 이루며 비공유 전자쌍 1쌍을 갖습니다.',
    type: 'DEBUFF'
  },
  H2SO4: {
    id: 'H2SO4',
    formula: 'H₂SO₄',
    nameKo: '진한 황산 늪',
    nameEn: 'Sulfuric Acid',
    description: '바닥에 강력한 탈수 작용과 부식성을 지닌 황산 늪을 깔아 거인의 발을 녹이고 구속합니다.',
    tacticalEffect: '슬로우 늪 (괴물 이동속도 75% 감소, 12초 지속)',
    iconName: 'Biohazard',
    requiredElements: { H: 2, S: 1, O: 4 },
    reactionEquation: '2H + S + 4O → H₂SO₄ (초강산 황산 생성)',
    scienceFact: '황산은 강한 산화력과 탈수 작용을 가진 2가 산으로 유기물과 금속을 빠르게 부식시킵니다.',
    type: 'DEBUFF'
  },
  CH4: {
    id: 'CH4',
    formula: 'CH₄',
    nameKo: '메탄 폭약 / 연소 챔버',
    nameEn: 'Methane Gas Blast',
    description: '압축 메탄 가스를 방폭벽 틈새에 주입하고 산소와 점화하여 강력한 폭풍을 발생시킵니다.',
    tacticalEffect: '벽 폭파 (탈출구 방폭 격벽 내구도 50% 파괴 및 최종 탈출로 개척)',
    iconName: 'Flame',
    requiredElements: { C: 1, H: 4 },
    reactionEquation: 'CH₄ + 2O₂ → CO₂ + 2H₂O + 대량의 반응열 (폭발)',
    scienceFact: '탄소 1개에 수소 4개가 정사면체 형태로 결합한 탄화수소로 고에너지 연소 반응을 일으킵니다.',
    type: 'OBJECTIVE'
  },
  O2: {
    id: 'O2',
    formula: 'O₂',
    nameKo: '고농축 산소 팩',
    nameEn: 'Concentrated Oxygen Pack',
    description: '긴급 호흡용 순수 산소를 합성하여 부족한 산소 잔여량을 빠르게 회복합니다.',
    tacticalEffect: '산소 +25% 즉시 회복 및 심박수 -15 bpm 안정화',
    iconName: 'HeartPulse',
    requiredElements: { O: 2 },
    reactionEquation: '2O → O₂ (이중결합 산소 분자)',
    scienceFact: '산소 원자 2개가 이중 결합을 형성한 무극성 공유결합 물질로 생명 유지의 핵심입니다.',
    type: 'UTILITY'
  },
  H2O: {
    id: 'H2O',
    formula: 'H₂O',
    nameKo: '냉각수 / 중화액',
    nameEn: 'Pure Water',
    description: '고열 장비를 냉각하거나 피부 자극 화학물질을 세척하고 심박수를 진정시킵니다.',
    tacticalEffect: '심박수 -25 bpm 급속 안정화 (소음/진동 급감)',
    iconName: 'Droplets',
    requiredElements: { H: 2, O: 1 },
    reactionEquation: '2H + O → H₂O (굽은형 극성 공유결합)',
    scienceFact: '수소와 산소의 전기음성도 차이로 강한 극성을 띠며 수소결합을 형성합니다.',
    type: 'UTILITY'
  },
  NaCl: {
    id: 'NaCl',
    formula: 'NaCl',
    nameKo: '염화 나트륨 (전해질)',
    nameEn: 'Sodium Chloride',
    description: '이온 결합 물질로 물과 함께 전기 전도성 용액을 만들어 보안 문 센서를 단락시킵니다.',
    tacticalEffect: '전자 센서 교란 및 보조 원소 보급함 개방',
    iconName: 'Zap',
    requiredElements: { Na: 1, Cl: 1 },
    reactionEquation: 'Na⁺ + Cl⁻ → NaCl (전형적인 이온 결합 결정)',
    scienceFact: '금속 나트륨의 전자 1개가 비금속 염소로 이동하여 정전기적 인력으로 결합합니다.',
    type: 'UTILITY'
  },
  CO2: {
    id: 'CO2',
    formula: 'CO₂',
    nameKo: '이산화탄소 연막탄',
    nameEn: 'Carbon Dioxide Fog',
    description: '산소를 차단하는 무거운 기체 연막을 분사하여 괴물의 시야를 가립니다.',
    tacticalEffect: '시야 차단 연막 (괴물 탐지 거리 단축 6초)',
    iconName: 'CloudFog',
    requiredElements: { C: 1, O: 2 },
    reactionEquation: 'C + 2O → CO₂ (직선형 무극성 분자)',
    scienceFact: '탄소와 산소가 2개의 이중결합을 형성하는 직선형 분자로 공기보다 무겁습니다.',
    type: 'OFFENSE'
  }
};
