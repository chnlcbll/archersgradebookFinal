import { Component, Criterion, Subject } from './types';

export function computeCriterionAverage(components: Component[]): number | null {
  let got = 0, tot = 0;
  components.forEach(c => {
    const s = parseFloat(c.score);
    const t = parseFloat(c.total);
    if (isFinite(s) && isFinite(t) && t > 0) {
      got += Math.max(0, Math.min(s, t));
      tot += t;
    }
  });
  if (tot <= 0) return null;
  return (100 * got) / tot;
}

export function toGPE(pct: number, scale: 'standard' | 'strict' | 'dlsu', passingPercentage: number = 60): number {
  if (pct < passingPercentage) return 0.0;

  if (scale === 'dlsu') {
    const s = [
      [97, 4.0], [93, 3.5], [89, 3.0], [85, 2.5], [80, 2.0], [75, 1.5], [passingPercentage, 1.0], [0, 0.0]
    ];
    for (const [min, g] of s) {
      if (pct >= min) return g as number;
    }
    return 0.0;
  }

  const s = scale === 'strict' ? [
    [95, 4.0], [90, 3.5], [84, 3.0], [78, 2.5], [72, 2.0], [66, 1.5], [passingPercentage, 1.0], [0, 0.0]
  ] : [
    [92, 4.0], [86, 3.5], [80, 3.0], [75, 2.5], [70, 2.0], [65, 1.5], [passingPercentage, 1.0], [0, 0.0]
  ];
  for (const [min, g] of s) {
    if (pct >= min) return g as number;
  }
  return 0.0;
}

export function computeSubjectGrade(subject: Subject) {
  let total = 0;
  let weightSum = 0;
  const parts: { name: string; avg: number | null; weight: number }[] = [];
  
  subject.criteria.forEach(cr => {
    const avg = computeCriterionAverage(cr.components || []);
    const weight = typeof cr.weight === 'number' ? cr.weight : parseFloat(cr.weight as any) || 0;
    weightSum += weight;
    parts.push({ name: cr.name, avg, weight });
    if (avg != null) total += avg * (weight / 100);
  });
  
  const pct = parts.every(p => p.avg == null) ? 0 : total;
  const gpe = toGPE(pct, subject.scale || 'dlsu', subject.passingPercentage || 60);
  const isPassing = pct >= (subject.passingPercentage || 60);
  
  return { percentage: pct, parts, gpe, weightSum, isPassing };
}

export function fmt(n: number | string): string {
  const num = typeof n === 'string' ? parseFloat(n) : n;
  return isNaN(num) ? '0.00' : num.toFixed(2);
}

export function defaultSubjects(): Subject[] {
  return [
    {
      id: crypto.randomUUID(), name: 'Example Subject: LBYBI13', scale: 'dlsu', lockedWeights: true, passingPercentage: 60,
      criteria: [
        { id: crypto.randomUUID(), name: 'Exams & Quizzes (2 exams total)', weight: 60, components: [] },
        { id: crypto.randomUUID(), name: 'Group Lab Reports & Class Participation', weight: 10, components: [] },
        { id: crypto.randomUUID(), name: 'Comprehensive Final Exam', weight: 30, components: [] },
      ]
    }
  ];
}

export function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.warn("AudioContext not supported or blocked", e);
  }
}

export function playCelebrationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + i * 0.1 + 0.4);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.4);
    });
  } catch (e) {
    console.warn("AudioContext not supported or blocked", e);
  }
}
