import { supabase } from "./supabaseClient";
import { Exercise } from "@/types/models";

export const fetchAllExercises = async (): Promise<Exercise[]> => {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const fetchLikedExercises = async (
  profileId: string,
): Promise<Exercise[]> => {
  const { data, error } = await supabase
    .from("exercise_likes")
    .select("exercises(*)")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((entry) => (entry as { exercises: Exercise | null }).exercises)
    .filter((exercise): exercise is Exercise => Boolean(exercise));
};
