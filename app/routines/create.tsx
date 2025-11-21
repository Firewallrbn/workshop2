import { Link, useRouter } from "expo-router";
import { useMemo } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCreateRoutineFlow } from "@/hooks/useCreateRoutineFlow";

export default function CreateRoutineScreen() {
  const router = useRouter();
  const {
    routineName,
    routineDescription,
    setRoutineName,
    setRoutineDescription,
    exercises,
  } = useCreateRoutineFlow();

  const summary = useMemo(() => exercises, [exercises]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Nueva rutina</Text>
        <Text style={styles.subtitle}>
          Ponle un nombre atractivo y agrega ejercicios. Puedes editar los parámetros luego.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            placeholder="Ej. Push/Pull/Legs"
            placeholderTextColor="#7A7A7A"
            style={styles.input}
            value={routineName}
            onChangeText={setRoutineName}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Descripción</Text>
          <TextInput
            placeholder="Descripción corta..."
            placeholderTextColor="#7A7A7A"
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            value={routineDescription}
            onChangeText={setRoutineDescription}
          />
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Ejercicios añadidos</Text>
            <Link href="/routines/add-exercises" asChild>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Agregar ejercicios</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {summary.length === 0 ? (
            <Text style={styles.emptyState}>Todavía no has agregado ejercicios.</Text>
          ) : (
            summary.map((item) => (
              <View key={`${item.exercise.id}-${item.position}`} style={styles.exerciseRow}>
                <Text style={styles.exerciseName}>{item.exercise.name}</Text>
                <Text style={styles.exerciseMeta}>{item.exercise.muscle_group}</Text>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { marginTop: 24 }]}
          onPress={() => router.push("/routines/parameters")}
        >
          <Text style={styles.primaryButtonText}>Configurar sets y reps</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0C0F",
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#F5F5F5",
  },
  subtitle: {
    color: "#A0A0A0",
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#15151A",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1F1F26",
  },
  label: {
    color: "#C4C4C4",
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#1E1E24",
    color: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#26262E",
  },
  textArea: { minHeight: 120, textAlignVertical: "top" },
  summaryCard: {
    backgroundColor: "#15151A",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1F1F26",
    marginTop: 16,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryTitle: { color: "#F5F5F5", fontWeight: "700", fontSize: 16 },
  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF2D44",
  },
  secondaryButtonText: { color: "#FF2D44", fontWeight: "700" },
  emptyState: { color: "#8D8D94", textAlign: "center" },
  exerciseRow: {
    backgroundColor: "#1E1E24",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#26262E",
  },
  exerciseName: { color: "#F5F5F5", fontWeight: "700" },
  exerciseMeta: { color: "#8D8D94", marginTop: 2 },
  primaryButton: {
    backgroundColor: "#FF2D44",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryButtonText: { color: "white", fontWeight: "800", fontSize: 15 },
});
