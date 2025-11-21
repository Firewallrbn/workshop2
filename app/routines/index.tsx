import { useCallback, useState } from "react";
import { Link } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchUserRoutines } from "@/lib/routinesService";
import { supabase } from "@/lib/supabaseClient";
import { Routine } from "@/types/models";

export default function RoutinesScreen() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRoutines = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user?.id) throw new Error("Inicia sesión para ver tus rutinas");

      const data = await fetchUserRoutines(user.id);
      setRoutines(data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "No se pudo cargar la lista de rutinas",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRoutines();
      return () => {};
    }, [loadRoutines]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Rutinas</Text>
          <Text style={styles.subtitle}>Crea y guarda tus entrenamientos</Text>
        </View>
        <Link href="/routines/create" asChild>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Crear rutina</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {isLoading ? (
        <View style={styles.loader}> 
          <ActivityIndicator size="large" color="#FF2D44" />
          <Text style={styles.loaderText}>Cargando rutinas...</Text>
        </View>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyState}>No tienes rutinas creadas aún.</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Link href={`/routines/${item.id}`} asChild>
            <TouchableOpacity style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description || "Sin descripción"}
              </Text>
              <View style={styles.badgeRow}>
                <Text style={styles.badge}>Creada: {new Date(item.created_at ?? "").toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0C0F",
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#F5F5F5",
  },
  subtitle: {
    color: "#A0A0A0",
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: "#FF2D44",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "700",
  },
  loader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  loaderText: { color: "#A0A0A0" },
  errorText: { color: "#FF6B6B", marginBottom: 12 },
  emptyState: { color: "#A0A0A0", textAlign: "center", marginTop: 32 },
  card: {
    backgroundColor: "#15151A",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1F1F26",
  },
  cardTitle: {
    color: "#F5F5F5",
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 6,
  },
  cardDescription: {
    color: "#C4C4C4",
    fontSize: 14,
  },
  badgeRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  badge: {
    backgroundColor: "#1F1F26",
    color: "#C4C4C4",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    fontSize: 12,
  },
});
