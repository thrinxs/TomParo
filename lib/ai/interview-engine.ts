import { generateJSONWithGemini } from "@/lib/gemini";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface GeneratedQuestion {
  question: string;
  questionType: "CV_VERIFICATION" | "LOCATION_BASED" | "JOB_SPECIFIC" | "BEHAVIOURAL";
  order: number;
}

export interface GenerateQuestionsInput {
  candidateName: string;
  candidateLocation?: string;
  jobTitle?: string;
  jobDescription?: string;
  cvSummary?: string;
  topSkills?: string[];
  experience?: string;
  education?: string;
  currentRole?: string;
  redFlags?: string[];
}

export interface ScoreAnswerInput {
  question: string;
  questionType: string;
  candidateAnswer: string;
  jobTitle?: string;
  candidateName?: string;
}

export interface ScoreAnswerResult {
  score: number;
  feedback: string;
}

export interface FinalSummaryInput {
  candidateName: string;
  jobTitle?: string;
  questions: {
    question: string;
    questionType: string;
    candidateAnswer?: string;
    aiScore?: number;
    aiFeedback?: string;
  }[];
}

export interface FinalSummaryResult {
  summary: string;
  finalScore: number;
  finalRecommendation: string;
  strengths: string[];
  concerns: string[];
}

// ── Generate Questions ─────────────────────────────────────────────────────────

export async function generateInterviewQuestions(
  input: GenerateQuestionsInput
): Promise<GeneratedQuestion[]> {
  const {
    candidateName,
    candidateLocation,
    jobTitle,
    jobDescription,
    cvSummary,
    topSkills,
    experience,
    education,
    currentRole,
    redFlags,
  } = input;

  const prompt = `You are an expert recruiter conducting a professional job interview.

Generate exactly 10 interview questions for the following candidate and role.

CANDIDATE PROFILE:
- Name: ${candidateName}
- Current Role: ${currentRole || "Not specified"}
- Location: ${candidateLocation || "Not specified"}
- Experience: ${experience || "Not specified"}
- Education: ${education || "Not specified"}
- Top Skills: ${topSkills?.join(", ") || "Not specified"}
- CV Summary: ${cvSummary || "Not provided"}
${redFlags?.length ? `- Red Flags to probe: ${redFlags.join(", ")}` : ""}

JOB DETAILS:
- Job Title: ${jobTitle || "Not specified"}
- Job Description: ${jobDescription || "Not provided"}

QUESTION DISTRIBUTION (must follow exactly):
- 3 questions of type CV_VERIFICATION: Verify specific claims on the CV. Reference real details from their CV (companies, roles, years, skills). Make them prove what they listed.
- 2 questions of type LOCATION_BASED: Ask about their location (${candidateLocation || "their area"}). Include questions about local market knowledge, commute/remote expectations, or regional industry context.
- 3 questions of type JOB_SPECIFIC: Based directly on the job requirements and responsibilities. Test their ability to do this specific job.
- 2 questions of type BEHAVIOURAL: Situational and culture fit questions. Use STAR format prompts (Situation, Task, Action, Result).

RULES:
- Questions must be specific, not generic
- CV_VERIFICATION questions must reference actual details from the CV
- Questions should flow naturally as a real interview
- Do not number the questions in the text
- Be professional and respectful in tone

Return a JSON array of exactly 10 objects:
[
  {
    "question": "the full question text",
    "questionType": "CV_VERIFICATION" | "LOCATION_BASED" | "JOB_SPECIFIC" | "BEHAVIOURAL",
    "order": 1
  }
]

Order them naturally: start with CV verification, then location, then job-specific, then behavioural.`;

  const result = await generateJSONWithGemini<GeneratedQuestion[]>(prompt, "general");

  if (!Array.isArray(result)) {
    throw new Error("Failed to generate interview questions");
  }

  // Ensure order is set correctly
  return result.map((q, i) => ({
    ...q,
    order: i + 1,
  }));
}

// ── Score Answer ───────────────────────────────────────────────────────────────

