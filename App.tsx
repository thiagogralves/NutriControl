
import React, { useState, useEffect, useMemo } from 'react';
import { User, AppState, Meal, MealTime, WeightLog, WaterLog, ExerciseLog, ShoppingItem } from './types';
import { estimateCalories, suggestShoppingList } from './geminiService';
import Dashboard from './components/Dashboard';
import WeeklyTable from './components/WeeklyTable';
import ShoppingList from './components/ShoppingList';
import Profile from './components/Profile';
import AddMealModal from './components/AddMealModal';

const STORAGE_KEY = 'nutricontrol_v1_data';

const App: React.FC = () => {
  const [activeUser, setActiveUser] = useState<User>('Thiago');
  const [currentView, setCurrentView] = useState<'dashboard' | 'table' | 'shopping' | 'profile'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Initial State
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      meals: [],
      weightLogs: [],
      waterLogs: [],
      exerciseLogs: [],
      shoppingLists: []
    };
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const saveMeal = async (mealData: Omit<Meal, 'id' | 'consumed'>, id?: string) => {
    setLoading(true);
    
    let finalCalories = mealData.calories;
    
    // If calories are not provided (0 or undefined), ask the AI
    if (!finalCalories || finalCalories <= 0) {
      finalCalories = await estimateCalories(mealData.food, mealData.amount);
    }
    
    setState(prev => {
      if (id) {
        // Edit existing
        return {
          ...prev,
          meals: prev.meals.map(m => m.id === id ? { ...m, ...mealData, calories: finalCalories } : m)
        };
      } else {
        // Create new
        const meal: Meal = {
          ...mealData,
          id: Math.random().toString(36).substr(2, 9),
          calories: finalCalories,
          consumed: false
        };
        return {
          ...prev,
          meals: [...prev.meals, meal]
        };
      }
    });
    setLoading(false);
    setIsModalOpen(false);
    setEditingMeal(undefined);
  };

  const removeMeal = (id: string) => {
    setState(prev => ({
      ...prev,
      meals: prev.meals.filter(m => m.id !== id)
    }));
  };

  const toggleMealConsumed = (id: string) => {
    setState(prev => ({
      ...prev,
      meals: prev.meals.map(m => m.id === id ? { ...m, consumed: !m.consumed } : m)
    }));
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setIsModalOpen(true);
  };

  const toggleExercise = (date: string) => {
    setState(prev => {
      const exists = prev.exerciseLogs.find(l => l.date === date && l.userId === activeUser);
      if (exists) {
        return {
          ...prev,
          exerciseLogs: prev.exerciseLogs.filter(l => !(l.date === date && l.userId === activeUser))
        };
      }
      return {
        ...prev,
        exerciseLogs: [...prev.exerciseLogs, { userId: activeUser, date, completed: true }]
      };
    });
  };

  const removeExercise = (date: string) => {
    setState(prev => ({
      ...prev,
      exerciseLogs: prev.exerciseLogs.filter(l => !(l.date === date && l.userId === activeUser))
    }));
  };

  const logWater = (amount: number) => {
    const date = new Date().toISOString().split('T')[0];
    setState(prev => {
      const exists = prev.waterLogs.find(l => l.date === date && l.userId === activeUser);
      if (exists) {
        return {
          ...prev,
          waterLogs: prev.waterLogs.map(l => 
            l.date === date && l.userId === activeUser ? { ...l, amountMl: Math.max(0, l.amountMl + amount) } : l
          )
        };
      }
      return {
        ...prev,
        waterLogs: [...prev.waterLogs, { userId: activeUser, date, amountMl: Math.max(0, amount) }]
      };
    });
  };

  const logWeight = (weight: number) => {
    const date = new Date().toISOString().split('T')[0];
    setState(prev => ({
      ...prev,
      weightLogs: [...prev.weightLogs, { userId: activeUser, date, weight }]
    }));
  };

  const removeWeight = (date: string) => {
    setState(prev => ({
      ...prev,
      weightLogs: prev.weightLogs.filter(l => !(l.date === date && l.userId === activeUser))
    }));
  };

  const toggleShoppingItem = (id: string) => {
    setState(prev => ({
      ...prev,
      shoppingLists: prev.shoppingLists.map(item => 
        item.id === id ? { ...item, bought: !item.bought } : item
      )
    }));
  };

  const generateShoppingList = async (week: number) => {
    setLoading(true);
    const weekMeals = state.meals.filter(m => m.weekNumber === week && m.userId === activeUser);
    const items = await suggestShoppingList(weekMeals);
    
    const newItems: ShoppingItem[] = items.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      weekNumber: week,
      userId: activeUser,
      name,
      bought: false
    }));

    setState(prev => ({
      ...prev,
      shoppingLists: [...prev.shoppingLists, ...newItems]
    }));
    setLoading(false);
  };

  const bgColor = activeUser === 'Thiago' ? 'bg-sky-50' : 'bg-rose-50';

  return (
    <div className={`min-h-screen pb-24 max-w-md mx-auto relative shadow-xl overflow-hidden transition-colors duration-700 ${bgColor}`}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md px-6 pt-8 pb-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">NutriControl</h1>
          <p className="text-sm text-slate-500">Olá, <span className={`font-semibold ${activeUser === 'Thiago' ? 'text-sky-600' : 'text-rose-600'}`}>{activeUser}</span></p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveUser(activeUser === 'Thiago' ? 'Marcela' : 'Thiago')}
            className={`p-2 rounded-full transition-colors ${activeUser === 'Thiago' ? 'bg-sky-100 text-sky-600' : 'bg-rose-100 text-rose-600'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        {currentView === 'dashboard' && (
          <Dashboard 
            state={state} 
            activeUser={activeUser} 
            logWater={logWater} 
            toggleExercise={toggleExercise}
            removeMeal={removeMeal}
            toggleMealConsumed={toggleMealConsumed}
          />
        )}
        {currentView === 'table' && (
          <WeeklyTable 
            state={state} 
            activeUser={activeUser} 
            removeMeal={removeMeal} 
            toggleMealConsumed={toggleMealConsumed}
            onEditMeal={handleEditMeal}
          />
        )}
        {currentView === 'shopping' && (
          <ShoppingList 
            state={state} 
            activeUser={activeUser} 
            toggleShoppingItem={toggleShoppingItem}
            generateShoppingList={generateShoppingList}
          />
        )}
        {currentView === 'profile' && (
          <Profile 
            state={state} 
            activeUser={activeUser} 
            logWeight={logWeight}
            removeWeight={removeWeight}
            removeExercise={removeExercise}
          />
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 px-6 py-4 flex justify-between items-center max-w-md mx-auto z-20">
        <NavButton active={currentView === 'dashboard'} activeUser={activeUser} onClick={() => setCurrentView('dashboard')} icon={<DashboardIcon />} label="Home" />
        <NavButton active={currentView === 'table'} activeUser={activeUser} onClick={() => setCurrentView('table')} icon={<TableIcon />} label="Menu" />
        
        {/* Floating Add Button */}
        <button 
          onClick={() => { setEditingMeal(undefined); setIsModalOpen(true); }}
          className={`${activeUser === 'Thiago' ? 'bg-sky-500' : 'bg-rose-500'} text-white p-4 rounded-full shadow-lg -mt-12 border-4 border-slate-50 hover:opacity-90 transition-transform active:scale-95`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <NavButton active={currentView === 'shopping'} activeUser={activeUser} onClick={() => setCurrentView('shopping')} icon={<ShoppingIcon />} label="Compras" />
        <NavButton active={currentView === 'profile'} activeUser={activeUser} onClick={() => setCurrentView('profile')} icon={<ProfileIcon />} label="Perfil" />
      </nav>

      {isModalOpen && (
        <AddMealModal 
          onClose={() => { setIsModalOpen(false); setEditingMeal(undefined); }} 
          onAdd={saveMeal} 
          activeUser={activeUser}
          loading={loading}
          initialData={editingMeal}
        />
      )}
    </div>
  );
};

const NavButton = ({ active, activeUser, onClick, icon, label }: { active: boolean, activeUser: User, onClick: () => void, icon: React.ReactNode, label: string }) => {
  const activeColor = activeUser === 'Thiago' ? 'text-sky-600' : 'text-rose-600';
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? activeColor + ' font-medium' : 'text-slate-400'}`}>
      {icon}
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </button>
  );
};

const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const TableIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const ShoppingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;

export default App;
