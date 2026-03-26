import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useAppState } from "./hooks/useAppState";
import DayBox from "./components/DayBox";
import Toast from "./components/Toast";
import "./App.css";

function App() {
  const {
    state,
    addDay,
    deleteDay,
    restoreDay,
    reorderDays,
    addExercise,
    updateExercise,
    deleteExercise,
    restoreExercise,
  } = useAppState();

  const [expandedDayId, setExpandedDayId] = useState(() => {
    const s = state;
    return s.days.length > 0 ? s.days[0].id : null;
  });
  const [showAddDay, setShowAddDay] = useState(false);
  const [newDayName, setNewDayName] = useState("");
  const [toast, setToast] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const showToast = useCallback((message, onUndo) => {
    setToast({ message, onUndo });
  }, []);

  const closeToast = useCallback(() => setToast(null), []);

  const handleAddDay = () => {
    if (newDayName.trim()) {
      const id = addDay(newDayName.trim());
      setExpandedDayId(id);
      setNewDayName("");
      setShowAddDay(false);
    }
  };

  const handleDeleteExercise = (dayId, exId) => {
    const { deleted, deletedIndex } = deleteExercise(dayId, exId);
    showToast("Exercise deleted — Undo", () => {
      restoreExercise(dayId, deleted, deletedIndex);
      closeToast();
    });
  };

  const handleDeleteDay = (dayId) => {
    const { deleted, deletedIndex } = deleteDay(dayId);
    if (expandedDayId === dayId) {
      const remaining = state.days.filter((d) => d.id !== dayId);
      setExpandedDayId(remaining.length > 0 ? remaining[0].id : null);
    }
    showToast("Day deleted — Undo", () => {
      restoreDay(deleted, deletedIndex);
      setExpandedDayId(deleted.id);
      closeToast();
    });
  };

  const handleToggleDay = (dayId) => {
    setExpandedDayId((prev) => (prev === dayId ? null : dayId));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = state.days.findIndex((d) => d.id === active.id);
      const newIndex = state.days.findIndex((d) => d.id === over.id);
      const newDays = arrayMove(state.days, oldIndex, newIndex);
      reorderDays(newDays);
    }
  };

  return (
    <div className="app">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={state.days.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {state.days.map((day) => (
            <DayBox
              key={day.id}
              day={day}
              isExpanded={expandedDayId === day.id}
              onToggle={() => handleToggleDay(day.id)}
              onDeleteDay={handleDeleteDay}
              onAddExercise={addExercise}
              onUpdateExercise={updateExercise}
              onDeleteExercise={handleDeleteExercise}
            />
          ))}
        </SortableContext>
      </DndContext>

      <div className="add-day-section">
        {showAddDay ? (
          <div className="add-day-inline">
            <input
              type="text"
              className="add-day-input"
              value={newDayName}
              onChange={(e) => setNewDayName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddDay()}
              placeholder="Day name..."
              autoFocus
            />
            <button className="confirm-btn" onClick={handleAddDay}>
              Add
            </button>
            <button
              className="cancel-btn"
              onClick={() => {
                setShowAddDay(false);
                setNewDayName("");
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="add-day-btn"
            onClick={() => setShowAddDay(true)}
          >
            + Add Day
          </button>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          onUndo={toast.onUndo}
          onClose={closeToast}
        />
      )}
    </div>
  );
}

export default App;
