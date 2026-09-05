import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, subjectsTable } from "@workspace/db";
import {
  CreateSubjectBody,
  CreateSubjectResponse,
  DeleteSubjectParams,
  GenerateSubjectNotesBody,
  GenerateSubjectNotesParams,
  GenerateSubjectNotesResponse,
  ListSubjectsResponse,
} from "@workspace/api-zod";
import { askAi, parseJson } from "../lib/ai";

const router: IRouter = Router();

router.get("/subjects", async (_req, res): Promise<void> => {
  const subjects = await db.select().from(subjectsTable).orderBy(subjectsTable.createdAt);
  res.json(ListSubjectsResponse.parse(subjects));
});

router.post("/subjects", async (req, res): Promise<void> => {
  const parsed = CreateSubjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [subject] = await db.insert(subjectsTable).values(parsed.data).returning();
  res.status(201).json(CreateSubjectResponse.parse(subject));
});

router.delete("/subjects/:id", async (req, res): Promise<void> => {
  const params = DeleteSubjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db.delete(subjectsTable).where(eq(subjectsTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/subjects/:id/notes", async (req, res): Promise<void> => {
  const params = GenerateSubjectNotesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = GenerateSubjectNotesBody.safeParse(req.body ?? {});
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [subject] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, params.data.id));
  if (!subject) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }

  const content = await askAi([
    {
      role: "system",
      content:
        "You are an expert exam tutor. Return valid JSON only with keys title, overview, sections, examTips. sections is an array of objects with heading and points array. Make concise, accurate, revision-friendly notes.",
    },
    {
      role: "user",
      content: `Create exam-ready notes for the subject "${subject.name}". Syllabus: ${subject.syllabus}. Focus: ${body.data.focus ?? "high-yield concepts, likely exam questions, and practical examples"}.`,
    },
  ], true);
  const notes = GenerateSubjectNotesResponse.parse(parseJson(content));
  res.json(notes);
});

export default router;