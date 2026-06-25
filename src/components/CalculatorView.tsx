import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2 } from 'lucide-react';
import { Criterion } from '../types';
import { fmt, toGPE } from '../utils';
import { ConfirmModal } from './ConfirmModal';
import { Tooltip } from './Tooltip';

export function CalculatorView() {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [passingPercentage, setPassingPercentage] = useState(60);
  const [isClearing, setIsClearing] = useState(false);

  const addCriterion = () => {
    setCriteria([...criteria, { id: crypto.randomUUID(), name: '', weight: 0, components: [] }]);
  };

  const updateCriterion = (idx: number, updates: Partial<Criterion>) => {
    const newC = [...criteria];
    newC[idx] = { ...newC[idx], ...updates };
    setCriteria(newC);
  };

  const removeCriterion = (idx: number) => {
    setCriteria(criteria.filter((_, i) => i !== idx));
  };

  const addComponent = (cIdx: number) => {
    const newC = [...criteria];
    newC[cIdx].components.push({ id: crypto.randomUUID(), label: '', score: '', total: '' });
    setCriteria(newC);
  };

  const updateComponent = (cIdx: number, compIdx: number, updates: any) => {
    const newC = [...criteria];
    newC[cIdx].components[compIdx] = { ...newC[cIdx].components[compIdx], ...updates };
    setCriteria(newC);
  };

  const removeComponent = (cIdx: number, compIdx: number) => {
    const newC = [...criteria];
    newC[cIdx].components.splice(compIdx, 1);
    setCriteria(newC);
  };

  const confirmClearAll = () => {
    setCriteria([]);
    setIsClearing(false);
  };

  let totalWeight = 0;
  let totalGrade = 0;
  let hasAny = false;

  criteria.forEach(cr => {
    const weight = Number(cr.weight) || 0;
    totalWeight += weight;
    
    let got = 0, tot = 0;
    cr.components.forEach(c => {
      const s = parseFloat(c.score);
      const t = parseFloat(c.total);
      if (isFinite(s) && isFinite(t) && t > 0) {
        got += Math.max(0, Math.min(s, t));
        tot += t;
      }
    });
    
    if (tot > 0) {
      hasAny = true;
      totalGrade += (100 * got / tot) * (weight / 100);
    }
  });

  const gpe = toGPE(hasAny ? totalGrade : 0, 'dlsu', passingPercentage);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Quick Grade Calculator</h2>
            <p className="text-slate-500">Build any grading scheme, add components, and compute on the fly. This data is not saved to your subjects.</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Passing %:</label>
            <input
              type="number"
              value={passingPercentage}
              onChange={e => setPassingPercentage(Number(e.target.value) || 0)}
              className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              title="Change passing percentage"
            />
          </div>
        </div>

        <div className="space-y-6 mb-8">
          {criteria.map((cr, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={cr.id}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <input
                  placeholder="Criterion name (e.g. Midterms)"
                  value={cr.name}
                  onChange={e => updateCriterion(idx, { name: e.target.value })}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:border-green-500 transition-all"
                  title="Criterion name"
                />
                <div className="flex items-center gap-3">
                  <div className="relative w-24">
                    <input
                      type="number"
                      placeholder="Weight"
                      value={cr.weight || ''}
                      onChange={e => updateCriterion(idx, { weight: Number(e.target.value) || 0 })}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-4 pr-8 py-2 text-slate-800 focus:outline-none focus:border-green-500 transition-all"
                      title="Criterion weight percentage"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                  </div>
                  <Tooltip content="Remove Criterion" position="top">
                    <button onClick={() => removeCriterion(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </Tooltip>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {cr.components.map((comp, compIdx) => (
                  <div key={comp.id} className="grid grid-cols-[1fr_80px_80px_auto] gap-2 items-center">
                    <input
                      placeholder="Label"
                      value={comp.label}
                      onChange={e => updateComponent(idx, compIdx, { label: e.target.value })}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-green-500"
                      title="Component label"
                    />
                    <input
                      type="number"
                      placeholder="Score"
                      value={comp.score}
                      onChange={e => updateComponent(idx, compIdx, { score: e.target.value })}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-green-500"
                      title="Your score"
                    />
                    <input
                      type="number"
                      placeholder="Total"
                      value={comp.total}
                      onChange={e => updateComponent(idx, compIdx, { total: e.target.value })}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-green-500"
                      title="Total possible score"
                    />
                    <Tooltip content="Remove component" position="top">
                      <button onClick={() => removeComponent(idx, compIdx)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </Tooltip>
                  </div>
                ))}
              </div>

              <Tooltip content="Add a new score component">
                <button
                  onClick={() => addComponent(idx)}
                  className="flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                >
                  <Plus size={16} /> Add Component
                </button>
              </Tooltip>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-8">
          <Tooltip content="Add a new grading criterion">
            <button
              onClick={addCriterion}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-green-700/20"
            >
              <Plus size={20} /> Add Criterion
            </button>
          </Tooltip>
          {criteria.length > 0 && (
            <Tooltip content="Clear all data">
              <button onClick={() => setIsClearing(true)} className="px-5 py-2.5 text-slate-500 hover:text-slate-700 font-medium transition-colors">
                Clear All
              </button>
            </Tooltip>
          )}
          <div className="ml-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700">
            Total Weight: {fmt(totalWeight)}%
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-sm font-medium text-green-800 mb-1">Result</div>
            <div className="text-4xl font-bold text-slate-800 tracking-tight">
              {fmt(hasAny ? totalGrade : 0)}<span className="text-2xl text-slate-500">%</span>
            </div>
          </div>
          <div className="h-12 w-px bg-green-200 hidden sm:block"></div>
          <div className="text-center sm:text-right">
            <div className="text-sm font-medium text-green-800 mb-1">DLSU Scale GPE</div>
            <div className="text-3xl font-bold text-slate-800">
              {gpe.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={isClearing}
        title="Clear Calculator"
        message="Are you sure you want to clear all criteria and scores in the calculator?"
        confirmText="Clear All"
        onConfirm={confirmClearAll}
        onCancel={() => setIsClearing(false)}
      />
    </div>
  );
}
