
import React, { useState } from 'react';
import { AppState, User, MealTime, Meal } from '../types';
import { getMealDateString, mapTimeToCategory } from '../utils/dateUtils';

interface Props {
  state: AppState;
  activeUser: User;
  removeMeal: (id: string) => void;
  toggleMealConsumed: (id: string) => void;
  onEditMeal: (meal: Meal) => void;
  copyDayMenu: (toDay: number, week: number) => Promise<void>;
}

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
const MEAL_CATEGORIES: MealTime[] = ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar', 'Ceia'];

const WeeklyTable: React.FC<Props> = ({ state, activeUser, removeMeal, toggleMealConsumed, onEditMeal, copyDayMenu }) => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const allPossibleWeeks = Array.from({ length: 52 }, (_, i) => i + 1);

  const getMealsForSlot = (day: number, category: MealTime): Meal[] => 
    state.meals.filter(m => 
      m.userId === activeUser && 
      m.weekNumber === selectedWeek && 
      m.dayOfWeek === day && 
      mapTimeToCategory(m.time) === category
    );

  const accentColor = activeUser === 'Thiago' ? 'text-sky-600' : 'text-rose-600';
  const accentBg = activeUser === 'Thiago' ? 'bg-sky-500' : 'bg-rose-500';
  const accentLight = activeUser === 'Thiago' ? 'bg-sky-100' : 'bg-rose-100';

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-bold text-slate-800">Tabela Semana {selectedWeek}</h2>
        <select 
          value={selectedWeek} 
          onChange={(e) => setSelectedWeek(Number(e.target.value))}
          className={`bg-white border-none rounded-xl text-sm font-bold ${accentColor} shadow-sm px-4 py-2 outline-none appearance-none`}
        >
          {allPossibleWeeks.map(w => <option key={w} value={w}>Semana {w}</option>)}
        </select>
      </div>

      <div className="space-y-8 overflow-x-hidden pb-10">
        {DAYS.map((dayName, dayIdx) => {
          const dateStr = getMealDateString(selectedWeek, dayIdx);
          
          return (
            <div key={dayName} className="relative">
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-8 h-8 rounded-full ${accentBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md`}>{dayIdx + 1}</span>
                <div className="flex flex-col shrink-0">
                  <h3 className="text-base font-bold text-slate-700 leading-tight">{dayName}</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{dateStr}</span>
                </div>
                
                <button 
                  onClick={async () => {
                    if (confirm(`Copiar cardápio do dia anterior para ${dayName}?`)) {
                      await copyDayMenu(dayIdx, selectedWeek);
                    }
                  }}
                  className={`p-2 rounded-xl ${accentLight} ${accentColor} hover:opacity-80 transition-all flex items-center justify-center shrink-0 border border-current/10 shadow-sm active:scale-90`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </button>

                <div className="h-px flex-1 bg-slate-100"></div>
              </div>
              
              <div className="grid gap-3">
                {MEAL_CATEGORIES.map(category => {
                  const meals = getMealsForSlot(dayIdx, category);
                  return (
                    <div key={category} className={`flex items-start gap-4 p-4 rounded-[2rem] border transition-all ${meals.length > 0 ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50/50 border-dashed border-slate-200 opacity-60'}`}>
                      <div className="w-16 text-center pt-1 shrink-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase leading-tight">{category}</p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {meals.length > 0 ? (
                          meals.map(meal => (
                            <div key={meal.id} className="flex justify-between items-center group">
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => toggleMealConsumed(meal.id)}
                                  className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${meal.consumed ? (activeUser === 'Thiago' ? 'bg-sky-500 border-sky-500 text-white' : 'bg-rose-500 border-rose-500 text-white') : 'border-slate-200 text-transparent'}`}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                <div>
                                  <p className={`text-sm font-bold ${meal.consumed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{meal.food}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">{meal.amount}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black ${meal.consumed ? accentColor : 'text-slate-400'}`}>{meal.calories} kcal</span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => onEditMeal(meal)} className="p-1 text-slate-300 hover:text-emerald-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                  </button>
                                  <button onClick={() => removeMeal(meal.id)} className="p-1 text-slate-300 hover:text-red-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-slate-300 italic pt-1 uppercase tracking-tighter font-bold">Vazio</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyTable;
