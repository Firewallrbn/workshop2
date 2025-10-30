import { GeminiResponse, QuestionCardData } from "@/types/responses";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MainScreen() {

  const [questions, setQuestions] = useState<QuestionCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number | null>>({});
  const [revealedQuestions, setRevealedQuestions] = useState<Record<number, boolean>>({});

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
      setCurrentIndex(0);
      setSelectedOptions({});
      setRevealedQuestions({});
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

  const currentQuestion = questions[currentIndex];
  const currentSelection = selectedOptions[currentIndex] ?? null;
  const isRevealed = revealedQuestions[currentIndex] ?? false;

  const handleOptionPress = (optionIndex: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
    setRevealedQuestions((prev) => ({
      ...prev,
      [currentIndex]: false,
    }));
  };

  const handleShowAnswer = () => {
    if (currentSelection === null) {
      return;
    }

    setRevealedQuestions((prev) => ({
      ...prev,
      [currentIndex]: true,
    }));
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      Math.min(prev + 1, Math.max(questions.length - 1, 0)),
    );
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

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
          <Text style={styles.loaderText}>Cargando preguntas...</Text>
        </View>
      ) : null}

      {!isLoading && !error && questions.length === 0 ? (
        <Text style={styles.emptyState}>
          No hay preguntas disponibles en este momento.
        </Text>
      ) : null}

      {currentQuestion ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{`Pregunta ${currentIndex + 1} de ${questions.length}`}</Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          <View style={styles.divider} />
          <View style={styles.optionsWrapper}>
            {currentQuestion.options.map((option, optionIndex) => {
              const isSelected = currentSelection === optionIndex;
              const isCorrect = optionIndex === currentQuestion.correctOption;
              const showAsCorrect = isRevealed && isCorrect;
              const showAsIncorrect = isRevealed && isSelected && !isCorrect;

              return (
                <TouchableOpacity
                  key={`${currentQuestion.question}-${optionIndex}`}
                  activeOpacity={0.8}
                  onPress={() => handleOptionPress(optionIndex)}
                  style={[
                    styles.optionRow,
                    isSelected ? styles.selectedOptionRow : null,
                    showAsCorrect ? styles.correctOptionRow : null,
                    showAsIncorrect ? styles.incorrectOptionRow : null,
                  ]}
                >
                  <View
                    style={[
                      styles.optionBullet,
                      isSelected ? styles.selectedOptionBullet : null,
                      showAsCorrect ? styles.correctOptionBullet : null,
                      showAsIncorrect ? styles.incorrectOptionBullet : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionBulletText,
                        showAsCorrect || isSelected
                          ? styles.optionBulletTextActive
                          : null,
                      ]}
                    >
                      {String.fromCharCode(65 + optionIndex)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      isSelected ? styles.selectedOptionText : null,
                      showAsCorrect ? styles.correctOptionText : null,
                      showAsIncorrect ? styles.incorrectOptionText : null,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {isRevealed ? (
            <Text
              style={[
                styles.feedbackText,
                currentSelection === currentQuestion.correctOption
                  ? styles.feedbackTextCorrect
                  : styles.feedbackTextIncorrect,
              ]}
            >
              {currentSelection === currentQuestion.correctOption
                ? "¡Respuesta correcta!"
                : `La respuesta correcta es ${String.fromCharCode(
                    65 + currentQuestion.correctOption,
                  )}.`}
            </Text>
          ) : null}

          <View style={styles.actionsRow}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={handlePrevious}
              disabled={currentIndex === 0}
              style={[
                styles.secondaryButton,
                currentIndex === 0 ? styles.disabledButton : null,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Anterior</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              onPress={handleShowAnswer}
              disabled={currentSelection === null}
              style={[
                styles.primaryButton,
                currentSelection === null ? styles.disabledButton : null,
              ]}
            >
              <Text style={styles.primaryButtonText}>Ver respuesta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              onPress={handleNext}
              disabled={currentIndex >= questions.length - 1}
              style={[
                styles.secondaryButton,
                currentIndex >= questions.length - 1
                  ? styles.disabledButton
                  : null,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Siguiente</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {isLoading && questions.length > 0 ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={COLORS.accent} size="large" />
          <Text style={styles.loaderText}>Actualizando preguntas...</Text>
        </View>
      ) : null}
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
  optionsWrapper: {
    gap: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 45, 68, 0.3)",
    backgroundColor: "rgba(7, 7, 7, 0.7)",
    gap: 12,
  },
  optionBullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(18, 18, 18, 0.8)",
  },
  optionBulletText: {
    color: COLORS.accent,
    fontWeight: "700",
    fontSize: 14,
  },
  optionBulletTextActive: {
    color: COLORS.textPrimary,
  },
  optionText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  selectedOptionRow: {
    borderColor: COLORS.accent,
    backgroundColor: "rgba(255, 45, 68, 0.12)",
  },
  selectedOptionBullet: {
    backgroundColor: COLORS.accent,
  },
  selectedOptionText: {
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  correctOptionRow: {
    borderColor: COLORS.accent,
    backgroundColor: "rgba(255, 45, 68, 0.25)",
  },
  correctOptionBullet: {
    backgroundColor: COLORS.accent,
  },
  correctOptionText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
  },
  incorrectOptionRow: {
    borderColor: "rgba(255, 45, 68, 0.6)",
    backgroundColor: "rgba(255, 45, 68, 0.1)",
  },
  incorrectOptionBullet: {
    backgroundColor: "rgba(255, 45, 68, 0.6)",
  },
  incorrectOptionText: {
    color: COLORS.accent,
    fontWeight: "600",
  },
  feedbackText: {
    marginTop: 20,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },
  feedbackTextCorrect: {
    color: COLORS.textPrimary,
  },
  feedbackTextIncorrect: {
    color: COLORS.accent,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 14,
    textTransform: "uppercase",
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 14,
    textTransform: "uppercase",
  },
  disabledButton: {
    opacity: 0.5,
  },
  emptyState: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 32,
  },
  loaderText: {
    color: COLORS.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7, 7, 7, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
});
