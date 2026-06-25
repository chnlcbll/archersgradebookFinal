import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Copy } from 'lucide-react';
import { Subject, Criterion, Component } from '../types';
import { computeSubjectGrade, computeCriterionAverage, fmt, playCelebrationSound } from '../utils';
import { ConfirmModal } from './ConfirmModal';
import { Tooltip } from './Tooltip';
import confetti from 'canvas-confetti';

interface SubjectDetailModalProps {
  subject: Subject;
  onClose: () => void;
  onUpdate: (subject: Subject) => void;
}

export function SubjectDetailModal({ subject, onClose, onUpdate }: SubjectDetailModalProps) {
  const { percentage, gpe, weightSum, isPassing } = computeSubjectGrade(subject);
  const [criterionToDelete, setCriterionToDelete] = useState<number | null>(null);
  const prevGpe = useRef(gpe);
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    if (gpe === 4.0 && prevGpe.current < 4.0) {
      playCelebrationSound();
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#16a34a', '#ffffff', '#facc15']
      });
      setShowCongrats(true);
      setTimeout(() => setShowCongrats(false), 4000);
    }
    prevGpe.current = gpe;
  }, [gpe]);

  const updateCriterion = (idx: number, updates: Partial<Criterion>) => {
    const newCriteria = [...subject.criteria];
    newCriteria[idx] = { ...newCriteria[idx], ...updates };
    onUpdate({ ...subject, criteria: newCriteria });
  };

  const addComponent = (idx: number) => {
    const newCriteria = [...subject.criteria];
    newCriteria[idx].components.push({ id: crypto.randomUUID(), label: 'New', score: '', total: '' });
    onUpdate({ ...subject, criteria: newCriteria });
  };

  const updateComponent = (cIdx: number, compIdx: number, updates: Partial<Component>) => {
    const newCriteria = [...subject.criteria];
    const newComps = [...newCriteria[cIdx].components];
    newComps[compIdx] = { ...newComps[compIdx], ...updates };
    newCriteria[cIdx].components = newComps;
    onUpdate({ ...subject, criteria: newCriteria });
  };

  const removeComponent = (cIdx: number, compIdx: number) => {
    const newCriteria = [...subject.criteria];
    newCriteria[cIdx].components.splice(compIdx, 1);
    onUpdate({ ...subject, criteria: newCriteria });
  };

  const duplicateComponent = (cIdx: number, compIdx: number) => {
    const newCriteria = [...subject.criteria];
    const comp = newCriteria[cIdx].components[compIdx];
    newCriteria[cIdx].components.splice(compIdx + 1, 0, { ...comp, id: crypto.randomUUID() });
    onUpdate({ ...subject, criteria: newCriteria });
  };

  const confirmRemoveCriterion = () => {
    if (criterionToDelete === null) return;
    const newCriteria = [...subject.criteria];
    newCriteria.splice(criterionToDelete, 1);
    onUpdate({ ...subject, criteria: newCriteria });
    setCriterionToDelete(null);
  };

  const addCriterion = () => {
    onUpdate({
      ...subject,
      criteria: [...subject.criteria, { id: crypto.randomUUID(), name: 'New Criterion', weight: 0, components: [] }]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{subject.name}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-500">
                  {subject.lockedWeights ? 'Weights are locked.' : 'You can add/edit criteria; total must be 100%.'}
                </p>
                <Tooltip content={subject.lockedWeights ? "Unlock to edit weights manually" : "Lock weights to prevent accidental changes"}>
                  <button
                    onClick={() => onUpdate({ ...subject, lockedWeights: !subject.lockedWeights })}
                    className="text-xs font-medium text-green-600 hover:text-green-700 underline"
                  >
                    {subject.lockedWeights ? 'Unlock' : 'Lock'}
                  </button>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-500">Scale:</label>
                <select
                  value={subject.scale}
                  onChange={(e) => onUpdate({ ...subject, scale: e.target.value as any })}
                  className="bg-white border border-slate-200 rounded-md px-2 py-1 text-sm text-slate-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  title="Change grading scale"
                >
                  <option value="dlsu">DLSU Scale</option>
                  <option value="standard">Standard (92+)</option>
                  <option value="strict">Strict (95+)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-500">Passing %:</label>
                <input
                  type="number"
                  value={subject.passingPercentage || 60}
                  onChange={(e) => onUpdate({ ...subject, passingPercentage: Number(e.target.value) || 0 })}
                  className="w-16 bg-white border border-slate-200 rounded-md px-2 py-1 text-sm text-slate-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  title="Change passing percentage"
                />
              </div>
            </div>
          </div>
          <Tooltip content="Close" position="bottom">
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X size={24} />
            </button>
          </Tooltip>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {subject.criteria.map((cr, idx) => {
            const avg = computeCriterionAverage(cr.components);
            return (
              <div key={cr.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    {subject.lockedWeights ? (
                      <div className="font-medium text-slate-700">{cr.name}</div>
                    ) : (
                      <input
                        value={cr.name}
                        onChange={(e) => updateCriterion(idx, { name: e.target.value })}
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                        title="Criterion name"
                      />
                    )}
                    {subject.lockedWeights ? (
                      <span className="px-3 py-1 bg-slate-200 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 whitespace-nowrap">
                        {cr.weight}%
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={cr.weight}
                          onChange={(e) => updateCriterion(idx, { weight: Number(e.target.value) || 0 })}
                          className="w-20 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                          title="Criterion weight percentage"
                        />
                        <span className="text-slate-500">%</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium text-slate-500 whitespace-nowrap">
                    {avg == null ? '—' : `${fmt(avg)}% (avg)`}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {cr.components.length === 0 ? (
                    <div className="text-sm text-slate-400 italic py-2">No components yet.</div>
                  ) : (
                    cr.components.map((comp, compIdx) => (
                      <div key={comp.id} className="grid grid-cols-[1fr_80px_80px_auto] gap-2 items-center bg-white p-2 rounded-xl border border-slate-200 hover:border-green-300 transition-colors">
                        <input
                          placeholder="Label"
                          value={comp.label}
                          onChange={(e) => updateComponent(idx, compIdx, { label: e.target.value })}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-green-500"
                          title="Component label (e.g. Quiz 1)"
                        />
                        <input
                          type="number"
                          placeholder="Score"
                          value={comp.score}
                          onChange={(e) => updateComponent(idx, compIdx, { score: e.target.value })}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-green-500"
                          title="Your score"
                        />
                        <input
                          type="number"
                          placeholder="Total"
                          value={comp.total}
                          onChange={(e) => updateComponent(idx, compIdx, { total: e.target.value })}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-green-500"
                          title="Total possible score"
                        />
                        <div className="flex gap-1">
                          <Tooltip content="Duplicate component" position="top">
                            <button onClick={() => duplicateComponent(idx, compIdx)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                              <Copy size={14} />
                            </button>
                          </Tooltip>
                          <Tooltip content="Remove component" position="top">
                            <button onClick={() => removeComponent(idx, compIdx)} className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Tooltip content="Add a new score component">
                    <button
                      onClick={() => addComponent(idx)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Plus size={16} /> Add Component
                    </button>
                  </Tooltip>
                  {!subject.lockedWeights && (
                    <Tooltip content="Delete this criterion">
                      <button
                        onClick={() => setCriterionToDelete(idx)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors ml-auto"
                      >
                        <Trash2 size={16} /> Delete Criterion
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>
            );
          })}
          
          {!subject.lockedWeights && (
            <Tooltip content="Add a new grading criterion" position="top">
              <button
                onClick={addCriterion}
                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-300 hover:border-green-400 text-slate-500 hover:text-green-600 rounded-2xl transition-colors font-medium"
              >
                <Plus size={20} /> Add New Criterion
              </button>
            </Tooltip>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <div className={`px-4 py-2 rounded-xl border text-sm font-medium ${Math.round(weightSum) === 100 ? 'bg-white border-slate-200 text-slate-600' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
              Total Weight: {fmt(weightSum)}%
            </div>
            <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800">
              Grade: {fmt(percentage)}%
            </div>
            <div className={`px-4 py-2 border rounded-xl text-sm font-medium ${isPassing ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              GPE: {gpe.toFixed(1)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-700 hover:bg-green-600 text-white rounded-xl font-medium transition-colors shadow-md shadow-green-700/20"
            title="Close and save changes"
          >
            Done
          </button>
        </div>
      </motion.div>
      <ConfirmModal
        isOpen={criterionToDelete !== null}
        title="Delete Criterion"
        message="Are you sure you want to delete this criterion? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmRemoveCriterion}
        onCancel={() => setCriterionToDelete(null)}
      />

      <AnimatePresence>
        {showCongrats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white/90 backdrop-blur-md border border-green-200 px-8 py-6 rounded-3xl shadow-2xl text-center">
              <h2 className="text-4xl font-bold text-green-600 mb-2">Congratulations! 🎉</h2>
              <p className="text-lg text-slate-700 font-medium">You've achieved a 4.0 in {subject.name}!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
