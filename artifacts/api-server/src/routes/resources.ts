import { Router, type IRouter } from "express";
import { ListResourcesQueryParams, ListResourcesResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const resources = [
  {
    title: "English Grammar in Use",
    type: "ebook" as const,
    author: "Raymond Murphy",
    description: "A clear, self-study reference for grammar with practical exercises.",
    url: "https://www.cambridge.org/elt/grammarinuse",
    duration: "Reference",
  },
  {
    title: "BBC Learning English",
    type: "video" as const,
    author: "BBC Learning English",
    description: "Short lessons for vocabulary, pronunciation, grammar, and real-world English.",
    url: "https://www.youtube.com/@bbclearningenglish",
    duration: "5–12 min",
  },
  {
    title: "The Official Cambridge Guide to IELTS",
    type: "ebook" as const,
    author: "Cambridge English",
    description: "Trusted practice and strategies for building exam confidence.",
    url: "https://www.cambridge.org/elt/officialielts",
    duration: "Exam prep",
  },
  {
    title: "Oxford Online English",
    type: "video" as const,
    author: "Oxford Online English",
    description: "Practical speaking lessons with pronunciation and fluency guidance.",
    url: "https://www.youtube.com/@Oxfordonlineenglish1",
    duration: "10–20 min",
  },
];

router.get("/resources", (req, res): void => {
  const parsed = ListResourcesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  res.json(ListResourcesResponse.parse(resources));
});

export default router;