
import React, { useState, useMemo } from 'react';
import { AppState, User } from '../types';

interface Props {
  state: AppState;
  activeUser: User;
  logWeight: (weight: number) => void;
  removeWeight: (date: string) => void;
  removeExercise: (date: string) => void;
  removeWaterLog: (date: string) => void;
}

const Profile: React.FC<Props> = ({ state, activeUser, logWeight, removeWeight, removeExercise, removeWaterLog }) => {
  const [newWeight, setNewWeight] = useState('');
  
  const userWeights = useMemo(() => state.weightLogs
    .filter(l => l.userId === activeUser)
    .sort((a, b) => a.date.localeCompare(b.date)), [state.weightLogs, activeUser]);

  const exerciseLogs = useMemo(() => state.exerciseLogs
    .filter(l => l.userId === activeUser && l.completed)
    .sort((a, b) => b.date.localeCompare(a.date)), [state.exerciseLogs, activeUser]);

  const currentWeight = userWeights.length > 0 ? userWeights[userWeights.length - 1].weight : '--';
  const exerciseCount = exerciseLogs.length;

  const accentColor = activeUser === 'Thiago' ? 'bg-sky-500' : 'bg-rose-500';
  const accentText = activeUser === 'Thiago' ? 'text-sky-600' : 'text-rose-600';
  const accentStroke = activeUser === 'Thiago' ? '#0ea5e9' : '#f43f5e';
  const accentLight = activeUser === 'Thiago' ? 'bg-sky-50' : 'bg-rose-50';

  const weightChartData = useMemo(() => {
    if (userWeights.length < 2) return null;
    const padding = 20;
    const width = 300;
    const height = 100;
    const weights = userWeights.map(w => w.weight);
    const minW = Math.min(...weights) - 1;
    const maxW = Math.max(...weights) + 1;
    const range = maxW - minW;
    const points = userWeights.map((w, i) => {
      const x = padding + (i * (width - 2 * padding) / (userWeights.length - 1));
      const y = height - padding - ((w.weight - minW) * (height - 2 * padding) / range);
      return `${x},${y}`;
    }).join(' ');
    return { points, width, height };
  }, [userWeights]);

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="text-center py-6">
        <div className={`w-24 h-24 ${accentLight} ${accentText} rounded-full mx-auto flex items-center justify-center mb-4 border-4 border-white shadow-lg`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{activeUser}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 text-center">
          <span className="block text-3xl font-black text-slate-800 leading-none">{currentWeight} <span className="text-[10px] font-bold text-slate-400">kg</span></span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 block">Peso Atual</span>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 text-center">
          <span className="block text-3xl font-black text-slate-800 leading-none">{exerciseCount}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 block">Dias Ativos</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-slate-700 text-[10px] uppercase tracking-widest mb-4">Evolução de Peso</h3>
        {weightChartData ? (
          <div className="relative">
            <svg viewBox={`0 0 300 100`} className="w-full h-32 overflow-visible">
              <polyline fill="none" stroke={accentStroke} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={weightChartData.points} />
            </svg>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 italic text-[10px] text-slate-300">Dados insuficientes</div>
        )}
        <div className="mt-6 flex gap-2">
          <input 
            type="number" 
            step="0.1" 
            value={newWeight} 
            onChange={(e) => setNewWeight(e.target.value)} 
            placeholder="0.0 kg" 
            className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black outline-none focus:ring-2 focus:ring-offset-2 transition-all" 
          />
          <button 
            onClick={() => { if(newWeight) { logWeight(parseFloat(newWeight)); setNewWeight(''); } }} 
            className={`${accentColor} text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-transform`}
          >
            Salvar
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <h3 className="font-black text-slate-700 text-[10px] uppercase tracking-widest mb-4">Metas & Saúde</h3>
        <div className="space-y-3">
          <div className={`p-4 ${accentLight} rounded-2xl flex items-center justify-between`}>
            <span className="text-xs font-bold text-slate-600">Beber 2.5L de água</span>
            <div className={`w-2 h-2 rounded-full ${accentColor} animate-pulse`}></div>
          </div>
          <div className={`p-4 ${accentLight} rounded-2xl flex items-center justify-between`}>
            <span className="text-xs font-bold text-slate-600">Exercício 5x por semana</span>
            <div className={`w-2 h-2 rounded-full ${accentColor}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
