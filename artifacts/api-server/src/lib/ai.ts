import { logger } from "./logger";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
const execFileAsync = promisify(execFile);

export async function askAi(
  messages: ChatMessage[],
  json = false,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 1400,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    logger.error({ status: response.status, detail }, "OpenAI request failed");
    throw new Error(`AI request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("AI returned an empty response");
  }
  return content;
}

export function parseJson<T>(content: string): T {
  const cleaned = content.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned) as T;
}

export async function voiceCoachTurn(
  audioBuffer: Buffer,
  mimeType: string,
  goal: string,
): Promise<{ transcript: string; response: string; audio: string; audioMimeType: string }> {
  const workDir = await mkdtemp(join(tmpdir(), "speakwise-"));
  const inputPath = join(workDir, `input.${mimeType.includes("mp4") ? "mp4" : "webm"}`);
  const wavPath = join(workDir, "input.wav");

  try {
    await writeFile(inputPath, audioBuffer);
    await execFileAsync("ffmpeg", [
      "-y",
      "-i",
      inputPath,
      "-ar",
      "16000",
      "-ac",
      "1",
      wavPath,
    ]);
    const wav = await readFile(wavPath);
    const form = new FormData();
    form.append("model", "gpt-4o-mini-transcribe");
    form.append("file", new Blob([wav], { type: "audio/wav" }), "speech.wav");

    const transcriptionResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form,
    });
    if (!transcriptionResponse.ok) {
      throw new Error(`Speech transcription failed with status ${transcriptionResponse.status}`);
    }
    const transcription = (await transcriptionResponse.json()) as { text?: string };
    const transcript = transcription.text?.trim();
    if (!transcript) throw new Error("No speech was detected");

    const response = await askAi([
      {
        role: "system",
        content:
          "You are Speakwise, a warm English speaking coach. Reply in 2-4 natural spoken sentences, gently correct one important mistake if needed, and ask one short follow-up question. Avoid markdown and emojis.",
      },
      { role: "user", content: `Goal: ${goal}\nSpoken response: ${transcript}` },
    ]);

    const speechResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: "alloy",
        input: response,
        response_format: "mp3",
      }),
    });
    if (!speechResponse.ok) {
      throw new Error(`Speech synthesis failed with status ${speechResponse.status}`);
    }
    const speech = Buffer.from(await speechResponse.arrayBuffer());
    return {
      transcript,
      response,
      audio: speech.toString("base64"),
      audioMimeType: "audio/mpeg",
    };
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}