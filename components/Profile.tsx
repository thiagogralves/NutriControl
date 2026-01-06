
import React, { useState, useMemo, useEffect } from 'react';
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
  const [logs, setLogs] = useState<string[]>([]);

  // Atualiza os logs internos a cada 2 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs([...((window as any).appLogs || [])]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  
  const userWeights = useMemo(() => state.weightLogs
    .filter(l => l.userId === activeUser)
    .sort((a, b) => a.date.localeCompare(b.date)), [state.weightLogs, activeUser]);

  const waterLogs = useMemo(() => state.waterLogs
    .filter(l => l.userId === activeUser)
    .sort((a, b) => a.date.localeCompare(b.date)), [state.waterLogs, activeUser]);

  const exerciseLogs = useMemo(() => state.exerciseLogs
    .filter(l => l.userId === activeUser && l.completed)
    .sort((a, b) => b.date.localeCompare(a.date)), [state.exerciseLogs, activeUser]);

  const currentWeight = userWeights.length > 0 ? userWeights[userWeights.length - 1].weight : '--';
  const exerciseCount = exerciseLogs.length;

  const accentColor = activeUser === 'Thiago' ? 'bg-sky-500' : 'bg-rose-500';
  const accentText = activeUser === 'Thiago' ? 'text-sky-600' : 'text-rose-600';
  const accentStroke = activeUser === 'Thiago' ? '#0ea5e9' : '#f43f5e';
  const accentLight = activeUser === 'Thiago' ? 'bg-sky-50' : 'bg-rose-50';

  const formatDateBR = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };

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
          <input type="number" step="0.1" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="0.0 kg" className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black outline-none" />
          <button onClick={() => { if(newWeight) { logWeight(parseFloat(newWeight)); setNewWeight(''); } }} className={`${accentColor} text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg`}>Salvar</button>
        </div>
      </div>

      {/* SEÇÃO DE DEBUG PARA O CELULAR */}
      <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-white text-[10px] uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Logs de Sistema (Debug Mobile)
          </h3>
          <button onClick={() => { (window as any).appLogs = []; setLogs([]); }} className="text-[8px] font-bold text-slate-400 uppercase border border-slate-700 px-2 py-1 rounded-lg">Limpar</button>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto hide-scrollbar font-mono">
          {logs.length === 0 ? (
            <p className="text-[9px] text-slate-500 italic">Nenhum evento registrado ainda...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className={`text-[9px] leading-relaxed border-b border-white/5 pb-1 ${log.includes('ERRO') || log.includes('FALHA') ? 'text-rose-400' : 'text-emerald-400'}`}>
                {log}
              </div>
            ))
          )}
        </div>
        <p className="mt-4 text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
          Se aparecer "API_KEY não encontrada", o problema é a configuração no Vercel.
        </p>
      </div>
    </div>
  );
};

export default Profile;
