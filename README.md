# Speakwise

Speakwise is an AI English-learning and exam-preparation studio with:

- English correction and conversational practice
- Voice coach with speech transcription and spoken replies
- CDS II and academic exam study-plan generation
- Coding-round challenges and AI solution review
- Subjects, syllabus notes, resources, and timetable reminders

## Deploy on Render

This repository includes `render.yaml` for a single Render web service plus a
PostgreSQL database.

1. In Render, choose **New > Blueprint** and select this repository.
2. Confirm the `speakwise` web service and `speakwise-db` database.
3. Add `OPENAI_API_KEY` as a secret environment variable on the web service.
4. Deploy and open the generated `onrender.com` URL.

The API health check is available at `/api/healthz`.