import { useState } from "react";
import { useRouter } from "expo-router";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCreateRoutineFlow } from "@/hooks/useCreateRoutineFlow";

export default function RoutineParametersScreen() {
  const router = useRouter();
  const {
    exercises,
    updateExerciseParams,
    removeExercise,
    submitRoutine,
    routineName,
    routineDescription,
    isSubmitting,
  } = useCreateRoutineFlow();
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async () => {
    try {
      setError(null);
      const routine = await submitRoutine();
      if (routine) {
        router.replace(`/routines/${routine.id}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "No pudimos guardar la rutina";
      setError(message);
      Alert.alert("Error", message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Configura tus ejercicios</Text>
        <Text style={styles.subtitle}>
          Define sets, reps, peso y descansos para cada movimiento.
        </Text>

        <View style={styles.metaCard}>
          <Text style={styles.metaTitle}>{routineName || "Rutina sin nombre"}</Text>
          <Text style={styles.metaDescription}>
            {routineDescription || "Añade una descripción en el paso anterior."}
          </Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {exercises.map((item) => (
          <View key={`${item.exercise.id}-${item.position}`} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.exercise.name}</Text>
                <Text style={styles.cardSubtitle}>{item.exercise.muscle_group}</Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeExercise(item.exercise.id, item.position)}
              >
                <Text style={styles.removeText}>Quitar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.field}>
                <Text style={styles.label}>Sets</Text>
                <TextInput
                  keyboardType="numeric"
                  placeholder="3"
                  placeholderTextColor="#7A7A7A"
                  style={styles.input}
                  value={item.sets?.toString() ?? ""}
                  onChangeText={(text) =>
                    updateExerciseParams(item.exercise.id, { sets: Number(text) || null }, item.position)
                  }
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Reps</Text>
                <TextInput
                  keyboardType="numeric"
                  placeholder="12"
                  placeholderTextColor="#7A7A7A"
                  style={styles.input}
                  value={item.reps?.toString() ?? ""}
                  onChangeText={(text) =>
                    updateExerciseParams(item.exercise.id, { reps: Number(text) || null }, item.position)
                  }
                />
              </View>
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.field}>
                <Text style={styles.label}>Peso (kg)</Text>
                <TextInput
                  keyboardType="numeric"
                  placeholder="40"
                  placeholderTextColor="#7A7A7A"
                  style={styles.input}
                  value={item.weight?.toString() ?? ""}
                  onChangeText={(text) =>
                    updateExerciseParams(item.exercise.id, { weight: Number(text) || null }, item.position)
                  }
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Descanso (seg)</Text>
                <TextInput
                  keyboardType="numeric"
                  placeholder="90"
                  placeholderTextColor="#7A7A7A"
                  style={styles.input}
                  value={item.rest_seconds?.toString() ?? ""}
                  onChangeText={(text) =>
                    updateExerciseParams(
                      item.exercise.id,
                      { rest_seconds: Number(text) || null },
                      item.position,
                    )
                  }
                />
              </View>
            </View>

            <View style={styles.fieldRow}>
              <View style={[styles.field, { flex: 1 }]}> 
                <Text style={styles.label}>Notas</Text>
                <TextInput
                  placeholder="Ritmo controlado, etc"
                  placeholderTextColor="#7A7A7A"
                  style={[styles.input, styles.notes]}
                  multiline
                  value={item.notes ?? ""}
                  onChangeText={(text) =>
                    updateExerciseParams(item.exercise.id, { notes: text || null }, item.position)
                  }
                />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.primaryButton, isSubmitting ? styles.buttonDisabled : null]}
          onPress={handleFinish}
          disabled={isSubmitting}
        >
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? "Guardando rutina..." : "Finalizar rutina"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0C0C0F" },
  content: { padding: 20, paddingBottom: 40 },
  title: { color: "#F5F5F5", fontWeight: "800", fontSize: 22 },
  subtitle: { color: "#A0A0A0", marginTop: 6, marginBottom: 16 },
  metaCard: {
    backgroundColor: "#15151A",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1F1F26",
    marginBottom: 16,
  },
  metaTitle: { color: "#F5F5F5", fontWeight: "800", fontSize: 18 },
  metaDescription: { color: "#C4C4C4", marginTop: 6 },
  errorText: { color: "#FF6B6B", marginBottom: 12 },
  card: {
    backgroundColor: "#15151A",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1F1F26",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  cardTitle: { color: "#F5F5F5", fontWeight: "800", fontSize: 16 },
  cardSubtitle: { color: "#8D8D94", marginTop: 4 },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FF2D44",
  },
  removeText: { color: "#FF2D44", fontWeight: "700" },
  fieldRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  field: { flex: 1 },
  label: { color: "#C4C4C4", marginBottom: 4, fontWeight: "700" },
  input: {
    backgroundColor: "#1E1E24",
    color: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#26262E",
  },
  notes: { minHeight: 60, textAlignVertical: "top" },
  primaryButton: {
    backgroundColor: "#FF2D44",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
  },
  primaryButtonText: { color: "white", fontWeight: "800" },
  buttonDisabled: { opacity: 0.6 },
});
