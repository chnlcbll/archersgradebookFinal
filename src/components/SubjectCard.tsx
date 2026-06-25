import React from 'react';
import { motion } from 'motion/react';
import { Trash2, ExternalLink } from 'lucide-react';
import { Subject } from '../types';
import { computeSubjectGrade, fmt } from '../utils';
import { Tooltip } from './Tooltip';

interface SubjectCardProps {
  subject: Subject;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onOpen, onDelete }) => {
  const { percentage, gpe, isPassing } = computeSubjectGrade(subject);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative flex flex-col bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-green-300 transition-all cursor-pointer overflow-hidden"
      onClick={() => onOpen(subject.id)}
      title={`Click to view and edit ${subject.name}`}
    >
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip content="Open Subject Details" position="top">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen(subject.id);
            }}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
          >
            <ExternalLink size={16} />
          </button>
        </Tooltip>
        <Tooltip content="Delete Subject" position="top">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(subject.id);
            }}
            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </Tooltip>
      </div>

      <h3 className="text-lg font-semibold text-slate-800 mb-1 pr-20">{subject.name}</h3>
      <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-4">
        <span>Scale: {subject.scale === 'dlsu' ? 'DLSU' : subject.scale === 'strict' ? '95+ → 4.0' : '92+ → 4.0'}</span>
        {subject.lockedWeights && (
          <span className="px-2 py-0.5 bg-slate-100 rounded-full border border-slate-200">
            locked weights
          </span>
        )}
      </div>

      <div className="flex items-end gap-4 mb-4">
        <div className="text-4xl font-bold text-slate-800 tracking-tight">
          {fmt(percentage)}<span className="text-2xl text-slate-400">%</span>
        </div>
        <div className={`px-3 py-1 rounded-xl text-sm font-medium mb-1 ${isPassing ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
          GPE: {gpe.toFixed(1)}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100">
        <div className="flex flex-wrap gap-2">
          {subject.criteria.map(c => (
            <span key={c.id} className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600">
              {c.name} · {c.weight}%
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
