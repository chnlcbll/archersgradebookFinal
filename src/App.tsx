import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Calculator, Plus, RotateCcw, Download, Upload, HelpCircle } from 'lucide-react';
import { Subject } from './types';
import { defaultSubjects, playSuccessSound } from './utils';
import { SubjectCard } from './components/SubjectCard';
import { SubjectDetailModal } from './components/SubjectDetailModal';
import { AddSubjectModal } from './components/AddSubjectModal';
import { CalculatorView } from './components/CalculatorView';
import { ConfirmModal } from './components/ConfirmModal';
import { HelpView } from './components/HelpView';
import { Tooltip } from './components/Tooltip';
import { AnimatePresence } from 'motion/react';

const STORAGE_KEY = 'gradebookDataV2';

export default function App() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'calc' | 'help'>('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSubjects(JSON.parse(raw));
      } else {
        setSubjects(defaultSubjects());
      }
    } catch (e) {
      console.warn('Failed to load state', e);
      setSubjects(defaultSubjects());
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
    }
  }, [subjects, isLoaded]);

  const confirmReset = () => {
    setSubjects(defaultSubjects());
    setIsResetting(false);
  };

  const confirmDeleteSubject = () => {
    if (subjectToDelete) {
      setSubjects(subjects.filter(s => s.id !== subjectToDelete));
      setSubjectToDelete(null);
    }
  };

  const handleUpdateSubject = (updated: Subject) => {
    setSubjects(subjects.map(s => s.id === updated.id ? updated : s));
  };

  const handleAddSubject = (newSubject: Subject) => {
    setSubjects([...subjects, newSubject]);
    setIsAddModalOpen(false);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(subjects));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "archer_gradebook_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    playSuccessSound();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setSubjects(imported);
          playSuccessSound();
        } else {
          console.error("Invalid format: Expected an array of subjects.");
        }
      } catch (err) {
        console.error("Failed to parse JSON", err);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  if (!isLoaded) return null;

  const editingSubject = subjects.find(s => s.id === editingSubjectId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-green-500/30">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="relative bg-green-800 text-white overflow-hidden rounded-3xl mb-12 shadow-xl">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" 
            alt="Campus" 
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" 
          />
          <div className="relative p-8 sm:p-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden p-1.5">
                <img src="/logo.svg" alt="Archer Gradebook Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Archer Gradebook</h1>
                <p className="text-green-100 mt-1">Plan and track your academic progress.</p>
              </div>
            </div>

            <div className="flex flex-wrap bg-green-900/50 p-1.5 rounded-xl backdrop-blur-sm">
              <Tooltip content="View your saved subjects">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === 'home'
                      ? 'bg-white text-green-900 shadow-sm'
                      : 'text-green-50 hover:bg-green-800/50'
                  }`}
                >
                  <BookOpen size={16} /> Subjects
                </button>
              </Tooltip>
              <Tooltip content="Quick grade calculator">
                <button
                  onClick={() => setActiveTab('calc')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === 'calc'
                      ? 'bg-white text-green-900 shadow-sm'
                      : 'text-green-50 hover:bg-green-800/50'
                  }`}
                >
                  <Calculator size={16} /> Calculator
                </button>
              </Tooltip>
              <Tooltip content="View tutorials and FAQs">
                <button
                  onClick={() => setActiveTab('help')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === 'help'
                      ? 'bg-white text-green-900 shadow-sm'
                      : 'text-green-50 hover:bg-green-800/50'
                  }`}
                >
                  <HelpCircle size={16} /> Help
                </button>
              </Tooltip>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {activeTab === 'home' ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-3">
                  <Tooltip content="Add a new subject manually or via syllabus upload">
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-green-700/20"
                    >
                      <Plus size={16} /> Add Subject
                    </button>
                  </Tooltip>
                  <input 
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImport}
                  />
                  <Tooltip content="Import gradebook data from a file">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-sm font-medium transition-colors shadow-sm"
                    >
                      <Upload size={16} />
                      <span className="hidden sm:inline">Import</span>
                    </button>
                  </Tooltip>
                  <Tooltip content="Export your gradebook data to a file">
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-sm font-medium transition-colors shadow-sm"
                    >
                      <Download size={16} />
                      <span className="hidden sm:inline">Export</span>
                    </button>
                  </Tooltip>
                  <Tooltip content="Reset to default example subjects">
                    <button
                      onClick={() => setIsResetting(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-sm font-medium transition-colors shadow-sm"
                    >
                      <RotateCcw size={16} />
                      <span className="hidden sm:inline">Reset Defaults</span>
                    </button>
                  </Tooltip>
                </div>
                <p className="text-sm text-slate-500 hidden sm:block">
                  Click a card to view and edit details
                </p>
              </div>

              {subjects.length === 0 ? (
                <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
                  <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">No subjects yet</h3>
                  <p className="text-slate-500 mb-6">Add your first subject to start tracking your grades.</p>
                  <Tooltip content="Add a new subject">
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 hover:bg-green-600 text-white rounded-xl font-medium transition-colors shadow-md shadow-green-700/20"
                    >
                      <Plus size={20} /> Add Subject
                    </button>
                  </Tooltip>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjects.map(subject => (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      onOpen={setEditingSubjectId}
                      onDelete={setSubjectToDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'calc' ? (
            <CalculatorView />
          ) : (
            <HelpView />
          )}
        </main>

        <footer className="mt-20 text-center text-sm text-slate-500">
          <p>© Archer Gradebook. All calculations are local and saved in your browser.</p>
        </footer>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddSubjectModal
            onClose={() => setIsAddModalOpen(false)}
            onSave={handleAddSubject}
          />
        )}
        {editingSubject && (
          <SubjectDetailModal
            subject={editingSubject}
            onClose={() => setEditingSubjectId(null)}
            onUpdate={handleUpdateSubject}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={isResetting}
        title="Reset Gradebook"
        message="Are you sure you want to reset to default subjects? This will erase all your custom subjects and scores."
        confirmText="Reset"
        onConfirm={confirmReset}
        onCancel={() => setIsResetting(false)}
      />

      <ConfirmModal
        isOpen={subjectToDelete !== null}
        title="Delete Subject"
        message="Are you sure you want to delete this subject? All criteria and scores will be lost."
        confirmText="Delete"
        onConfirm={confirmDeleteSubject}
        onCancel={() => setSubjectToDelete(null)}
      />
    </div>
  );
}
