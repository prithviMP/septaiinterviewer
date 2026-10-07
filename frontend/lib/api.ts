const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type Example = {
  title: string;
  input: string;
  output: string;
  explanation: string;
};

export type Starters = {
  python: string;
  javascript: string;
  java: string;
};

export type InterviewQuestion = {
  id: string;
  topic: string;
  difficulty: string;
  title: string;
  question_text: string;
  constraints: string[];
  examples: Example[];
  starters: Starters;
};

export type SessionCreated = {
  id: string;
  topics: string[];
  status: string;
};

export type Pillar = {
  name: string;
  score: number;
  detail: string;
};

export type Drill = {
  title: string;
  detail: string;
  chips: string[];
};

export type QuestionEvaluation = {
  question_id: string;
  topic: string;
  question_text: string;
  user_response: string | null;
  score: number;
  badge: string;
  feedback: {
    key_strengths: string[];
    areas_for_improvement: string[];
    ideal_answer_summary: string;
    badge: string;
  };
};

export type Evaluation = {
  session_id: string;
  overall_score: number;
  summary: string;
  pillars: Pillar[];
  drills: Drill[];
  question_evaluations: QuestionEvaluation[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(0, "The interview service is not reachable.");
  }

  if (!response.ok) {
    let message = "The interview service could not complete that request.";
    try {
      const body = (await response.json()) as { detail?: unknown };
      if (typeof body.detail === "string") message = body.detail;
    } catch {
      // Keep the fallback when the body is not JSON.
    }
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}

export function createSession(input: {
  topics: string[];
  level: string;
  question_count: 3 | 5 | 8;
  focuses: string[];
}) {
  return request<SessionCreated>("/api/v1/sessions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listQuestions(sessionId: string) {
  return request<{ session_id: string; questions: InterviewQuestion[] }>(
    `/api/v1/sessions/${sessionId}/questions`,
  );
}

export function requestHint(sessionId: string, questionId: string) {
  return request<{ hint: string }>(`/api/v1/sessions/${sessionId}/questions/${questionId}/hint`, {
    method: "POST",
  });
}

export function submitSession(sessionId: string, answers: { question_id: string; response: string }[]) {
  return request<{ session_id: string; status: string }>(`/api/v1/sessions/${sessionId}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export function getEvaluation(sessionId: string) {
  return request<Evaluation>(`/api/v1/sessions/${sessionId}/evaluation`);
}
