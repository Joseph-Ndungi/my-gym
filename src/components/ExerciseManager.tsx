import { useState, useEffect } from 'react';
import { supabase, Exercise } from '../lib/supabase';
import { Plus, X, Dumbbell } from 'lucide-react';

export default function ExerciseManager() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newMuscleGroup, setNewMuscleGroup] = useState('Chest');
  const [loading, setLoading] = useState(false);

  const muscleGroups = [
    'Chest',
    'Back',
    'Shoulders',
    'Arms',
    'Legs',
    'Core',
    'Cardio',
  ];

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('muscle_group')
      .order('name');

    if (error) {
      console.error('Error loading exercises:', error);
      return;
    }

    setExercises(data || []);
  };

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newExerciseName.trim()) {
      alert('Please enter an exercise name');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('exercises').insert({
      name: newExerciseName.trim(),
      muscle_group: newMuscleGroup,
    });

    setLoading(false);

    if (error) {
      if (error.code === '23505') {
        alert('This exercise already exists');
      } else {
        console.error('Error adding exercise:', error);
        alert('Failed to add exercise');
      }
      return;
    }

    setNewExerciseName('');
    setNewMuscleGroup('Chest');
    setShowAddForm(false);
    loadExercises();
  };

  const deleteExercise = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will also delete all workout logs for this exercise.`)) {
      return;
    }

    const { error } = await supabase.from('exercises').delete().eq('id', id);

    if (error) {
      console.error('Error deleting exercise:', error);
      alert('Failed to delete exercise');
      return;
    }

    loadExercises();
  };

  const groupedExercises = exercises.reduce((groups, exercise) => {
    const group = exercise.muscle_group;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(exercise);
    return groups;
  }, {} as Record<string, Exercise[]>);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-green-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Exercise Library</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 text-white px-4 py-2 text-sm sm:text-base rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Add Exercise'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddExercise} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Exercise Name
              </label>
              <input
                type="text"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="e.g., Incline Bench Press"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Muscle Group
              </label>
              <select
                value={newMuscleGroup}
                onChange={(e) => setNewMuscleGroup(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {muscleGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 text-sm sm:text-base rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Exercise'}
          </button>
        </form>
      )}

      <div className="space-y-3 sm:space-y-4">
        {Object.entries(groupedExercises).map(([muscleGroup, exerciseList]) => (
          <div key={muscleGroup} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-3 sm:px-4 py-2">
              <h3 className="font-semibold text-sm sm:text-base text-gray-800">{muscleGroup}</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {exerciseList.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between px-3 sm:px-4 py-3 hover:bg-gray-50"
                >
                  <span className="text-sm sm:text-base text-gray-700">{exercise.name}</span>
                  <button
                    onClick={() => deleteExercise(exercise.id, exercise.name)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                    title="Delete exercise"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {exercises.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No exercises yet. Add your first exercise above!
          </p>
        )}
      </div>
    </div>
  );
}
