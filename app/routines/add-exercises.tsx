import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchAllExercises, fetchLikedExercises } from "@/lib/exerciseService";
import { supabase } from "@/lib/supabaseClient";
import { Exercise } from "@/types/models";
import { useCreateRoutineFlow } from "@/hooks/useCreateRoutineFlow";

export default function AddExercisesScreen() {
  const router = useRouter();
  const { addExercise, exercises } = useCreateRoutineFlow();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Exercise[]>([]);
  const [showOnlyLiked, setShowOnlyLiked] = useState(false);

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user?.id) throw new Error("No hay sesión activa");

      const data = showOnlyLiked
        ? await fetchLikedExercises(user.id)
        : await fetchAllExercises();
      setItems(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No pudimos cargar ejercicios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [showOnlyLiked]);

  const handleAdd = (exercise: Exercise) => {
    addExercise(exercise);
  };

  const isAlreadyAdded = (exerciseId: string) =>
    exercises.some((entry) => entry.exercise.id === exerciseId);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Agregar ejercicios</Text>
        <TouchableOpacity onPress={() => router.push("/routines/parameters")}> 
          <Text style={styles.done}>Hecho</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.chip, !showOnlyLiked ? styles.chipActive : null]}
          onPress={() => setShowOnlyLiked(false)}
        >
          <Text style={styles.chipText}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chip, showOnlyLiked ? styles.chipActive : null]}
          onPress={() => setShowOnlyLiked(true)}
        >
          <Text style={styles.chipText}>Favoritos</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loader}> 
          <ActivityIndicator color="#FF2D44" />
          <Text style={styles.loaderText}>Buscando ejercicios...</Text>
        </View>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const added = isAlreadyAdded(item.id);
          return (
            <TouchableOpacity
              style={[styles.card, added ? styles.cardAdded : null]}
              onPress={() => handleAdd(item)}
              disabled={isLoading}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>{item.muscle_group}</Text>
                <Text style={styles.cardMeta}>Dificultad: {item.difficulty}</Text>
              </View>
              <View style={styles.addBadge}>
                <Text style={styles.addBadgeText}>{added ? "Añadido" : "Agregar"}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={!isLoading ? (
          <Text style={styles.empty}>No encontramos ejercicios para mostrar.</Text>
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0C0C0F", paddingTop: 20, paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  back: { color: "#FF2D44", fontWeight: "700" },
  title: { color: "#F5F5F5", fontSize: 18, fontWeight: "800" },
  done: { color: "#FF2D44", fontWeight: "700" },
  filters: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#26262E",
    backgroundColor: "#15151A",
  },
  chipActive: {
    borderColor: "#FF2D44",
    backgroundColor: "#1E1E24",
  },
  chipText: { color: "#F5F5F5", fontWeight: "700" },
  loader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  loaderText: { color: "#8D8D94" },
  errorText: { color: "#FF6B6B", marginBottom: 10 },
  card: {
    backgroundColor: "#15151A",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1F1F26",
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  cardAdded: { borderColor: "#FF2D44", backgroundColor: "#1E1E24" },
  cardTitle: { color: "#F5F5F5", fontWeight: "700", fontSize: 16 },
  cardSubtitle: { color: "#8D8D94", marginTop: 4 },
  cardMeta: { color: "#8D8D94", marginTop: 2, fontSize: 12 },
  addBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#FF2D44",
  },
  addBadgeText: { color: "white", fontWeight: "700" },
  empty: { color: "#8D8D94", textAlign: "center", marginTop: 32 },
});