export async function scoreInterviewAnswer(
  input: ScoreAnswerInput
): Promise<ScoreAnswerResult> {
  const { question, questionType, candidateAnswer, jobTitle, candidateName } = input;

  const prompt = `You are an expert recruiter evaluating a candidate's interview answer.

CONTEXT:
- Candidate: ${candidateName || "Candidate"}
- Job: ${jobTitle || "the position"}
- Question Type: ${questionType}

QUESTION:
${question}

CANDIDATE'S ANSWER:
${candidateAnswer}

Evaluate this answer and return a JSON object with:
{
  "score": <integer 0-10>,
  "feedback": "<2-3 sentences of specific, constructive feedback>"
}

SCORING GUIDE:
- 9-10: Exceptional — detailed, specific, demonstrates clear expertise or strong fit
- 7-8: Good — solid answer with relevant detail, minor gaps
- 5-6: Average — adequate but vague or missing key details
- 3-4: Below average — answer is weak, off-topic, or raises concerns
- 0-2: Poor — no answer, completely irrelevant, or concerning

For CV_VERIFICATION questions: score higher if they give specific details that match their CV.
For LOCATION_BASED questions: score higher if they show local market awareness.
For JOB_SPECIFIC questions: score higher if they demonstrate relevant skills and experience.
For BEHAVIOURAL questions: score higher if they give a structured STAR-format response.

Be fair but honest. Your feedback should be actionable and professional.`;

  const result = await generateJSONWithGemini<ScoreAnswerResult>(prompt, "general");

  return {
    score: Math.min(10, Math.max(0, Math.round(result.score || 0))),
    feedback: result.feedback || "No feedback available.",
  };
}

// ── Generate Final Summary ─────────────────────────────────────────────────────

export async function generateInterviewSummary(
  input: FinalSummaryInput
): Promise<FinalSummaryResult> {
  const { candidateName, jobTitle, questions } = input;

  const answeredQuestions = questions.filter((q) => q.candidateAnswer);
  const avgScore =
    answeredQuestions.length > 0
      ? Math.round(
          answeredQuestions.reduce((sum, q) => sum + (q.aiScore || 0), 0) /
            answeredQuestions.length
        )
      : 0;

  const questionsText = questions
    .map(
      (q, i) =>
        `Q${i + 1} [${q.questionType}] (Score: ${q.aiScore ?? "N/A"}/10):
Question: ${q.question}
Answer: ${q.candidateAnswer || "No answer provided"}
Feedback: ${q.aiFeedback || "N/A"}`
    )
    .join("\n\n");

  const prompt = `You are a senior recruiter writing a final interview evaluation report.

CANDIDATE: ${candidateName}
ROLE: ${jobTitle || "the position"}
AVERAGE SCORE: ${avgScore}/10
QUESTIONS ANSWERED: ${answeredQuestions.length} of ${questions.length}

FULL INTERVIEW TRANSCRIPT:
${questionsText}

Write a comprehensive final evaluation. Return a JSON object:
{
  "summary": "<3-4 paragraph professional summary of the candidate's interview performance>",
  "finalScore": <overall score 0-100>,
  "finalRecommendation": "Strong Hire" | "Hire" | "Maybe" | "No Hire",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "concerns": ["<concern 1>", "<concern 2>"]
}

RECOMMENDATION GUIDE:
- Strong Hire: avgScore 8-10, demonstrated clear fit, strong answers across all categories
- Hire: avgScore 6-7, good overall performance with minor gaps
- Maybe: avgScore 4-5, mixed performance, needs further evaluation
- No Hire: avgScore 0-3, significant gaps, poor fit, or concerning answers

Be honest, fair, and specific. Reference actual answers from the interview in your summary.`;

  const result = await generateJSONWithGemini<FinalSummaryResult>(prompt, "general");

  return {
    summary: result.summary || "Interview completed.",
    finalScore: Math.min(100, Math.max(0, Math.round(result.finalScore || avgScore * 10))),
    finalRecommendation: result.finalRecommendation || "Maybe",
    strengths: Array.isArray(result.strengths) ? result.strengths : [],
    concerns: Array.isArray(result.concerns) ? result.concerns : [],
  };
}
