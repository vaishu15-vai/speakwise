import { Router, type IRouter } from "express";
import {
  CorrectEnglishBody,
  CorrectEnglishResponse,
  GenerateExamPlanBody,
  GenerateExamPlanResponse,
  GetDashboardResponse,
  ReviewCodingAnswerBody,
  ReviewCodingAnswerResponse,
  RunMockInterviewBody,
  RunMockInterviewResponse,
  SendLearningChatBody,
  SendLearningChatResponse,
  SendVoicePracticeBody,
  SendVoicePracticeResponse,
} from "@workspace/api-zod";
import { askAi, parseJson, voiceCoachTurn } from "../lib/ai";
import { db, subjectsTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/learning/correct", async (req, res): Promise<void> => {
  const parsed = CorrectEnglishBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const content = await askAi([
    {
      role: "system",
      content:
        "You are a kind English speaking coach. Return valid JSON only with corrected, explanation, alternatives (array of 2 natural alternatives), and score (integer 0-10). Preserve the speaker's meaning and explain simply.",
    },
    {
      role: "user",
      content: `Correct this ${parsed.data.level ?? "intermediate"} English response. Context: ${parsed.data.context ?? "general speaking practice"}. Response: ${parsed.data.text}`,
    },
  ], true);
  res.json(CorrectEnglishResponse.parse(parseJson(content)));
});

router.post("/learning/chat", async (req, res): Promise<void> => {
  const parsed = SendLearningChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const history = parsed.data.history ?? [];
  const content = await askAi([
    {
      role: "system",
      content:
        "You are Speakwise, a warm English conversation coach. Reply naturally in 2-4 sentences, ask one gentle follow-up question, and include a short correction only when useful. Return JSON with message and correction (empty string when no correction is needed).",
    },
    ...history.map((turn) => ({ role: turn.role as "user" | "assistant", content: turn.content })),
    { role: "user", content: `${parsed.data.message}${parsed.data.goal ? `\nLearner goal: ${parsed.data.goal}` : ""}` },
  ], true);
  res.json(SendLearningChatResponse.parse(parseJson(content)));
});

router.post("/learning/interview", async (req, res): Promise<void> => {
  const parsed = RunMockInterviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const content = await askAi([
    {
      role: "system",
      content:
        "You are a professional mock interviewer and English coach. Return JSON only with question, feedback, score (0-10), finished. For start, ask a realistic first question and set feedback to an encouraging instruction, score 0, finished false. For answer, evaluate content, clarity, grammar and confidence in 2-3 sentences, then ask the next question. Set finished true only after 5 turns.",
    },
    {
      role: "user",
      content: JSON.stringify({
        mode: parsed.data.mode,
        role: parsed.data.role ?? "general job candidate",
        question: parsed.data.question,
        answer: parsed.data.answer,
        history: parsed.data.history ?? [],
      }),
    },
  ], true);
  res.json(RunMockInterviewResponse.parse(parseJson(content)));
});

router.post("/learning/exam-plan", async (req, res): Promise<void> => {
  const parsed = GenerateExamPlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const examLabel =
    parsed.data.exam === "cds2"
      ? "CDS II (English, General Knowledge/current affairs, and Elementary Mathematics)"
      : parsed.data.exam === "coding"
        ? "coding round preparation"
        : "academic exam preparation";
  const content = await askAi([
    {
      role: "system",
      content:
        "You are an expert exam coach. Return valid JSON only with title, summary, weeks (array of {title, focus, tasks}), today (array of actionable tasks), and checkpoints (array). Make the plan realistic for the learner's daily time. For CDS II, balance English, general knowledge/current affairs, and elementary mathematics, and include revision and mock-test checkpoints. Do not invent official dates.",
    },
    {
      role: "user",
      content: `Create a focused plan for ${examLabel}. Daily study time: ${parsed.data.dailyMinutes} minutes. Target date: ${parsed.data.targetDate ?? "not provided"}. Priority topics: ${parsed.data.topics ?? "high-yield fundamentals and past-paper practice"}.`,
    },
  ], true);
  res.json(GenerateExamPlanResponse.parse(parseJson(content)));
});

router.post("/learning/coding", async (req, res): Promise<void> => {
  const parsed = ReviewCodingAnswerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const content = await askAi([
    {
      role: "system",
      content:
        "You are a coding interview coach. Return valid JSON only with prompt, explanation, idealApproach, score (integer 0-10), nextStep, and tests (array of strings). For start, create one self-contained coding-round problem with examples and constraints inside prompt, leave explanation and idealApproach as concise guidance, score 0, and make tests useful. For review, evaluate the submitted answer for correctness, edge cases, complexity, readability, and interview communication.",
    },
    {
      role: "user",
      content: JSON.stringify({
        mode: parsed.data.mode,
        language: parsed.data.language,
        topic: parsed.data.topic,
        difficulty: parsed.data.difficulty,
        prompt: parsed.data.prompt,
        answer: parsed.data.answer,
      }),
    },
  ], true);
  res.json(ReviewCodingAnswerResponse.parse(parseJson(content)));
});

router.post("/learning/voice", async (req, res): Promise<void> => {
  const parsed = SendVoicePracticeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const audio = Buffer.from(parsed.data.audio, "base64");
  if (audio.length === 0) {
    res.status(400).json({ error: "Audio recording is empty" });
    return;
  }
  const result = await voiceCoachTurn(
    audio,
    parsed.data.mimeType,
    parsed.data.goal ?? "speaking confidence",
  );
  res.json(SendVoicePracticeResponse.parse(result));
});

router.get("/dashboard", async (_req, res): Promise<void> => {
  const subjects = await db.select().from(subjectsTable);
  res.json(
    GetDashboardResponse.parse({
      streak: 7,
      minutesThisWeek: 145,
      weeklyGoal: 240,
      nextSession: "Today, 7:30 PM",
      subjectCount: subjects.length,
    }),
  );
});

export default router;