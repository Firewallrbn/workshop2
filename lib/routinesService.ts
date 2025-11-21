import { supabase } from "./supabaseClient";
import { Routine, RoutineExercise } from "@/types/models";

export const fetchUserRoutines = async (
  profileId: string,
): Promise<Routine[]> => {
  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const fetchRoutineDetail = async (
  routineId: string,
): Promise<{ routine: Routine | null; exercises: RoutineExercise[] }> => {
  const { data, error } = await supabase
    .from("routines")
    .select(
      `*, routine_exercises(*, exercises:exercise_id(*))`,
    )
    .eq("id", routineId)
    .single();

  if (error) {
    throw error;
  }

  const routine = data as Routine & {
    routine_exercises?: (RoutineExercise & {
      exercises?: RoutineExercise["exercise"];
    })[];
  };

  const exercises = (routine?.routine_exercises ?? []).map((item) => ({
    ...item,
    exercise: item.exercises,
  }));

  return { routine, exercises };
};
