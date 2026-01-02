
import React, { useState } from 'react';
import { AppState, User } from '../types';

interface Props {
  state: AppState;
  activeUser: User;
  toggleShoppingItem: (id: string) => void;
  generateShoppingList: (week: number) => void;
}

const ShoppingList: React.FC<Props> = ({ state, activeUser, toggleShoppingItem, generateShoppingList }) => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const currentList = state.shoppingLists.filter(item => item.userId === activeUser && item.weekNumber === selectedWeek);
  
  const weeks = Array.from(new Set(state.shoppingLists.map(m => m.weekNumber))).sort((a, b) => b - a);
  const displayWeeks = weeks.length > 0 ? weeks : [1];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-bold text-slate-800">Lista Semana {selectedWeek}</h2>
        <select 
          value={selectedWeek} 
          onChange={(e) => setSelectedWeek(Number(e.target.value))}
          className="bg-white border-none rounded-lg text-sm font-medium text-emerald-600 shadow-sm px-3 py-1 outline-none"
        >
          {displayWeeks.map(w => <option key={w} value={w}>Semana {w}</option>)}
        </select>
      </div>

      {currentList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <div>
            <h3 className="text-slate-700 font-bold">Nenhuma lista gerada</h3>
            <p className="text-slate-400 text-sm mt-1">Gere uma lista baseada no seu cardápio da semana.</p>
          </div>
          <button 
            onClick={() => generateShoppingList(selectedWeek)}
            className="w-full max-w-xs bg-emerald-500 text-white font-bold py-3 rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-colors"
          >
            Gerar Lista Automática
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          {currentList.map(item => (
            <div key={item.id} className="flex items-center gap-4 group">
              <button 
                onClick={() => toggleShoppingItem(item.id)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.bought ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-transparent'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <span className={`text-sm font-medium flex-1 ${item.bought ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {item.name}
              </span>
            </div>
          ))}
          
          <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>{currentList.filter(i => i.bought).length} de {currentList.length} itens</span>
            <button onClick={() => generateShoppingList(selectedWeek)} className="text-emerald-500 hover:text-emerald-600 transition-colors">Atualizar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
