import { useState, useEffect } from 'react';
import { supabase, Exercise } from '../lib/supabase';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Dumbbell from 'lucide-react/dist/esm/icons/dumbbell';

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

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    if (selectedMuscleGroup) {
      const filtered = allExercises
        .filter((ex) => ex.muscle_group === selectedMuscleGroup)
        .sort((a, b) => a.name.localeCompare(b.name));
      setFilteredExercises(filtered);
      setSelectedExerciseId(filtered.length > 0 ? filtered[0].id : '');
    } else {
      setFilteredExercises([]);
      setSelectedExerciseId('');
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
    const groups = new Set(allExercises.map((ex) => ex.muscle_group));
    return Array.from(groups).sort();
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
    onWorkoutAdded();
  };

  const isFormValid = selectedExerciseId && weight && reps;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-6">
        <Dumbbell className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Log Workout Set</h2>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Muscle Group
          </label>
          <select
            value={selectedMuscleGroup}
            onChange={(e) => {
              setSelectedMuscleGroup(e.target.value);
              setSetNumber('1');
            }}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Select muscle group...</option>
            {getMuscleGroups().map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Exercise
          </label>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            disabled={!selectedMuscleGroup}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:text-gray-400"
          >
            {!selectedMuscleGroup ? (
              <option value="">Select a muscle group first...</option>
            ) : filteredExercises.length === 0 ? (
              <option value="">No exercises found</option>
            ) : (
              <>
                <option value="">Select exercise...</option>
                {filteredExercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 border-t border-gray-200 pt-5">

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
                Weight (kgs)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                step="0.5"
                min="0"
                placeholder="60"
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
          disabled={loading || !isFormValid}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          {loading ? 'Adding...' : 'Add Set'}
        </button>
      </form>
    </div>
  );
}
