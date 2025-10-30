import { GeminiResponse, QuestionCardData } from "@/types/responses";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MainScreen() {

  const [questions, setQuestions] = useState<QuestionCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generationBody = useMemo(
    () => ({
      contents: [
        {
          parts: [
            {
              text: "List of question about general culture about Colombia.",
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              question: { type: "STRING" },
              options: {
                type: "ARRAY",
                items: { type: "STRING" },
              },
              correctOption: { type: "NUMBER" },
            },
          },
        },
      },
    }),
    [],
  );

  const parseQuestions = useCallback((payload: unknown): QuestionCardData[] => {
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload
      .map((item) => {
        const draft = item as {
          question?: unknown;
          options?: unknown;
          correctOption?: unknown;
        };

        if (
          typeof item !== "object" ||
          item === null ||
          typeof draft.question !== "string" ||
          !Array.isArray(draft.options)
        ) {
          return null;
        }

        const safeOptions = (draft.options as unknown[])
          .map((option: unknown) =>
            typeof option === "string" ? option : null,
          )
          .filter((option): option is string => option !== null);

        if (safeOptions.length === 0) {
          return null;
        }

        const rawCorrectOption = draft.correctOption;
        const safeCorrectOption =
          typeof rawCorrectOption === "number" &&
          rawCorrectOption >= 0 &&
          rawCorrectOption < safeOptions.length
            ? rawCorrectOption
            : 0;

        return {
          question: draft.question as string,
          options: safeOptions,
          correctOption: safeCorrectOption,
        };
      })
      .filter((item): item is QuestionCardData => item !== null);
  }, []);

  const getIAResponse = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "x-goog-api-key": "AIzaSyA1Nz_1WMPhoi14OZ7Z1V1uJXTcjK74z7c",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(generationBody),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      const rawText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";

      const parsedQuestions = parseQuestions(JSON.parse(rawText));
      setQuestions(parsedQuestions);
    } catch (err) {
      console.error("Error fetching Gemini data", err);
      setQuestions([]);
      setError("No se pudieron obtener las preguntas. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  }, [generationBody, parseQuestions]);

  useEffect(() => {
    getIAResponse();
  }, [getIAResponse]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Trivia Colombia</Text>
          <Text style={styles.subtitle}>
            Preguntas de cultura general generadas por IA
          </Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          disabled={isLoading}
          onPress={getIAResponse}
          style={[
            styles.refreshButton,
            isLoading ? styles.refreshButtonDisabled : null,
          ]}
        >
          <Text style={styles.refreshButtonText}>
            {isLoading ? "Cargando..." : "Actualizar"}
          </Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {isLoading && questions.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={COLORS.accent} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.cardsContainer}
          showsVerticalScrollIndicator={false}
        >
          {questions.map((question, index) => (
            <View key={`${question.question}-${index}`} style={styles.card}>
              <Text style={styles.cardTitle}>{`Pregunta ${index + 1}`}</Text>
              <Text style={styles.questionText}>{question.question}</Text>
              <View style={styles.divider} />
              {question.options.map((option, optionIndex) => {
                const isCorrect = optionIndex === question.correctOption;

                return (
                  <View
                    key={`${question.question}-${optionIndex}`}
                    style={[
                      styles.optionRow,
                      isCorrect ? styles.correctOptionRow : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionBullet,
                        isCorrect ? styles.correctOptionBullet : null,
                      ]}
                    >
                      {String.fromCharCode(65 + optionIndex)}
                    </Text>
                    <Text
                      style={[
                        styles.optionText,
                        isCorrect ? styles.correctOptionText : null,
                      ]}
                    >
                      {option}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
          {!isLoading && !error && questions.length === 0 ? (
            <Text style={styles.emptyState}>
              No hay preguntas disponibles en este momento.
            </Text>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const COLORS = {
  background: "#070707",
  card: "#121212",
  accent: "#FF2D44",
  textPrimary: "#F5F5F5",
  textSecondary: "#C3C3C3",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  refreshButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  refreshButtonDisabled: {
    opacity: 0.7,
  },
  refreshButtonText: {
    color: COLORS.textPrimary,
    fontWeight: "600",
    fontSize: 14,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: COLORS.accent,
    marginBottom: 16,
    fontSize: 14,
  },
  cardsContainer: {
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    color: COLORS.accent,
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 12,
    textTransform: "uppercase",
  },
  questionText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 45, 68, 0.4)",
    marginVertical: 16,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  correctOptionRow: {
    backgroundColor: "rgba(255, 45, 68, 0.2)",
  },
  optionBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.accent,
    color: COLORS.accent,
    textAlign: "center",
    textAlignVertical: "center",
    fontWeight: "600",
    marginRight: 12,
  },
  correctOptionBullet: {
    backgroundColor: COLORS.accent,
    color: COLORS.textPrimary,
  },
  optionText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  correctOptionText: {
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  emptyState: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 32,
  },
});
