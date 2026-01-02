
import React, { useMemo } from 'react';
import { AppState, User } from '../types';
import { isSameDay, getMealDate } from '../utils/dateUtils';

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
  const todayStr = now.toISOString().split('T')[0];
  
  // Format current date nicely
  const formattedDate = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const dailyMeals = useMemo(() => 
    state.meals.filter(m => {
      const mealDate = getMealDate(m.weekNumber, m.dayOfWeek);
      return m.userId === activeUser && isSameDay(mealDate, now);
    }),
    [state.meals, activeUser]
  );

  const dailyCalories = dailyMeals.reduce((acc, m) => m.consumed ? acc + m.calories : acc, 0);
  const waterToday = state.waterLogs.find(l => l.date === todayStr && l.userId === activeUser)?.amountMl || 0;
  const exercisedToday = state.exerciseLogs.find(l => l.date === todayStr && l.userId === activeUser)?.completed || false;

  const userTheme = activeUser === 'Thiago' ? 'from-sky-500 to-sky-600 shadow-sky-200' : 'from-rose-500 to-rose-600 shadow-rose-200';
  const exerciseTheme = exercisedToday 
    ? (activeUser === 'Thiago' ? 'bg-sky-500 border-sky-500 text-white shadow-inner' : 'bg-rose-500 border-rose-500 text-white shadow-inner')
    : 'bg-white border-slate-100 shadow-sm';

  const accentColor = activeUser === 'Thiago' ? 'text-sky-600' : 'text-rose-600';
  const accentBg = activeUser === 'Thiago' ? 'bg-sky-50' : 'bg-rose-50';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Daily Summary Card */}
      <div className={`bg-gradient-to-br ${userTheme} rounded-3xl p-6 text-white shadow-xl transition-all duration-500`}>
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-medium opacity-90">Hoje</h2>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 bg-black/10 px-2 py-1 rounded-md">{formattedDate}</span>
        </div>
        <div className="mt-4 flex justify-between items-end">
          <div>
            <span className="text-4xl font-bold">{dailyCalories}</span>
            <span className="ml-2 text-sm opacity-80">kcal hoje</span>
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
          <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Hidratação</p>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-2 w-full">
              <button onClick={() => logWater(100)} className={`flex-1 py-2 ${activeUser === 'Thiago' ? 'bg-sky-500' : 'bg-rose-500'} text-white rounded-xl text-[10px] font-black shadow-sm`}>100ml</button>
              <button onClick={() => logWater(400)} className={`flex-1 py-2 ${activeUser === 'Thiago' ? 'bg-sky-500' : 'bg-rose-500'} text-white rounded-xl text-[10px] font-black shadow-sm`}>400ml</button>
            </div>
          </div>
        </div>

        <button 
          onClick={() => toggleExercise(todayStr)}
          className={`p-5 rounded-3xl border transition-all flex flex-col items-center justify-center gap-3 ${exerciseTheme}`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${exercisedToday ? 'bg-white/20 text-white' : (activeUser === 'Thiago' ? 'bg-sky-50 text-sky-500' : 'bg-rose-50 text-rose-500')}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className={`text-xs font-bold uppercase tracking-tighter ${exercisedToday ? 'text-white' : 'text-slate-500'}`}>
            {exercisedToday ? 'Concluído!' : 'Exercício'}
          </span>
        </button>
      </div>

      {/* Today's Meals */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">Refeições para hoje</h3>
        <div className="space-y-3">
          {dailyMeals.length === 0 ? (
            <div className="text-center py-10 bg-white/40 rounded-[2rem] border border-dashed border-slate-200">
               <p className="text-slate-400 text-sm italic">Nenhuma refeição para hoje.</p>
               <p className="text-[10px] text-slate-300 mt-1 uppercase font-bold">Verifique o cardápio semanal</p>
            </div>
          ) : (
            dailyMeals.sort((a,b) => a.time.localeCompare(b.time)).map(meal => (
              <div key={meal.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group transition-all">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleMealConsumed(meal.id)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${meal.consumed ? (activeUser === 'Thiago' ? 'bg-sky-500 border-sky-500 text-white' : 'bg-rose-500 border-rose-500 text-white') : 'border-slate-200 text-transparent'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div>
                    <h4 className={`text-sm font-bold ${meal.consumed ? 'text-slate-400 line-through' : 'text-slate-700'} capitalize`}>{meal.food}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${accentBg} ${accentColor}`}>{meal.time}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{meal.amount}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-black ${meal.consumed ? accentColor : 'text-slate-400'}`}>{meal.calories} <span className="text-[10px]">kcal</span></span>
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
