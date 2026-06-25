import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { Subject, Criterion } from '../types';
import { playSuccessSound } from '../utils';
import { Tooltip } from './Tooltip';

interface AddSubjectModalProps {
  onClose: () => void;
  onSave: (subject: Subject) => void;
}

export function AddSubjectModal({ onClose, onSave }: AddSubjectModalProps) {
  const [name, setName] = useState('');
  const [scale, setScale] = useState<'standard' | 'strict' | 'dlsu'>('dlsu');
  const [passingPercentage, setPassingPercentage] = useState(60);
  const [lockedWeights, setLockedWeights] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [criteria, setCriteria] = useState<Omit<Criterion, 'components'>[]>([
    { id: crypto.randomUUID(), name: 'Long Exams', weight: 60 },
    { id: crypto.randomUUID(), name: 'Final Exam', weight: 30 },
    { id: crypto.randomUUID(), name: 'Quizzes / Activities', weight: 10 },
  ]);

  const totalWeight = criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);

  const handleSave = () => {
    onSave({
      id: crypto.randomUUID(),
      name: name.trim() || 'Untitled Subject',
      scale,
      lockedWeights,
      passingPercentage,
      criteria: criteria.map(c => ({ ...c, components: [] }))
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          
          const response = await fetch('/api/extract-syllabus', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              base64Data,
              mimeType: file.type
            })
          });

          if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
          }

          const data = await response.json();
          
          if (data.subjectName && data.subjectName !== 'Untitled Subject') {
            setName(data.subjectName);
          }
          if (data.criteria && data.criteria.length > 0) {
            setCriteria(data.criteria.map((c: any) => ({
              id: crypto.randomUUID(),
              name: c.name,
              weight: c.weight
            })));
            setLockedWeights(true);
            playSuccessSound();
          }
        } catch (err) {
          console.error("Failed to extract syllabus data", err);
          alert("Failed to extract syllabus data. Please try again.");
        } finally {
          setIsExtracting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Failed to read file", err);
      setIsExtracting(false);
    }
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
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-2xl font-bold text-slate-800">Add Subject</h2>
          <Tooltip content="Close" position="bottom">
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X size={24} />
            </button>
          </Tooltip>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Syllabus Upload Section */}
          <div className="bg-green-50/50 border border-green-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div>
              <h3 className="text-sm font-semibold text-green-800">Auto-fill from Syllabus</h3>
              <p className="text-xs text-green-600 mt-1">Upload a screenshot or PDF file of the grading system or the syllabus to automatically extract the criteria and weights.</p>
            </div>
            <input 
              type="file" 
              accept="application/pdf,image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Tooltip content="Upload PDF or Image" className="shrink-0">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-green-200 text-green-700 hover:bg-green-50 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExtracting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {isExtracting ? 'Extracting...' : 'Upload Syllabus'}
              </button>
            </Tooltip>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-slate-600">Subject Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. LBYBI13"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              />
            </div>
            <div className="sm:w-40 space-y-2">
              <label className="text-sm font-medium text-slate-600">Grading Scale</label>
              <select
                value={scale}
                onChange={e => setScale(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all appearance-none"
              >
                <option value="dlsu">DLSU Scale</option>
                <option value="standard">Standard (92+)</option>
                <option value="strict">Strict (95+)</option>
              </select>
            </div>
            <div className="sm:w-32 space-y-2">
              <label className="text-sm font-medium text-slate-600">Passing %</label>
              <input
                type="number"
                value={passingPercentage}
                onChange={e => setPassingPercentage(Number(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              />
            </div>
          </div>

          <div className={`p-4 rounded-xl border text-sm ${Math.round(totalWeight) === 100 ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
            {Math.round(totalWeight) === 100 
              ? 'Looks good. Total weight is 100%.' 
              : 'Total must equal 100%. You can still save, but calculations will scale relative to given weights.'}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-600">Criteria</label>
              {lockedWeights && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                  Weights Locked (Auto-filled)
                </span>
              )}
            </div>
            {criteria.map((c, idx) => (
              <div key={c.id} className="flex items-center gap-3">
                <input
                  value={c.name}
                  onChange={e => {
                    const newC = [...criteria];
                    newC[idx].name = e.target.value;
                    setCriteria(newC);
                  }}
                  placeholder="Criterion name"
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-green-500 transition-all"
                />
                <div className="relative w-24">
                  <input
                    type="number"
                    value={c.weight}
                    onChange={e => {
                      const newC = [...criteria];
                      newC[idx].weight = Number(e.target.value) || 0;
                      setCriteria(newC);
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-4 pr-8 py-2.5 text-slate-800 focus:outline-none focus:border-green-500 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                </div>
                <Tooltip content="Remove Criterion" position="top">
                  <button
                    onClick={() => setCriteria(criteria.filter((_, i) => i !== idx))}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </Tooltip>
              </div>
            ))}
            <Tooltip content="Add a new criterion">
              <button
                onClick={() => setCriteria([...criteria, { id: crypto.randomUUID(), name: '', weight: 0 }])}
                className="flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors py-2"
              >
                <Plus size={16} /> Add Criterion
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-sm font-medium text-slate-500">
            Total Weight: <span className={Math.round(totalWeight) === 100 ? 'text-slate-800' : 'text-amber-600'}>{totalWeight}%</span>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-slate-600 hover:text-slate-800 font-medium transition-colors" title="Cancel">
              Cancel
            </button>
            <button onClick={handleSave} className="px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-green-700/20" title="Save Subject">
              Save Subject
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
