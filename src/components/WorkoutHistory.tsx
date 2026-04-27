import { useState, useEffect } from 'react';
import { supabase, WorkoutLogWithExercise } from '../lib/supabase';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';

type GroupedWorkouts = {
  [date: string]: {
    [exerciseName: string]: WorkoutLogWithExercise[];
  };
};

export default function WorkoutHistory() {
  const [workouts, setWorkouts] = useState<WorkoutLogWithExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMuscle, setFilterMuscle] = useState('all');

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*, exercises(*)')
      .order('workout_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading workouts:', error);
      setLoading(false);
      return;
    }

    setWorkouts(data || []);
    setLoading(false);
  };

  const deleteWorkout = async (id: string) => {
    if (!confirm('Delete this set?')) return;

    const { error } = await supabase.from('workout_logs').delete().eq('id', id);

    if (error) {
      console.error('Error deleting workout:', error);
      alert('Failed to delete workout');
      return;
    }

    loadWorkouts();
  };

  const groupWorkoutsByDate = (workouts: WorkoutLogWithExercise[]): GroupedWorkouts => {
    const filtered = filterMuscle === 'all'
      ? workouts
      : workouts.filter(w => w.exercises.muscle_group === filterMuscle);

    return filtered.reduce((groups, workout) => {
      const date = workout.workout_date;
      const exerciseName = workout.exercises.name;

      if (!groups[date]) {
        groups[date] = {};
      }
      if (!groups[date][exerciseName]) {
        groups[date][exerciseName] = [];
      }
      groups[date][exerciseName].push(workout);

      return groups;
    }, {} as GroupedWorkouts);
  };

  const getMuscleGroups = () => {
    const groups = new Set(workouts.map(w => w.exercises.muscle_group));
    return Array.from(groups).sort();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const groupedWorkouts = groupWorkoutsByDate(workouts);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center">Loading workout history...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Workout History</h2>
        </div>

        <select
          value={filterMuscle}
          onChange={(e) => setFilterMuscle(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Muscles</option>
          {getMuscleGroups().map(muscle => (
            <option key={muscle} value={muscle}>{muscle}</option>
          ))}
        </select>
      </div>

      {Object.keys(groupedWorkouts).length === 0 ? (
        <p className="text-gray-500 text-center py-8">No workouts logged yet. Start tracking!</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedWorkouts).map(([date, exercises]) => (
            <div key={date} className="border-l-4 border-blue-500 pl-3 sm:pl-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-base sm:text-lg text-gray-800">{formatDate(date)}</h3>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {Object.entries(exercises).map(([exerciseName, sets]) => {
                  const muscleGroup = sets[0].exercises.muscle_group;
                  return (
                    <div key={exerciseName} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm sm:text-base text-gray-900">{exerciseName}</h4>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full w-fit">
                          {muscleGroup}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {sets.map((set) => (
                          <div
                            key={set.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white p-3 rounded border border-gray-200"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-1">
                              <span className="font-medium text-gray-600">
                                Set {set.set_number}
                              </span>
                              <span>
                                <span className="font-semibold text-gray-900">{set.weight}</span>
                                <span className="text-gray-600"> lbs × </span>
                                <span className="font-semibold text-gray-900">{set.reps}</span>
                                <span className="text-gray-600"> reps</span>
                              </span>
                              {set.notes && (
                                <span className="text-gray-500 italic">"{set.notes}"</span>
                              )}
                            </div>
                            <button
                              onClick={() => deleteWorkout(set.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1 self-end sm:self-auto"
                              title="Delete set"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
