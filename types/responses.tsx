export interface GeminiCandidatePart {
  text: string;
}

export interface GeminiCandidateContent {
  parts: GeminiCandidatePart[];
}

export interface GeminiCandidate {
  content: GeminiCandidateContent;
}

export interface GeminiResponse {
  candidates: GeminiCandidate[];
}

export interface QuestionCardData {
  question: string;
  options: string[];
  correctOption: number;
}
