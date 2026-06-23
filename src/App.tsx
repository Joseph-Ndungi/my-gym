import { useState } from 'react';
import AddWorkoutForm from './components/AddWorkoutForm';
import WorkoutHistory from './components/WorkoutHistory';
import ExerciseManager from './components/ExerciseManager';
import CalorieTracker from './components/CalorieTracker';
import { Activity, History, Library, Apple } from 'lucide-react';

type Tab = 'log' | 'history' | 'exercises' | 'nutrition';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('log');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleWorkoutAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col">
      <div className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-4 py-4 sm:py-8">
        <header className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2 sm:gap-3">
            <Activity className="w-7 h-7 sm:w-10 sm:h-10 text-blue-600" />
            <span className="hidden sm:inline">Josee Gym Tracker</span>
            <span className="sm:hidden">Josee Gym</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Track your sets, nutrition, and progress</p>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-1.5 sm:p-2 mb-6">
          <div className="grid grid-cols-4 gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('log')}
              className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                activeTab === 'log'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Log</span>
            </button>
            <button
              onClick={() => setActiveTab('nutrition')}
              className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                activeTab === 'nutrition'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Apple className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Nutrition</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <History className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>History</span>
            </button>
            <button
              onClick={() => setActiveTab('exercises')}
              className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                activeTab === 'exercises'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Library className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Exercises</span>
            </button>
          </div>
        </div>

        <div className="animate-fadeIn">
          {activeTab === 'log' && <AddWorkoutForm onWorkoutAdded={handleWorkoutAdded} />}
          {activeTab === 'nutrition' && <CalorieTracker />}
          {activeTab === 'history' && <WorkoutHistory key={refreshKey} />}
          {activeTab === 'exercises' && <ExerciseManager />}
        </div>
      </div>
    </div>
  );
}

export default App;
