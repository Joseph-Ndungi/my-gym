import { useState, useEffect } from 'react';
import { supabase, Exercise } from '../lib/supabase';
import { Plus, Dumbbell, ChevronRight } from 'lucide-react';

type AddWorkoutFormProps = {
  onWorkoutAdded: () => void;
};

export default function AddWorkoutForm({ onWorkoutAdded }: AddWorkoutFormProps) {
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [setNumber, setSetNumber] = useState('1');
  const [notes, setNotes] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'muscle' | 'exercise' | 'details'>('muscle');

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    if (selectedMuscleGroup) {
      const filtered = allExercises.filter(ex => ex.muscle_group === selectedMuscleGroup).sort((a, b) => a.name.localeCompare(b.name));
      setFilteredExercises(filtered);
      setSelectedExerciseId(filtered.length > 0 ? filtered[0].id : '');
    }
  }, [selectedMuscleGroup, allExercises]);

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

    setAllExercises(data || []);
  };

  const getMuscleGroups = (): string[] => {
    const groups = new Set(allExercises.map(ex => ex.muscle_group));
    return Array.from(groups).sort();
  };

  const handleMuscleGroupSelect = (group: string) => {
    setSelectedMuscleGroup(group);
    setStep('exercise');
  };

  const handleExerciseSelect = () => {
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedExerciseId || !weight || !reps) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('workout_logs').insert({
      exercise_id: selectedExerciseId,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      set_number: parseInt(setNumber),
      workout_date: workoutDate,
      notes: notes,
    });

    setLoading(false);

    if (error) {
      console.error('Error adding workout:', error);
      alert('Failed to add workout');
      return;
    }

    setWeight('');
    setReps('');
    setNotes('');
    setSetNumber((prev) => (parseInt(prev) + 1).toString());
    setStep('muscle');
    setSelectedMuscleGroup('');
    setSelectedExerciseId('');
    onWorkoutAdded();
  };

  const getSelectedExerciseName = () => {
    return allExercises.find(ex => ex.id === selectedExerciseId)?.name || '';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-6">
        <Dumbbell className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Log Workout Set</h2>
      </div>

      {step === 'muscle' && (
        <div className="space-y-3">
          <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-4">Select Muscle Group</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {getMuscleGroups().map((group) => (
              <button
                key={group}
                onClick={() => handleMuscleGroupSelect(group)}
                className="p-3 sm:p-4 text-sm sm:text-base font-medium rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left text-gray-700 hover:text-blue-600"
              >
                {group}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'exercise' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setStep('muscle')}
              className="text-gray-600 hover:text-gray-900 font-medium text-sm"
            >
              ← Back
            </button>
            <span className="text-sm text-gray-600">
              {selectedMuscleGroup}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-3">Select Exercise</h3>
          <div className="space-y-2">
            {filteredExercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => {
                  setSelectedExerciseId(exercise.id);
                  handleExerciseSelect();
                }}
                className="w-full p-3 sm:p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-between group"
              >
                <span className="text-sm sm:text-base font-medium text-gray-700 group-hover:text-blue-600">
                  {exercise.name}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'details' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => setStep('exercise')}
              className="text-gray-600 hover:text-gray-900 font-medium text-sm"
            >
              ← Back
            </button>
            <span className="text-sm text-gray-600 truncate">
              {getSelectedExerciseName()}
            </span>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={workoutDate}
              onChange={(e) => setWorkoutDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Set #
              </label>
              <input
                type="number"
                value={setNumber}
                onChange={(e) => setSetNumber(e.target.value)}
                min="1"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Weight (lbs)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                step="0.5"
                min="0"
                placeholder="135"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Reps
              </label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                min="1"
                placeholder="10"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
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
              placeholder="How did it feel?"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            {loading ? 'Adding...' : 'Add Set'}
          </button>
        </form>
      )}
    </div>
  );
}
