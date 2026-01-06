
import React, { useState, useMemo } from 'react';
import { AppState, User } from '../types';
import { getTodayInBrasilia } from '../utils/dateUtils';

interface Props {
  state: AppState;
  activeUser: User;
  logWeight: (weight: number) => void;
  removeWeight: (date: string) => void;
  removeExercise: (date: string) => void;
  removeWaterLog: (date: string) => void;
}

const Profile: React.FC<Props> = ({ state, activeUser, logWeight }) => {
  const [newWeight, setNewWeight] = useState('');
  
  const accentColor = activeUser === 'Thiago' ? 'bg-sky-500' : 'bg-rose-500';
  const accentText = activeUser === 'Thiago' ? 'text-sky-600' : 'text-rose-600';
  const accentStroke = activeUser === 'Thiago' ? '#0ea5e9' : '#f43f5e';
  const accentLight = activeUser === 'Thiago' ? 'bg-sky-50' : 'bg-rose-50';
  const accentBorder = activeUser === 'Thiago' ? 'border-sky-100' : 'border-rose-100';

  // Dados de Peso (Últimos 10 registros)
  const userWeights = useMemo(() => state.weightLogs
    .filter(l => l.userId === activeUser)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-10), [state.weightLogs, activeUser]);

  const currentWeightNum = useMemo(() => {
    return userWeights.length > 0 ? userWeights[userWeights.length - 1].weight : null;
  }, [userWeights]);

  const currentWeightDisplay = currentWeightNum ? currentWeightNum : '--';

  // Meta de Hidratação Individualizada (35ml por kg, fallback 3L)
  const hydrationGoalMl = useMemo(() => {
    if (!currentWeightNum) return 3000;
    return Math.round(currentWeightNum * 35);
  }, [currentWeightNum]);

  const hydrationGoalLabel = `${(hydrationGoalMl / 1000).toFixed(1)}L`;

  // Dados de Água (Últimos 7 dias)
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = getTodayInBrasilia();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      days.push(str);
    }
    return days;
  }, []);

  const waterHistory = useMemo(() => {
    return last7Days.map(date => {
      const log = state.waterLogs.find(l => l.userId === activeUser && l.date === date);
      return { date, amount: log ? log.amountMl : 0 };
    });
  }, [state.waterLogs, activeUser, last7Days]);

  // Dados de Exercício (Sim/Não - Últimos 7 dias)
  const exerciseHistory = useMemo(() => {
    return last7Days.map(date => {
      const completed = state.exerciseLogs.some(l => l.userId === activeUser && l.date === date && l.completed);
      return { date, completed };
    });
  }, [state.exerciseLogs, activeUser, last7Days]);

  const exerciseTotal = state.exerciseLogs.filter(l => l.userId === activeUser && l.completed).length;

  // Gerador de Gráfico de Linha (Peso)
  const weightChart = useMemo(() => {
    if (userWeights.length < 2) return null;
    const padding = 20;
    const w = 300, h = 100;
    const weights = userWeights.map(v => v.weight);
    const minW = Math.min(...weights) - 0.5;
    const maxW = Math.max(...weights) + 0.5;
    const range = maxW - minW;
    const points = userWeights.map((v, i) => {
      const x = padding + (i * (w - 2 * padding) / (userWeights.length - 1));
      const y = h - padding - ((v.weight - minW) * (h - 2 * padding) / range);
      return `${x},${y}`;
    }).join(' ');
    return { points, w, h };
  }, [userWeights]);

  // Gerador de Gráfico de Barras (Água)
  const waterChart = useMemo(() => {
    const maxScale = Math.max(...waterHistory.map(d => d.amount), hydrationGoalMl, 2000);
    return waterHistory.map((d) => ({
      ...d,
      height: (d.amount / maxScale) * 100,
      reachedGoal: d.amount >= hydrationGoalMl
    }));
  }, [waterHistory, hydrationGoalMl]);

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      <div className="text-center py-6">
        <div className={`w-24 h-24 ${accentLight} ${accentText} rounded-full mx-auto flex items-center justify-center mb-4 border-4 border-white shadow-lg`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{activeUser}</h2>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Status de Saúde</p>
      </div>

      {/* Seção de Exercícios (Sim/Não) */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-slate-700 text-[10px] uppercase tracking-widest">Atividade Semanal</h3>
          <span className={`${accentText} text-[10px] font-black`}>{exerciseTotal} totais</span>
        </div>
        <div className="flex justify-between items-center px-2">
          {exerciseHistory.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${day.completed ? `${accentColor} text-white shadow-md` : 'bg-slate-100 text-slate-300'}`}>
                {day.completed ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-[10px] font-bold">●</span>
                )}
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase">{['S','T','Q','Q','S','S','D'][(new Date(day.date).getDay() + 6) % 7]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Seção de Peso */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-black text-slate-700 text-[10px] uppercase tracking-widest">Evolução de Peso</h3>
          <span className="text-xl font-black text-slate-800 leading-none">{currentWeightDisplay} <span className="text-[10px] text-slate-400">kg</span></span>
        </div>
        
        {weightChart ? (
          <div className="relative h-24 mb-4">
            <svg viewBox={`0 0 ${weightChart.w} ${weightChart.h}`} className="w-full h-full overflow-visible">
              <path 
                d={`M ${weightChart.points}`} 
                fill="none" 
                stroke={accentStroke} 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              {userWeights.map((v, i) => {
                const parts = weightChart.points.split(' ');
                const [x, y] = parts[i].split(',');
                return <circle key={i} cx={x} cy={y} r="4" fill="white" stroke={accentStroke} strokeWidth="2" />;
              })}
            </svg>
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 italic text-[10px] text-slate-300 mb-4">Dados insuficientes para gráfico</div>
        )}

        <div className="flex gap-2">
          <input 
            type="number" 
            step="0.1" 
            value={newWeight} 
            onChange={(e) => setNewWeight(e.target.value)} 
            placeholder="Novo peso" 
            className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-offset-2 transition-all" 
          />
          <button 
            onClick={() => { if(newWeight) { logWeight(parseFloat(newWeight)); setNewWeight(''); } }} 
            className={`${accentColor} text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95`}
          >
            Log
          </button>
        </div>
      </div>

      {/* Seção de Água */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-slate-700 text-[10px] uppercase tracking-widest mb-6">Consumo de Água (7 dias)</h3>
        <div className="flex justify-between items-end h-24 gap-2 px-2">
          {waterChart.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative w-full flex flex-col justify-end h-full">
                <div 
                  className={`w-full rounded-t-lg transition-all duration-500 ${day.reachedGoal ? (activeUser === 'Thiago' ? 'bg-sky-500 shadow-sky-100' : 'bg-rose-500 shadow-rose-100') : 'bg-slate-200'}`}
                  style={{ height: `${Math.max(day.height, 5)}%` }}
                ></div>
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase">{day.date.split('-')[2]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Metas Dinâmicas */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <h3 className="font-black text-slate-700 text-[10px] uppercase tracking-widest mb-4">Objetivos Ativos</h3>
        <div className="space-y-3">
          <div className={`p-4 ${accentLight} rounded-2xl flex items-center justify-between border ${accentBorder}`}>
            <div>
              <span className="text-xs font-bold text-slate-600 block">Hidratação Mínima: {hydrationGoalLabel}</span>
              <span className="text-[8px] text-slate-400 font-bold uppercase">{currentWeightNum ? `Baseado em ${currentWeightNum}kg` : 'Peso não informado (Padrão 3L)'}</span>
            </div>
            <div className={`w-2.5 h-2.5 rounded-full ${accentColor} shadow-sm`}></div>
          </div>
          <div className={`p-4 ${accentLight} rounded-2xl flex items-center justify-between border ${accentBorder}`}>
            <span className="text-xs font-bold text-slate-600">Treinos Semanais: 5 dias</span>
            <div className={`w-2.5 h-2.5 rounded-full ${accentColor} shadow-sm`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
