
import React, { useState, useEffect } from 'react';
import { User, MealTime, Meal } from '../types';
import { getMealDateString } from '../utils/dateUtils';

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
      const d = new Date().getDay() - 1;
      setDay(d < 0 || d > 4 ? 0 : d);
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
  const selectedDateStr = getMealDateString(week, day);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-slideUp border border-white/20">
        <div className="px-8 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tighter">{initialData ? 'Editar' : 'Nova'} Refeição</h2>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-0.5">{selectedDateStr}</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-600 transition-colors p-2 bg-white rounded-2xl shadow-sm border border-slate-100">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Semana</label>
              <input 
                type="number" 
                min="1" 
                max="52"
                value={week} 
                onChange={(e) => setWeek(Number(e.target.value))}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:border-emerald-500/30 focus:bg-white text-sm font-black transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Dia</label>
              <select 
                value={day} 
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:border-emerald-500/30 focus:bg-white text-sm font-black transition-all appearance-none"
              >
                {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Horário</label>
            <div className="flex flex-wrap gap-2">
              {TIMES.map(t => (
                <button 
                  key={t}
                  type="button"
                  onClick={() => setTime(t)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all ${time === t ? `${accentBg} text-white shadow-lg shadow-${activeUser === 'Thiago' ? 'sky' : 'rose'}-200` : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Alimento</label>
            <input 
              type="text" 
              placeholder="Ex: 1 Pão com ovo" 
              value={food}
              onChange={(e) => setFood(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:border-emerald-500/30 focus:bg-white text-sm font-black transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Peso/Qtde</label>
              <input 
                type="text" 
                placeholder="200g, 1 un" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:border-emerald-500/30 focus:bg-white text-sm font-black transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Kcal</label>
              <input 
                type="number" 
                placeholder="Auto IA" 
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:border-emerald-500/30 focus:bg-white text-sm font-black transition-all placeholder:italic placeholder:text-slate-200"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !food || !amount}
            className={`w-full py-5 rounded-[2rem] font-black text-white shadow-xl transition-all flex items-center justify-center gap-2 mt-4 ${loading ? 'opacity-50 pointer-events-none' : `${accentBg} hover:opacity-90 active:scale-95`}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              initialData ? 'ATUALIZAR' : 'SALVAR REFEIÇÃO'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMealModal;
