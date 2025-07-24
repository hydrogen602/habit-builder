import { useState, useEffect } from "react";

interface Goal {
  id: string;
  name: string;
  progress: number;
  max: number;
}

export function HabitBuilder() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalMax, setNewGoalMax] = useState<number | string>(10);
  const [editingMaxValues, setEditingMaxValues] = useState<Record<string, string>>({});

  // Load goals from localStorage on component mount
  useEffect(() => {
    const savedGoals = localStorage.getItem("habitBuilderGoals");
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  // Save goals to localStorage whenever goals change
  useEffect(() => {
    localStorage.setItem("habitBuilderGoals", JSON.stringify(goals));
  }, [goals]);

  const addGoal = () => {
    if (newGoalName.trim()) {
      const maxValue = typeof newGoalMax === 'number' && newGoalMax > 0 ? newGoalMax : 10;
      const newGoal: Goal = {
        id: Date.now().toString(),
        name: newGoalName.trim(),
        progress: 0,
        max: maxValue,
      };
      setGoals([...goals, newGoal]);
      setNewGoalName("");
      setNewGoalMax(10);
    }
  };

  const incrementProgress = (id: string) => {
    setGoals(goals.map(goal =>
      goal.id === id && goal.progress < goal.max
        ? { ...goal, progress: goal.progress + 1 }
        : goal
    ));
  };

  const resetProgress = (id: string) => {
    setGoals(goals.map(goal =>
      goal.id === id
        ? { ...goal, progress: 0 }
        : goal
    ));
  }; const handleMaxInputChange = (id: string, value: string) => {
    // Store the temporary editing value
    setEditingMaxValues(prev => ({
      ...prev,
      [id]: value
    }));

    // If it's a valid positive integer, update the goal immediately
    const parsed = parseInt(value);
    if (!isNaN(parsed) && parsed > 0) {
      setGoals(goals.map(goal =>
        goal.id === id
          ? { ...goal, max: parsed, progress: Math.min(goal.progress, parsed) }
          : goal
      ));
    }
  };

  const handleMaxInputBlur = (id: string) => {
    const editingValue = editingMaxValues[id];
    if (editingValue !== undefined && editingValue.trim() === '') {
      // If empty on blur, set to 1 (minimum value) and clear editing state
      setGoals(goals.map(goal =>
        goal.id === id
          ? { ...goal, max: 1, progress: Math.min(goal.progress, 1) }
          : goal
      ));
      setEditingMaxValues(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } else if (editingValue !== undefined) {
      // Clear editing state since we have a valid value
      setEditingMaxValues(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };

  const getMaxDisplayValue = (goal: Goal) => {
    // Return editing value if it exists, otherwise the actual max value
    return editingMaxValues[goal.id] !== undefined
      ? editingMaxValues[goal.id]
      : goal.max.toString();
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const getProgressPercentage = (progress: number, max: number) => {
    return Math.round((progress / max) * 100);
  };

  const getProgressColor = (progress: number, max: number) => {
    const percentage = getProgressPercentage(progress, max);
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Habit Builder
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your goals and build better habits
          </p>
        </div>

        {/* Add New Goal Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Add New Goal
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
              placeholder="Enter goal name..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              onKeyPress={(e) => e.key === "Enter" && addGoal()}
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Max:
              </label>
              <input
                type="number"
                value={newGoalMax}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setNewGoalMax(''); // Allow empty string temporarily
                  } else {
                    const parsed = parseInt(value);
                    if (!isNaN(parsed) && parsed > 0) {
                      setNewGoalMax(parsed); // Update immediately with valid value
                    } else {
                      setNewGoalMax(value); // Keep the input value for continued editing
                    }
                  }
                }}
                onBlur={() => {
                  // If field is empty or invalid on blur, set to default value of 10
                  if (newGoalMax === '' || typeof newGoalMax === 'string' || newGoalMax <= 0) {
                    setNewGoalMax(10);
                  }
                }}
                min="1"
                className="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              onClick={addGoal}
              disabled={!newGoalName.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Goal
            </button>
          </div>
        </div>

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No goals yet
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Add your first goal to start tracking your progress!
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {goal.name}
                  </h3>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Progress: {goal.progress} / {goal.max}
                    </span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {getProgressPercentage(goal.progress, goal.max)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(goal.progress, goal.max)}`}
                      style={{
                        width: `${getProgressPercentage(goal.progress, goal.max)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => incrementProgress(goal.id)}
                    disabled={goal.progress >= goal.max}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    +1 Progress
                  </button>

                  <button
                    onClick={() => resetProgress(goal.id)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  >
                    Reset
                  </button>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                      Max:
                    </label>
                    <input
                      type="number"
                      value={getMaxDisplayValue(goal)}
                      onChange={(e) => handleMaxInputChange(goal.id, e.target.value)}
                      onBlur={() => handleMaxInputBlur(goal.id)}
                      min="1"
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {goal.progress === goal.max && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      🎉 Completed!
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {goals.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Statistics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {goals.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Goals
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {goals.filter(goal => goal.progress === goal.max).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {Math.round(
                    goals.reduce((acc, goal) => acc + getProgressPercentage(goal.progress, goal.max), 0) / goals.length
                  )}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Average Progress
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
