import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Exercise, Routine, RoutineExerciseInput } from "@/types/models";

interface RoutineFlowState {
  routineName: string;
  routineDescription: string;
  exercises: RoutineExerciseInput[];
  isSubmitting: boolean;
  setRoutineName: (name: string) => void;
  setRoutineDescription: (description: string) => void;
  addExercise: (exercise: Exercise) => void;
  removeExercise: (exerciseId: string, position?: number) => void;
  updateExerciseParams: (
    exerciseId: string,
    updates: Partial<RoutineExerciseInput>,
    position?: number,
  ) => void;
  resetFlow: () => void;
  submitRoutine: () => Promise<Routine | null>;
}

const RoutineFlowContext = createContext<RoutineFlowState | undefined>(undefined);

const normalizePositions = (items: RoutineExerciseInput[]) =>
  items
    .sort((a, b) => a.position - b.position)
    .map((item, index) => ({ ...item, position: index + 1 }));

export const CreateRoutineFlowProvider = ({ children }: { children: React.ReactNode }) => {
  const [routineName, setRoutineName] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [exercises, setExercises] = useState<RoutineExerciseInput[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addExercise = useCallback((exercise: Exercise) => {
    setExercises((prev) => normalizePositions([
      ...prev,
      {
        exercise,
        position: prev.length + 1,
        sets: null,
        reps: null,
        weight: null,
        rest_seconds: null,
        notes: null,
      },
    ]));
  }, []);

  const removeExercise = useCallback((exerciseId: string, position?: number) => {
    setExercises((prev) => {
      const filtered = prev.filter(
        (item) =>
          !(item.exercise.id === exerciseId && (position ? item.position === position : true)),
      );
      return normalizePositions(filtered);
    });
  }, []);

  const updateExerciseParams = useCallback(
    (exerciseId: string, updates: Partial<RoutineExerciseInput>, position?: number) => {
      setExercises((prev) => {
        const updated = prev.map((item) => {
          const sameExercise = item.exercise.id === exerciseId;
          const samePosition = position ? item.position === position : true;
          if (!sameExercise || !samePosition) return item;
          return { ...item, ...updates };
        });
        return normalizePositions(updated);
      });
    },
    [],
  );

  const resetFlow = useCallback(() => {
    setRoutineName("");
    setRoutineDescription("");
    setExercises([]);
    setIsSubmitting(false);
  }, []);

  const submitRoutine = useCallback(async () => {
    if (!routineName.trim()) {
      throw new Error("La rutina necesita un nombre");
    }

    if (exercises.length === 0) {
      throw new Error("Agrega al menos un ejercicio antes de guardar");
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user?.id) throw new Error("No se encontró sesión activa");

      const { data: routineData, error: routineError } = await supabase
        .from("routines")
        .insert({
          profile_id: user.id,
          name: routineName.trim(),
          description: routineDescription.trim() || null,
        })
        .select("*")
        .single();

      if (routineError) throw routineError;
      if (!routineData) throw new Error("No se pudo crear la rutina");

      const payload = normalizePositions(exercises).map((item) => ({
        routine_id: routineData.id,
        exercise_id: item.exercise.id,
        position: item.position,
        sets: item.sets,
        reps: item.reps,
        weight: item.weight,
        rest_seconds: item.rest_seconds,
        notes: item.notes,
      }));

      const { error: routineExercisesError } = await supabase
        .from("routine_exercises")
        .insert(payload);

      if (routineExercisesError) throw routineExercisesError;

      resetFlow();
      return routineData as Routine;
    } catch (error) {
      console.error("Error creating routine", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [exercises, resetFlow, routineDescription, routineName]);

  const value = useMemo(
    () => ({
      routineName,
      routineDescription,
      exercises,
      isSubmitting,
      setRoutineName,
      setRoutineDescription,
      addExercise,
      removeExercise,
      updateExerciseParams,
      resetFlow,
      submitRoutine,
    }),
    [
      routineName,
      routineDescription,
      exercises,
      isSubmitting,
      addExercise,
      removeExercise,
      updateExerciseParams,
      resetFlow,
      submitRoutine,
    ],
  );

  return (
    <RoutineFlowContext.Provider value={value}>{children}</RoutineFlowContext.Provider>
  );
};

export const useCreateRoutineFlow = () => {
  const context = useContext(RoutineFlowContext);
  if (!context) {
    throw new Error("useCreateRoutineFlow debe usarse dentro de CreateRoutineFlowProvider");
  }
  return context;
};
