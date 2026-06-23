import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Apple, Plus, Flame, Trash2, X, Utensils, Coffee, Sun, Moon, Cookie, Zap, Dumbbell } from 'lucide-react';

type CalorieLog = {
  id: string;
  meal_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: string;
  log_date: string;
  notes: string | null;
  created_at: string;
};

type MealType = 'pre_workout' | 'post_workout' | 'breakfast' | 'lunch' | 'dinner' | 'snack';

const mealTypeConfig: Record<MealType, { label: string; icon: React.ReactNode; color: string }> = {
  pre_workout: { label: 'Pre-Workout', icon: <Zap className="w-4 h-4" />, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  post_workout: { label: 'Post-Workout', icon: <Dumbbell className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  breakfast: { label: 'Breakfast', icon: <Coffee className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  lunch: { label: 'Lunch', icon: <Sun className="w-4 h-4" />, color: 'bg-green-100 text-green-700 border-green-200' },
  dinner: { label: 'Dinner', icon: <Moon className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  snack: { label: 'Snack', icon: <Cookie className="w-4 h-4" />, color: 'bg-pink-100 text-pink-700 border-pink-200' },
};

const preWorkoutRecommendations = [
  { name: 'Banana with peanut butter', calories: 290, protein: 8, carbs: 42, fat: 10, note: 'Fast energy + sustained fuel' },
  { name: 'Oatmeal with berries', calories: 300, protein: 10, carbs: 55, fat: 6, note: 'Complex carbs for lasting energy' },
  { name: 'Greek yogurt + granola', calories: 280, protein: 18, carbs: 32, fat: 8, note: 'Protein + carbs combo' },
  { name: 'Whole wheat toast + honey', calories: 200, protein: 6, carbs: 38, fat: 3, note: 'Quick digesting energy' },
  { name: 'Caffeine (pre-workout)', calories: 5, protein: 0, carbs: 1, fat: 0, note: 'Boost focus and performance' },
  { name: 'BCAAs', calories: 30, protein: 6, carbs: 0, fat: 0, note: 'Reduce muscle breakdown' },
];

const postWorkoutRecommendations = [
  { name: 'Protein shake (whey)', calories: 150, protein: 25, carbs: 5, fat: 2, note: 'Fast-absorbing protein for recovery' },
  { name: 'Chicken + rice', calories: 450, protein: 40, carbs: 50, fat: 8, note: 'Complete post-workout meal' },
  { name: 'Chocolate milk', calories: 210, protein: 8, carbs: 30, fat: 7, note: 'Ideal carb:protein ratio' },
  { name: 'Eggs + avocado toast', calories: 420, protein: 22, carbs: 35, fat: 22, note: 'Healthy fats + protein' },
  { name: 'Creatine (5g)', calories: 0, protein: 0, carbs: 0, fat: 0, note: 'Enhances strength & recovery' },
  { name: 'Glutamine', calories: 20, protein: 5, carbs: 0, fat: 0, note: 'Supports muscle recovery' },
];

export default function CalorieTracker() {
  const [logs, setLogs] = useState<CalorieLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'log' | 'recommendations'>('log');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const { data, error } = await supabase
      .from('calorie_logs')
      .select('*')
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading calorie logs:', error);
      return;
    }

    setLogs(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mealName || !calories) {
      alert('Please enter meal name and calories');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('calorie_logs').insert({
      meal_name: mealName,
      calories: parseInt(calories),
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fat: parseInt(fat) || 0,
      meal_type: mealType,
      log_date: logDate,
      notes: notes,
    });

    setLoading(false);

    if (error) {
      console.error('Error adding meal:', error);
      alert('Failed to add meal');
      return;
    }

    setMealName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setNotes('');
    setShowForm(false);
    loadLogs();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('calorie_logs').delete().eq('id', id);

    if (error) {
      console.error('Error deleting meal:', error);
      return;
    }

    loadLogs();
  };

  const addRecommendation = async (rec: typeof preWorkoutRecommendations[0], type: MealType) => {
    setLoading(true);

    const { error } = await supabase.from('calorie_logs').insert({
      meal_name: rec.name,
      calories: rec.calories,
      protein: rec.protein,
      carbs: rec.carbs,
      fat: rec.fat,
      meal_type: type,
      log_date: new Date().toISOString().split('T')[0],
      notes: rec.note,
    });

    setLoading(false);

    if (error) {
      console.error('Error adding recommendation:', error);
      alert('Failed to add meal');
      return;
    }

    loadLogs();
  };

  const todayLogs = logs.filter((log) => log.log_date === new Date().toISOString().split('T')[0]);
  const todayCalories = todayLogs.reduce((sum, log) => sum + log.calories, 0);
  const todayProtein = todayLogs.reduce((sum, log) => sum + log.protein, 0);
  const todayCarbs = todayLogs.reduce((sum, log) => sum + log.carbs, 0);
  const todayFat = todayLogs.reduce((sum, log) => sum + log.fat, 0);

  const groupedLogs = logs.reduce((groups, log) => {
    const date = log.log_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, CalorieLog[]>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';

    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Daily Summary Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-6 h-6" />
          <h2 className="text-lg sm:text-xl font-bold">Today's Nutrition</h2>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
          <div className="bg-white/20 rounded-lg p-2 sm:p-3">
            <p className="text-2xl sm:text-3xl font-bold">{todayCalories}</p>
            <p className="text-xs sm:text-sm text-white/80">Calories</p>
          </div>
          <div className="bg-white/20 rounded-lg p-2 sm:p-3">
            <p className="text-2xl sm:text-3xl font-bold">{todayProtein}g</p>
            <p className="text-xs sm:text-sm text-white/80">Protein</p>
          </div>
          <div className="bg-white/20 rounded-lg p-2 sm:p-3">
            <p className="text-2xl sm:text-3xl font-bold">{todayCarbs}g</p>
            <p className="text-xs sm:text-sm text-white/80">Carbs</p>
          </div>
          <div className="bg-white/20 rounded-lg p-2 sm:p-3">
            <p className="text-2xl sm:text-3xl font-bold">{todayFat}g</p>
            <p className="text-xs sm:text-sm text-white/80">Fat</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('log')}
            className={`flex-1 py-3 px-4 text-sm sm:text-base font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'log'
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Apple className="w-4 h-4" />
            Log Meal
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex-1 py-3 px-4 text-sm sm:text-base font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'recommendations'
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Recommendations
          </button>
        </div>

        {/* Log Meal Tab */}
        {activeTab === 'log' && (
          <div className="p-4 sm:p-6">
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Meal
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">Add Meal</h3>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Meal Name
                  </label>
                  <input
                    type="text"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    placeholder="e.g., Grilled chicken salad"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Meal Type
                  </label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as MealType)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                  >
                    {Object.entries(mealTypeConfig).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Calories
                    </label>
                    <input
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      placeholder="kcal"
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Protein
                    </label>
                    <input
                      type="number"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      placeholder="g"
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Carbs
                    </label>
                    <input
                      type="number"
                      value={carbs}
                      onChange={(e) => setCarbs(e.target.value)}
                      placeholder="g"
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Fat
                    </label>
                    <input
                      type="number"
                      value={fat}
                      onChange={(e) => setFat(e.target.value)}
                      placeholder="g"
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any notes..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-2.5 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Meal'}
                </button>
              </form>
            )}

            {/* Meal History */}
            {!showForm && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-800 mb-3">Recent Meals</h3>
                <div className="space-y-4">
                  {Object.entries(groupedLogs).map(([date, dateLogs]) => (
                    <div key={date}>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        {formatDate(date)}
                      </h4>
                      <div className="space-y-2">
                        {dateLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${mealTypeConfig[log.meal_type as MealType]?.color}`}>
                                {mealTypeConfig[log.meal_type as MealType]?.icon}
                                {mealTypeConfig[log.meal_type as MealType]?.label}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{log.meal_name}</p>
                                <p className="text-xs text-gray-500">
                                  {log.calories} kcal | P: {log.protein}g | C: {log.carbs}g | F: {log.fat}g
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDelete(log.id)}
                              className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No meals logged yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="p-4 sm:p-6">
            <div className="space-y-6">
              {/* Pre-Workout */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Pre-Workout</h3>
                </div>
                <div className="grid gap-2">
                  {preWorkoutRecommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">{rec.name}</p>
                        <p className="text-xs text-gray-600">
                          {rec.calories} kcal | P: {rec.protein}g | C: {rec.carbs}g | F: {rec.fat}g
                        </p>
                        <p className="text-xs text-orange-600 mt-0.5">{rec.note}</p>
                      </div>
                      <button
                        onClick={() => addRecommendation(rec, 'pre_workout')}
                        disabled={loading}
                        className="text-orange-600 hover:text-orange-700 p-2 hover:bg-orange-100 rounded-lg transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Post-Workout */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Post-Workout</h3>
                </div>
                <div className="grid gap-2">
                  {postWorkoutRecommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">{rec.name}</p>
                        <p className="text-xs text-gray-600">
                          {rec.calories} kcal | P: {rec.protein}g | C: {rec.carbs}g | F: {rec.fat}g
                        </p>
                        <p className="text-xs text-blue-600 mt-0.5">{rec.note}</p>
                      </div>
                      <button
                        onClick={() => addRecommendation(rec, 'post_workout')}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
