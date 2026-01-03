
import React, { useState } from 'react';
import { AppState, User } from '../types';

interface Props {
  state: AppState;
  activeUser: User;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  generateShoppingList: (week: number) => void;
  loading: boolean;
}

const ShoppingList: React.FC<Props> = ({ state, activeUser, toggleShoppingItem, removeShoppingItem, generateShoppingList, loading }) => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const currentList = state.shoppingLists.filter(item => item.userId === activeUser && item.weekNumber === selectedWeek);
  
  // Permite selecionar qualquer semana para gerar a lista
  const allPossibleWeeks = Array.from({ length: 52 }, (_, i) => i + 1);
  
  const weekMeals = state.meals.filter(m => m.weekNumber === selectedWeek && m.userId === activeUser);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-bold text-slate-800">Lista Semana {selectedWeek}</h2>
        <select 
          value={selectedWeek} 
          onChange={(e) => setSelectedWeek(Number(e.target.value))}
          className="bg-white border-none rounded-xl text-sm font-bold text-emerald-600 shadow-sm px-4 py-2 outline-none appearance-none"
        >
          {allPossibleWeeks.map(w => <option key={w} value={w}>Semana {w}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
          <div>
            <h3 className="text-slate-700 font-bold">Gerando sua lista...</h3>
            <p className="text-slate-400 text-sm mt-1">A IA está analisando seu cardápio para sugerir os melhores itens.</p>
          </div>
        </div>
      ) : currentList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <div>
            <h3 className="text-slate-700 font-bold">Nenhuma lista para a Semana {selectedWeek}</h3>
            {weekMeals.length > 0 ? (
              <p className="text-slate-400 text-sm mt-1">Você tem {weekMeals.length} refeições registradas. Clique abaixo para gerar a lista.</p>
            ) : (
              <p className="text-slate-400 text-sm mt-1 text-balance">Registre refeições na aba "Menu" primeiro para que a lista possa ser gerada.</p>
            )}
          </div>
          <button 
            onClick={() => generateShoppingList(selectedWeek)}
            disabled={weekMeals.length === 0}
            className={`w-full max-w-xs py-4 rounded-[2rem] font-black text-white shadow-xl transition-all ${weekMeals.length === 0 ? 'bg-slate-300 scale-95 opacity-50' : 'bg-emerald-500 hover:bg-emerald-600 active:scale-95 shadow-emerald-100'}`}
          >
            GERAR LISTA DA SEMANA
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-5">
            {currentList.map(item => (
              <div key={item.id} className="flex items-center gap-4 group">
                <button 
                  onClick={() => toggleShoppingItem(item.id)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${item.bought ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-transparent'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <span className={`text-sm font-bold flex-1 ${item.bought ? 'text-slate-300 line-through' : 'text-slate-700'}`}>
                  {item.name}
                </span>
                <button 
                  onClick={() => removeShoppingItem(item.id)}
                  className="p-2 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  title="Excluir item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            
            <div className="pt-6 border-t border-slate-50 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>{currentList.filter(i => i.bought).length} de {currentList.length} ITENS</span>
              <button 
                onClick={() => generateShoppingList(selectedWeek)} 
                className="text-emerald-500 hover:text-emerald-600 transition-colors flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                REGERAR LISTA
              </button>
            </div>
          </div>
          
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100/50">
             <p className="text-[10px] text-emerald-700/70 font-bold uppercase text-center leading-relaxed">A lista foi gerada automaticamente pela IA com base em <span className="text-emerald-800">{weekMeals.length} refeições</span> cadastradas para esta semana.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
