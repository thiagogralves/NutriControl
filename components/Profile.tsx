
import React, { useState } from 'react';
import { AppState, User } from '../types';

interface Props {
  state: AppState;
  activeUser: User;
  logWeight: (weight: number) => void;
  removeWeight: (date: string) => void;
  removeExercise: (date: string) => void;
}

const Profile: React.FC<Props> = ({ state, activeUser, logWeight, removeWeight, removeExercise }) => {
  const [newWeight, setNewWeight] = useState('');
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  
  const userWeights = state.weightLogs
    .filter(l => l.userId === activeUser)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const exerciseLogs = state.exerciseLogs
    .filter(l => l.userId === activeUser && l.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const currentWeight = userWeights[0]?.weight || '--';
  const exerciseCount = exerciseLogs.length;

  const copyAppLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopyFeedback(true);
    setTimeout(() => setShowCopyFeedback(false), 3000);
  };

  const accentColor = activeUser === 'Thiago' ? 'bg-sky-500' : 'bg-rose-500';
  const accentText = activeUser === 'Thiago' ? 'text-sky-600' : 'text-rose-600';
  const accentLight = activeUser === 'Thiago' ? 'bg-sky-100' : 'bg-rose-100';

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="text-center py-6">
        <div className={`w-24 h-24 ${accentLight} ${accentText} rounded-full mx-auto flex items-center justify-center mb-4 border-4 border-white shadow-lg`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{activeUser}</h2>
        <p className="text-sm text-slate-400">Objetivo: Manter Foco & Saúde</p>
      </div>

      <button 
        onClick={copyAppLink}
        className={`w-full py-4 ${accentLight} ${accentText} rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 mb-4 px-4 text-center`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9a3 3 0 100-2.684 3 3 0 000 2.684z" />
        </svg>
        <span className="truncate">{showCopyFeedback ? 'Link Copiado!' : `Copiar Link para ${activeUser === 'Thiago' ? 'Marcela' : 'Thiago'}`}</span>
      </button>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 text-center">
          <span className="block text-3xl font-bold text-slate-800 leading-none">{currentWeight} <span className="text-xs font-normal text-slate-400">kg</span></span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 block">Peso Atual</span>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 text-center">
          <span className="block text-3xl font-bold text-slate-800 leading-none">{exerciseCount}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 block">Dias Treinados</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-700 mb-4 text-xs uppercase tracking-wide">Registrar Peso</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input 
              type="number" 
              step="0.1"
              inputMode="decimal"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="0.0"
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 outline-none text-slate-700 focus:ring-2 focus:ring-emerald-500 text-lg font-bold"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-sm">kg</span>
          </div>
          <button 
            onClick={() => {
              if (newWeight) {
                logWeight(parseFloat(newWeight));
                setNewWeight('');
              }
            }}
            className={`${accentColor} text-white px-6 py-3 sm:py-0 rounded-xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-md`}
          >
            Salvar
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Histórico de Treinos
        </h3>
        <div className="space-y-3 max-h-48 overflow-y-auto hide-scrollbar">
          {exerciseLogs.length === 0 ? (
            <p className="text-slate-300 text-xs italic text-center py-2">Nenhum treino registrado.</p>
          ) : (
            exerciseLogs.map((log, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm py-3 group border-b border-slate-50 last:border-none">
                <span className="text-slate-500 font-medium">{new Date(log.date).toLocaleDateString('pt-BR')}</span>
                <div className="flex items-center gap-3">
                  <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Treinado</span>
                  <button 
                    onClick={() => removeExercise(log.date)}
                    className="p-1 text-slate-300 hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide">Evolução de Peso</h3>
        <div className="space-y-3 max-h-48 overflow-y-auto hide-scrollbar">
          {userWeights.length === 0 ? (
            <p className="text-slate-300 text-xs italic text-center py-2">Nenhum registro ainda.</p>
          ) : (
            userWeights.map((log, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm py-3 border-b border-slate-50 last:border-none">
                <span className="text-slate-500">{new Date(log.date).toLocaleDateString('pt-BR')}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800">{log.weight} kg</span>
                  <button 
                    onClick={() => removeWeight(log.date)}
                    className="p-1 text-slate-300 hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
