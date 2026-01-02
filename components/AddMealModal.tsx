
import React, { useState, useEffect } from 'react';
import { User, MealTime, Meal } from '../types';

interface Props {
  onClose: () => void;
  onAdd: (meal: Omit<Meal, 'id' | 'consumed'>, id?: string) => Promise<void>;
  activeUser: User;
  loading: boolean;
  initialData?: Meal;
}

const AddMealModal: React.FC<Props> = ({ onClose, onAdd, activeUser, loading, initialData }) => {
  const [week, setWeek] = useState(1);
  const [day, setDay] = useState(0);
  const [time, setTime] = useState<MealTime>('12:00');
  const [food, setFood] = useState('');
  const [amount, setAmount] = useState('');
  const [calories, setCalories] = useState<string>('');

  const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  const TIMES: MealTime[] = ['07:00', '12:00', '16:00', '20:00', '23:00'];

  useEffect(() => {
    if (initialData) {
      setWeek(initialData.weekNumber);
      setDay(initialData.dayOfWeek);
      setTime(initialData.time);
      setFood(initialData.food);
      setAmount(initialData.amount);
      setCalories(initialData.calories.toString());
    } else {
      setWeek(1);
      setDay(new Date().getDay() - 1 === -1 ? 0 : Math.min(new Date().getDay() - 1, 4));
      setTime('12:00');
      setFood('');
      setAmount('');
      setCalories('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!food || !amount) return;
    onAdd({
      userId: activeUser,
      weekNumber: week,
      dayOfWeek: day,
      time,
      food,
      amount,
      calories: calories ? parseInt(calories, 10) : 0
    }, initialData?.id);
  };

  const accentBg = activeUser === 'Thiago' ? 'bg-sky-500' : 'bg-rose-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-slideUp">
        <div className="px-6 py-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Editar' : 'Nova'} Refeição</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Semana</label>
              <input 
                type="number" 
                min="1" 
                value={week} 
                onChange={(e) => setWeek(Number(e.target.value))}
                className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dia</label>
              <select 
                value={day} 
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium appearance-none"
              >
                {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Horário</label>
            <div className="flex flex-wrap gap-2">
              {TIMES.map(t => (
                <button 
                  key={t}
                  type="button"
                  onClick={() => setTime(t)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${time === t ? `${accentBg} text-white shadow-md` : 'bg-slate-50 text-slate-500'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">O que vai comer?</label>
            <input 
              type="text" 
              placeholder="Ex: Arroz, feijão e frango" 
              value={food}
              onChange={(e) => setFood(e.target.value)}
              className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Quantidade</label>
              <input 
                type="text" 
                placeholder="200g, 1 un" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Calorias (kcal)</label>
              <input 
                type="number" 
                placeholder="IA calcula" 
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium placeholder:italic placeholder:text-slate-300"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !food || !amount}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 mt-4 ${loading ? 'opacity-50 pointer-events-none' : `${accentBg} hover:opacity-90 active:scale-95`}`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Salvando...
              </>
            ) : (
              initialData ? 'Atualizar' : 'Salvar na Tabela'
            )}
          </button>
          
          {!initialData && (
            <p className="text-[10px] text-center text-slate-400 italic">
              Deixe as calorias em branco para cálculo automático via IA.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddMealModal;
