
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
  
  // Dados filtrados e ordenados
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

  // --- Lógica do Gráfico de Peso (Linha) ---
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

    return { points, width, height, minW, maxW };
  }, [userWeights]);

  // --- Lógica do Gráfico de Água (Barras - últimos 7 registros) ---
  const waterChartData = useMemo(() => {
    const last7 = waterLogs.slice(-7);
    if (last7.length === 0) return null;
    
    const width = 300;
    const height = 100;
    const padding = 10;
    const maxWater = Math.max(...last7.map(w => w.amountMl), 2000);
    const barWidth = (width - (padding * 2)) / last7.length - 10;

    return last7.map((w, i) => {
      const h = (w.amountMl / maxWater) * (height - 20);
      const x = padding + i * (barWidth + 10);
      const y = height - h;
      return { x, y, h, amount: w.amountMl, date: formatDateBR(w.date) };
    });
  }, [waterLogs]);

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="text-center py-6">
        <div className={`w-24 h-24 ${accentLight} ${accentText} rounded-full mx-auto flex items-center justify-center mb-4 border-4 border-white shadow-lg`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{activeUser}</h2>
        <div className="flex justify-center gap-2 mt-2">
          <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 shadow-sm">
            Foco & Saúde
          </span>
        </div>
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

      {/* Gráfico de Peso */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-slate-700 text-[10px] uppercase tracking-widest">Evolução de Peso</h3>
          <span className={`text-[10px] font-bold ${accentText}`}>Últimos registros</span>
        </div>
        
        {weightChartData ? (
          <div className="relative">
            <svg viewBox={`0 0 ${weightChartData.width} ${weightChartData.height}`} className="w-full h-32 overflow-visible">
              <polyline
                fill="none"
                stroke={accentStroke}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={weightChartData.points}
                className="drop-shadow-sm"
              />
              {weightChartData.points.split(' ').map((p, i) => {
                const [x, y] = p.split(',');
                return (
                  <circle key={i} cx={x} cy={y} r="4" fill="white" stroke={accentStroke} strokeWidth="2" />
                );
              })}
            </svg>
            <div className="flex justify-between mt-2 px-4">
              <span className="text-[8px] font-bold text-slate-300 uppercase">{formatDateBR(userWeights[0].date)}</span>
              <span className="text-[8px] font-bold text-slate-300 uppercase">{formatDateBR(userWeights[userWeights.length - 1].date)}</span>
            </div>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-[10px] text-slate-300 font-bold uppercase italic">Dados insuficientes para o gráfico</p>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block">Novo Registro</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input 
                type="number" 
                step="0.1"
                inputMode="decimal"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="0.0"
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none text-slate-700 focus:ring-2 focus:ring-emerald-500 text-sm font-black transition-all"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 font-black text-[10px] uppercase">kg</span>
            </div>
            <button 
              onClick={() => {
                if (newWeight) {
                  logWeight(parseFloat(newWeight));
                  setNewWeight('');
                }
              }}
              className={`${accentColor} text-white px-6 py-4 rounded-2xl font-black text-[10px] hover:opacity-90 transition-all active:scale-95 shadow-lg uppercase`}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>

      {/* Gráfico de Hidratação */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-slate-700 text-[10px] uppercase tracking-widest">Consumo de Água (ml)</h3>
          <span className={`text-[10px] font-bold ${activeUser === 'Thiago' ? 'text-sky-500' : 'text-rose-500'}`}>Últimos 7 dias</span>
        </div>

        {waterChartData ? (
          <div>
            <svg viewBox="0 0 300 100" className="w-full h-32 overflow-visible">
              {waterChartData.map((bar, i) => (
                <g key={i}>
                  <rect
                    x={bar.x}
                    y={bar.y}
                    width={20}
                    height={bar.h}
                    rx="6"
                    fill={accentStroke}
                    className="opacity-90"
                  />
                  <text
                    x={bar.x + 10}
                    y="110"
                    textAnchor="middle"
                    className="fill-slate-300 font-bold text-[8px]"
                  >
                    {bar.date}
                  </text>
                  <text
                    x={bar.x + 10}
                    y={bar.y - 5}
                    textAnchor="middle"
                    className="fill-slate-400 font-black text-[7px]"
                  >
                    {bar.amount}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-[10px] text-slate-300 font-bold uppercase italic">Nenhum registro de água encontrado</p>
          </div>
        )}
      </div>

      {/* Histórico Detalhado */}
      <div className="space-y-4">
        <h3 className="px-2 font-black text-slate-400 text-[10px] uppercase tracking-widest">Registros Históricos</h3>
        
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h4 className="font-black text-slate-700 text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-orange-400 rounded-full"></div>
            Treinos
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
            {exerciseLogs.length === 0 ? (
              <p className="text-slate-300 text-[10px] font-bold uppercase italic text-center py-4">Nenhum treino registrado.</p>
            ) : (
              exerciseLogs.map((log, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-2xl group">
                  <span className="text-slate-500 text-[10px] font-bold">{formatDateBR(log.date)}</span>
                  <div className="flex items-center gap-3">
                    <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">Concluído</span>
                    <button onClick={() => removeExercise(log.date)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h4 className="font-black text-slate-700 text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
            <div className={`w-1.5 h-4 ${activeUser === 'Thiago' ? 'bg-sky-400' : 'bg-rose-400'} rounded-full`}></div>
            Peso
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
            {[...userWeights].reverse().map((log, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-2xl">
                <span className="text-slate-500 text-[10px] font-bold">{formatDateBR(log.date)}</span>
                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-800 text-xs">{log.weight} kg</span>
                  <button onClick={() => removeWeight(log.date)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
