import { useRef, useState } from "react";
import Autocomplete from "./Autocomplete";

export default function ExerciseCard({
  exercise,
  dayName,
  onUpdate,
  onDelete,
}) {
  const [swipeX, setSwipeX] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const swiping = useRef(false);

  const isDone = exercise.checkedAt !== null;

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
      e.preventDefault();
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

  const handleCheck = () => {
    onUpdate({ checkedAt: isDone ? null : Date.now() });
  };

  const handleWeightChange = (e) => {
    const val = e.target.value;
    onUpdate({ weight: val === "" ? null : Number(val) });
  };

  const handleSetChange = (index, value) => {
    const newSets = [...exercise.sets];
    newSets[index] = value;
    onUpdate({ sets: newSets });
  };

  const addSet = () => {
    onUpdate({ sets: [...exercise.sets, ""] });
  };

  const removeSet = () => {
    if (exercise.sets.length > 1) {
      onUpdate({ sets: exercise.sets.slice(0, -1) });
    }
  };

  const handleLevelChange = (delta) => {
    const newLevel = Math.max(1, exercise.level + delta);
    onUpdate({ level: newLevel });
  };

  return (
    <div className="exercise-card-container">
      {swipeX < 0 && (
        <div className="swipe-delete-bg" onClick={onDelete}>
          Delete
        </div>
      )}
      <div
        className={`exercise-card ${isDone ? "done" : ""}`}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="exercise-row1">
          <Autocomplete
            value={exercise.name}
            onChange={(name) => onUpdate({ name })}
            dayName={dayName}
          />
          <div className="weight-box">
            <input
              type="number"
              className="weight-input"
              value={exercise.weight === null ? "" : exercise.weight}
              onChange={handleWeightChange}
              placeholder="—"
            />
            <span className="weight-unit">kg</span>
          </div>
          <button
            className={`check-btn ${isDone ? "checked" : ""}`}
            onClick={handleCheck}
          >
            {isDone ? "\u2713" : ""}
          </button>
        </div>
        <div className="exercise-row2">
          <div className="sets-container">
            {exercise.sets.map((s, i) => (
              <input
                key={i}
                type="number"
                className="set-input"
                value={s}
                onChange={(e) => handleSetChange(i, e.target.value)}
                placeholder=""
              />
            ))}
            {exercise.sets.length > 1 && (
              <button className="add-set-btn" onClick={removeSet}>
                &minus;
              </button>
            )}
            <button className="add-set-btn" onClick={addSet}>
              +
            </button>
          </div>
          <div className="level-container">
            <button
              className="level-btn level-down"
              onClick={() => handleLevelChange(-1)}
            >
              &#8744;
            </button>
            <span className="level-text">lvl {exercise.level}</span>
            <button
              className="level-btn level-up"
              onClick={() => handleLevelChange(1)}
            >
              &#8743;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
