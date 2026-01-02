
import React, { useMemo } from 'react';
import { AppState, User } from '../types';

interface Props {
  state: AppState;
  activeUser: User;
  logWater: (amount: number) => void;
  toggleExercise: (date: string) => void;
  removeMeal: (id: string) => void;
  toggleMealConsumed: (id: string) => void;
}

const Dashboard: React.FC<Props> = ({ state, activeUser, logWater, toggleExercise, removeMeal, toggleMealConsumed }) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const dayIndex = now.getDay() - 1; // 0 (Mon) to 4 (Fri)
  
  // Format current date nicely
  const formattedDate = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const dailyMeals = useMemo(() => 
    state.meals.filter(m => m.userId === activeUser && m.dayOfWeek === Math.max(0, Math.min(dayIndex, 4))),
    [state.meals, activeUser, dayIndex]
  );

  const dailyCalories = dailyMeals.reduce((acc, m) => m.consumed ? acc + m.calories : acc, 0);
  const waterToday = state.waterLogs.find(l => l.date === today && l.userId === activeUser)?.amountMl || 0;
  const exercisedToday = state.exerciseLogs.find(l => l.date === today && l.userId === activeUser)?.completed || false;

  const userTheme = activeUser === 'Thiago' ? 'from-sky-500 to-sky-600 shadow-sky-200' : 'from-rose-500 to-rose-600 shadow-rose-200';
  const exerciseTheme = exercisedToday 
    ? (activeUser === 'Thiago' ? 'bg-sky-500 border-sky-500 text-white' : 'bg-rose-500 border-rose-500 text-white')
    : 'bg-white border-slate-100';

  const accentColor = activeUser === 'Thiago' ? 'text-sky-600' : 'text-rose-600';
  const accentBg = activeUser === 'Thiago' ? 'bg-sky-50' : 'bg-rose-50';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Daily Summary Card */}
      <div className={`bg-gradient-to-br ${userTheme} rounded-3xl p-6 text-white shadow-xl`}>
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-medium opacity-90">Hoje</h2>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 bg-black/10 px-2 py-1 rounded-md">{formattedDate}</span>
        </div>
        <div className="mt-4 flex justify-between items-end">
          <div>
            <span className="text-4xl font-bold">{dailyCalories}</span>
            <span className="ml-2 text-sm opacity-80">kcal consumidas</span>
          </div>
          <div className="text-right">
             <span className="block text-2xl font-bold">{waterToday}ml</span>
             <span className="text-[10px] uppercase opacity-80 tracking-widest">Água</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center gap-3">
          <div className={`w-12 h-12 ${activeUser === 'Thiago' ? 'bg-sky-50 text-sky-500' : 'bg-rose-50 text-rose-500'} rounded-full flex items-center justify-center`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700">Hidratação</p>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-2 w-full">
              <button onClick={() => logWater(100)} className={`flex-1 py-2 ${activeUser === 'Thiago' ? 'bg-sky-500 hover:bg-sky-600' : 'bg-rose-500 hover:bg-rose-600'} text-white rounded-xl text-xs font-bold transition-colors`}>+100ml</button>
              <button onClick={() => logWater(400)} className={`flex-1 py-2 ${activeUser === 'Thiago' ? 'bg-sky-500 hover:bg-sky-600' : 'bg-rose-500 hover:bg-rose-600'} text-white rounded-xl text-xs font-bold transition-colors`}>+400ml</button>
            </div>
            <button 
              onClick={() => logWater(-100)} 
              className="w-full py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
              Remover 100ml
            </button>
          </div>
        </div>

        <button 
          onClick={() => toggleExercise(today)}
          className={`p-5 rounded-3xl shadow-sm border transition-all flex flex-col items-center justify-center gap-3 ${exerciseTheme}`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${exercisedToday ? 'bg-white/20' : (activeUser === 'Thiago' ? 'bg-sky-50 text-sky-500' : 'bg-rose-50 text-rose-500')}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className={`text-sm font-semibold ${exercisedToday ? 'text-white' : 'text-slate-700'}`}>
            {exercisedToday ? 'Exercitado!' : 'Treinar Hoje?'}
          </span>
        </button>
      </div>

      {/* Next Meals Feed */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">Refeições de Hoje</h3>
        <div className="space-y-3">
          {dailyMeals.length === 0 ? (
            <p className="text-slate-400 text-center py-8 bg-white/50 rounded-2xl border border-dashed border-slate-200">Nenhuma refeição registrada para hoje.</p>
          ) : (
            dailyMeals.sort((a,b) => a.time.localeCompare(b.time)).map(meal => (
              <div key={meal.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleMealConsumed(meal.id)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${meal.consumed ? (activeUser === 'Thiago' ? 'bg-sky-500 border-sky-500 text-white' : 'bg-rose-500 border-rose-500 text-white') : 'border-slate-200 text-transparent'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className={`w-10 h-10 ${accentBg} ${accentColor} rounded-xl flex items-center justify-center font-bold text-xs`}>
                    {meal.time}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${meal.consumed ? 'text-slate-400 line-through' : 'text-slate-700'} capitalize`}>{meal.food}</h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{meal.amount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${meal.consumed ? accentColor : 'text-slate-400'}`}>{meal.calories} kcal</span>
                  <button 
                    onClick={() => removeMeal(meal.id)}
                    className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
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

export default Dashboard;
