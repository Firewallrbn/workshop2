export interface Profile {
  id: string;
  email: string;
  username: string;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  weight_goal?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string | null;
  muscle_group: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  equipment?: string | null;
  video_url?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Routine {
  id: string;
  profile_id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_id: string;
  position: number;
  sets?: number | null;
  reps?: number | null;
  weight?: number | null;
  rest_seconds?: number | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  exercise?: Exercise;
}

export interface RoutineExerciseInput {
  exercise: Exercise;
  position: number;
  sets?: number | null;
  reps?: number | null;
  weight?: number | null;
  rest_seconds?: number | null;
  notes?: string | null;
}
