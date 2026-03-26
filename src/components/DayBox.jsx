import { useState, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ExerciseCard from "./ExerciseCard";

export default function DayBox({
  day,
  isExpanded,
  onToggle,
  onDeleteDay,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: day.id });

  const [swipeX, setSwipeX] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const swiping = useRef(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swiping.current = false;
  };

  const handleTouchMove = (e) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (!swiping.current && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      swiping.current = true;
    }
    if (swiping.current) {
      setSwipeX(Math.min(0, dx));
    }
  };

  const handleTouchEnd = () => {
    if (swipeX < -80) {
      setSwipeX(-100);
    } else {
      setSwipeX(0);
    }
  };

  return (
    <div className="day-box-container" ref={setNodeRef} style={style}>
      {swipeX < 0 && (
        <div className="day-swipe-delete-bg" onClick={() => onDeleteDay(day.id)}>
          Delete
        </div>
      )}
      <div
        className="day-box"
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="day-header" onClick={onToggle}>
          <span className="drag-handle" {...attributes} {...listeners} onClick={(e) => e.stopPropagation()}>
            &#9776;
          </span>
          <span className="day-name">{day.name}</span>
          <span className={`day-chevron ${isExpanded ? "open" : ""}`}>
            &#9660;
          </span>
        </div>
        {isExpanded && (
          <div className="day-content">
            {day.exercises.map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                dayName={day.name}
                onUpdate={(updates) => onUpdateExercise(day.id, ex.id, updates)}
                onDelete={() => onDeleteExercise(day.id, ex.id)}
              />
            ))}
            <button
              className="add-exercise-btn"
              onClick={() => onAddExercise(day.id)}
            >
              + Add Exercise
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
