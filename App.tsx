
import React, { useState, useEffect, useMemo } from 'react';
import { User, AppState, Meal, MealTime, WeightLog, WaterLog, ExerciseLog, ShoppingItem } from './types';
import { estimateCalories, suggestShoppingList } from './geminiService';
import { syncState, saveFullState } from './firebaseService';
import Dashboard from './components/Dashboard';
import WeeklyTable from './components/WeeklyTable';
import ShoppingList from './components/ShoppingList';
import Profile from './components/Profile';
import AddMealModal from './components/AddMealModal';

const App: React.FC = () => {
  const [activeUser, setActiveUser] = useState<User>('Thiago');
  const [currentView, setCurrentView] = useState<'dashboard' | 'table' | 'shopping' | 'profile'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSynced, setIsSynced] = useState(false);

  const [state, setState] = useState<AppState>({
    meals: [],
    weightLogs: [],
    waterLogs: [],
    exerciseLogs: [],
    shoppingLists: []
  });

  // Sincronização em tempo real com Firebase
  useEffect(() => {
    const unsubscribe = syncState((newState) => {
      setState(newState);
      setIsInitialLoad(false);
      setIsSynced(true);
      // Feedback visual de sincronização
      setTimeout(() => setIsSynced(false), 2000);
    });
    return () => unsubscribe();
  }, []);

  // Função auxiliar para atualizar o Firebase sempre que o estado mudar localmente
  const updateRemoteState = async (newState: AppState) => {
    setState(newState);
    await saveFullState(newState);
  };

  const saveMeal = async (mealData: Omit<Meal, 'id' | 'consumed'>, id?: string) => {
    setLoading(true);
    let finalCalories = mealData.calories;
    if (!finalCalories || finalCalories <= 0) {
      finalCalories = await estimateCalories(mealData.food, mealData.amount);
    }
    
    const newState = { ...state };
    if (id) {
      newState.meals = state.meals.map(m => m.id === id ? { ...m, ...mealData, calories: finalCalories } : m);
    } else {
      const meal: Meal = {
        ...mealData,
        id: Math.random().toString(36).substr(2, 9),
        calories: finalCalories,
        consumed: false
      };
      newState.meals = [...state.meals, meal];
    }

    await updateRemoteState(newState);
    setLoading(false);
    setIsModalOpen(false);
    setEditingMeal(undefined);
  };

  const removeMeal = async (id: string) => {
    const newState = {
      ...state,
      meals: state.meals.filter(m => m.id !== id)
    };
    await updateRemoteState(newState);
  };

  const toggleMealConsumed = async (id: string) => {
    const newState = {
      ...state,
      meals: state.meals.map(m => m.id === id ? { ...m, consumed: !m.consumed } : m)
    };
    await updateRemoteState(newState);
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setIsModalOpen(true);
  };

  const toggleExercise = async (date: string) => {
    const exists = state.exerciseLogs.find(l => l.date === date && l.userId === activeUser);
    let newLogs;
    if (exists) {
      newLogs = state.exerciseLogs.filter(l => !(l.date === date && l.userId === activeUser));
    } else {
      newLogs = [...state.exerciseLogs, { userId: activeUser, date, completed: true }];
    }
    await updateRemoteState({ ...state, exerciseLogs: newLogs });
  };

  const removeExercise = async (date: string) => {
    const newLogs = state.exerciseLogs.filter(l => !(l.date === date && l.userId === activeUser));
    await updateRemoteState({ ...state, exerciseLogs: newLogs });
  };

  const logWater = async (amount: number) => {
    const date = new Date().toISOString().split('T')[0];
    const exists = state.waterLogs.find(l => l.date === date && l.userId === activeUser);
    let newWaterLogs;
    if (exists) {
      newWaterLogs = state.waterLogs.map(l => 
        l.date === date && l.userId === activeUser ? { ...l, amountMl: Math.max(0, l.amountMl + amount) } : l
      );
    } else {
      newWaterLogs = [...state.waterLogs, { userId: activeUser, date, amountMl: Math.max(0, amount) }];
    }
    await updateRemoteState({ ...state, waterLogs: newWaterLogs });
  };

  const logWeight = async (weight: number) => {
    const date = new Date().toISOString().split('T')[0];
    const newWeights = [...state.weightLogs, { userId: activeUser, date, weight }];
    await updateRemoteState({ ...state, weightLogs: newWeights });
  };

  const removeWeight = async (date: string) => {
    const newWeights = state.weightLogs.filter(l => !(l.date === date && l.userId === activeUser));
    await updateRemoteState({ ...state, weightLogs: newWeights });
  };

  const toggleShoppingItem = async (id: string) => {
    const newShopping = state.shoppingLists.map(item => 
      item.id === id ? { ...item, bought: !item.bought } : item
    );
    await updateRemoteState({ ...state, shoppingLists: newShopping });
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

    await updateRemoteState({
      ...state,
      shoppingLists: [...state.shoppingLists, ...newItems]
    });
    setLoading(false);
  };

  const bgColor = activeUser === 'Thiago' ? 'bg-sky-50' : 'bg-rose-50';

  if (isInitialLoad) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgColor}`}>
        <div className="text-center space-y-4">
          <div className={`w-12 h-12 border-4 ${activeUser === 'Thiago' ? 'border-sky-500' : 'border-rose-500'} border-t-transparent rounded-full animate-spin mx-auto`}></div>
          <p className="text-slate-500 font-medium animate-pulse">Conectando ao banco de dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 max-w-md mx-auto relative shadow-xl overflow-hidden transition-colors duration-700 ${bgColor}`}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md px-6 pt-8 pb-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">NutriControl</h1>
            {isSynced && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-[8px] font-bold uppercase animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Sincronizado
              </div>
            )}
          </div>
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
