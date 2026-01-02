
import React, { useState } from 'react';
import { AppState, User, MealTime, Meal } from '../types';

interface Props {
  state: AppState;
  activeUser: User;
  removeMeal: (id: string) => void;
  toggleMealConsumed: (id: string) => void;
  onEditMeal: (meal: Meal) => void;
}

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
const TIMES: MealTime[] = ['07:00', '12:00', '16:00', '20:00', '23:00'];

const WeeklyTable: React.FC<Props> = ({ state, activeUser, removeMeal, toggleMealConsumed, onEditMeal }) => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const weeks = Array.from(new Set(state.meals.map(m => m.weekNumber))).sort((a, b) => b - a);
  const displayWeeks = weeks.length > 0 ? weeks : [1];

  const getMealsForSlot = (day: number, time: MealTime): Meal[] => 
    state.meals.filter(m => m.userId === activeUser && m.weekNumber === selectedWeek && m.dayOfWeek === day && m.time === time);

  const accentColor = activeUser === 'Thiago' ? 'text-sky-600' : 'text-rose-600';
  const accentBg = activeUser === 'Thiago' ? 'bg-sky-500' : 'bg-rose-500';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-bold text-slate-800">Tabela Semana {selectedWeek}</h2>
        <select 
          value={selectedWeek} 
          onChange={(e) => setSelectedWeek(Number(e.target.value))}
          className={`bg-white border-none rounded-lg text-sm font-medium ${accentColor} shadow-sm px-3 py-1 outline-none`}
        >
          {displayWeeks.map(w => <option key={w} value={w}>Semana {w}</option>)}
        </select>
      </div>

      <div className="space-y-8 overflow-x-hidden">
        {DAYS.map((dayName, dayIdx) => (
          <div key={dayName} className="relative">
            <div className="flex items-center gap-3 mb-4">
               <span className={`w-8 h-8 rounded-full ${accentBg} text-white flex items-center justify-center font-bold text-xs`}>{dayIdx + 1}</span>
               <h3 className="text-base font-bold text-slate-700">{dayName}</h3>
               <div className="h-px flex-1 bg-slate-100"></div>
               <span className={`text-xs font-bold ${accentColor}`}>
                {state.meals.filter(m => m.userId === activeUser && m.weekNumber === selectedWeek && m.dayOfWeek === dayIdx && m.consumed).reduce((acc, m) => acc + m.calories, 0)} kcal
               </span>
            </div>
            
            <div className="grid gap-3">
              {TIMES.map(time => {
                const meals = getMealsForSlot(dayIdx, time);
                return (
                  <div key={time} className={`flex items-start gap-4 p-3 rounded-2xl border transition-all ${meals.length > 0 ? 'bg-white border-slate-100' : 'bg-slate-50/50 border-dashed border-slate-200 opacity-60'}`}>
                    <div className="w-12 text-center pt-1">
                      <p className="text-[10px] font-bold text-slate-400">{time}</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {meals.length > 0 ? (
                        meals.map(meal => (
                          <div key={meal.id} className="flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => toggleMealConsumed(meal.id)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${meal.consumed ? (activeUser === 'Thiago' ? 'bg-sky-500 border-sky-500 text-white' : 'bg-rose-500 border-rose-500 text-white') : 'border-slate-200 text-transparent'}`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <div>
                                <p className={`text-sm font-semibold ${meal.consumed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{meal.food}</p>
                                <p className="text-[10px] text-slate-400">{meal.amount}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold ${meal.consumed ? accentColor : 'text-slate-400'}`}>{meal.calories} kcal</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => onEditMeal(meal)}
                                  className="p-1 text-slate-300 hover:text-emerald-500 transition-colors"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button 
                                  onClick={() => removeMeal(meal.id)}
                                  className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-300 italic pt-1">Sem registro</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyTable;
