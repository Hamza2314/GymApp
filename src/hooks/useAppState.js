import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "gym-tracker-data";
const TWELVE_HOURS = 43200000;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { days: [] };
    const data = JSON.parse(raw);
    const now = Date.now();
    for (const day of data.days) {
      for (const ex of day.exercises) {
        if (ex.checkedAt && now - ex.checkedAt > TWELVE_HOURS) {
          ex.checkedAt = null;
        }
      }
    }
    persist(data);
    return data;
  } catch {
    return { days: [] };
  }
}

function persist(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useAppState() {
  const [state, setStateRaw] = useState(loadState);

  const setState = useCallback((updater) => {
    setStateRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      persist(next);
      return next;
    });
  }, []);

  const addDay = useCallback((name) => {
    const id = uuidv4();
    setState((prev) => ({
      days: [
        ...prev.days,
        { id, name, order: prev.days.length, exercises: [] },
      ],
    }));
    return id;
  }, [setState]);

  const deleteDay = useCallback((dayId) => {
    let deleted = null;
    let deletedIndex = -1;
    setState((prev) => {
      deletedIndex = prev.days.findIndex((d) => d.id === dayId);
      deleted = prev.days[deletedIndex];
      const newDays = prev.days
        .filter((d) => d.id !== dayId)
        .map((d, i) => ({ ...d, order: i }));
      return { days: newDays };
    });
    return { deleted, deletedIndex };
  }, [setState]);

  const restoreDay = useCallback((day, index) => {
    setState((prev) => {
      const newDays = [...prev.days];
      newDays.splice(index, 0, day);
      return { days: newDays.map((d, i) => ({ ...d, order: i })) };
    });
  }, [setState]);

  const reorderDays = useCallback((newDays) => {
    setState({ days: newDays.map((d, i) => ({ ...d, order: i })) });
  }, [setState]);

  const addExercise = useCallback((dayId) => {
    const ex = {
      id: uuidv4(),
      name: "",
      weight: null,
      level: 1,
      checkedAt: null,
      sets: ["", "", "", ""],
    };
    setState((prev) => ({
      days: prev.days.map((d) =>
        d.id === dayId ? { ...d, exercises: [...d.exercises, ex] } : d
      ),
    }));
  }, [setState]);

  const updateExercise = useCallback((dayId, exId, updates) => {
    setState((prev) => ({
      days: prev.days.map((d) =>
        d.id === dayId
          ? {
              ...d,
              exercises: d.exercises.map((e) =>
                e.id === exId ? { ...e, ...updates } : e
              ),
            }
          : d
      ),
    }));
  }, [setState]);

  const deleteExercise = useCallback((dayId, exId) => {
    let deleted = null;
    let deletedIndex = -1;
    setState((prev) => ({
      days: prev.days.map((d) => {
        if (d.id !== dayId) return d;
        deletedIndex = d.exercises.findIndex((e) => e.id === exId);
        deleted = d.exercises[deletedIndex];
        return { ...d, exercises: d.exercises.filter((e) => e.id !== exId) };
      }),
    }));
    return { deleted, deletedIndex, dayId };
  }, [setState]);

  const restoreExercise = useCallback((dayId, exercise, index) => {
    setState((prev) => ({
      days: prev.days.map((d) => {
        if (d.id !== dayId) return d;
        const exs = [...d.exercises];
        exs.splice(index, 0, exercise);
        return { ...d, exercises: exs };
      }),
    }));
  }, [setState]);

  return {
    state,
    addDay,
    deleteDay,
    restoreDay,
    reorderDays,
    addExercise,
    updateExercise,
    deleteExercise,
    restoreExercise,
  };
}
