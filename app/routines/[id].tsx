import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchRoutineDetail } from "@/lib/routinesService";
import { Routine, RoutineExercise } from "@/types/models";

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [items, setItems] = useState<RoutineExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      const { routine: data, exercises } = await fetchRoutineDetail(id);
      setRoutine(data);
      setItems(exercises);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No pudimos cargar la rutina");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Detalles de la rutina</Text>
        </View>

        {isLoading ? (
          <View style={styles.loader}> 
            <ActivityIndicator color="#FF2D44" />
            <Text style={styles.loaderText}>Cargando...</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {routine ? (
          <View style={styles.metaCard}>
            <Text style={styles.metaTitle}>{routine.name}</Text>
            <Text style={styles.metaDescription}>
              {routine.description || "Sin descripción"}
            </Text>
          </View>
        ) : null}

        {items.map((item) => (
          <View key={item.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseTitle}>{item.exercise?.name}</Text>
              <Text style={styles.exercisePosition}>#{item.position}</Text>
            </View>
            <Text style={styles.exerciseMeta}>{item.exercise?.muscle_group}</Text>
            <Text style={styles.exerciseMeta}>Sets x reps: {item.sets ?? "-"} x {item.reps ?? "-"}</Text>
            <Text style={styles.exerciseMeta}>Peso: {item.weight ?? "-"} kg</Text>
            <Text style={styles.exerciseMeta}>Descanso: {item.rest_seconds ?? "-"} seg</Text>
            {item.notes ? (
              <Text style={styles.notes}>Notas: {item.notes}</Text>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0C0C0F" },
  content: { padding: 20, paddingBottom: 32 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  back: { color: "#FF2D44", fontWeight: "700" },
  title: { color: "#F5F5F5", fontSize: 18, fontWeight: "800" },
  loader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  loaderText: { color: "#8D8D94" },
  errorText: { color: "#FF6B6B", marginBottom: 12 },
  metaCard: {
    backgroundColor: "#15151A",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1F1F26",
    marginBottom: 12,
  },
  metaTitle: { color: "#F5F5F5", fontWeight: "800", fontSize: 20 },
  metaDescription: { color: "#C4C4C4", marginTop: 6 },
  exerciseCard: {
    backgroundColor: "#1E1E24",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1F1F26",
    marginBottom: 12,
  },
  exerciseHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  exerciseTitle: { color: "#F5F5F5", fontWeight: "800" },
  exercisePosition: { color: "#FF2D44", fontWeight: "800" },
  exerciseMeta: { color: "#C4C4C4", marginTop: 2 },
  notes: { color: "#F5F5F5", marginTop: 6 },
});
