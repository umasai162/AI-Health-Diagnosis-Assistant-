# AI Health Diagnosis Assistant — Full Implementation Plan

> **Goal**: Transform the existing skeleton backend into a **production-quality**, portfolio-ready full-stack application with RAG, OCR, MedGemma, Chat, Voice, English/Telugu, and a polished React dashboard.

---

## Current State Assessment

The workspace at `c:\ai diagnosis` already has a **partial backend scaffolding**:

| Layer | Status | What Exists |
|-------|--------|-------------|
| Config & DB | ✅ Partial | `config.py`, `database.py` with SQLAlchemy + MySQL |
| Auth | ✅ Basic | Register/Login with JWT + bcrypt (no token verification middleware, no profile, no forgot-password) |
| Models | ⚠️ Minimal | `User` (3 columns), `Report` (3 columns) — missing `Analysis`, `ChatHistory`, relationships, timestamps |
| OCR | ✅ Basic | `pdf_reader.py` (PyMuPDF), `image_reader.py` (EasyOCR) — functional but no error handling |
| MedGemma | ⚠️ Stub | Uses `gemini-2.5-flash` with raw text, no prompt engineering, no structured JSON output |
| RAG | ❌ Missing | No ChromaDB, no embeddings, no chunking, no similarity search |
| Chat | ❌ Missing | No chat router, no history, no context-aware Q&A |
| Voice | ❌ Missing | No speech-to-text, no text-to-speech |
| Telugu | ❌ Missing | No multilingual support |
| Frontend | ❌ Empty | `frontend/` directory is empty |
| Deployment | ❌ Missing | No Dockerfile, no Render/Vercel configs |

---

## User Review Required

> [!IMPORTANT]
> **API Key Security**: Your `.env` file contains a real `GEMINI_API_KEY`. The plan will add `.env` to `.gitignore` and create a `.env.example` template. Confirm this is acceptable.

> [!IMPORTANT]
> **MedGemma vs Gemini**: The current code uses `gemini-2.5-flash` via the Google GenAI SDK. True MedGemma (`google/medgemma-*`) requires Hugging Face Transformers + GPU. The plan uses **Gemini 2.5 Flash** with a specialized medical prompt (this is what your current code does). If you want local MedGemma via Hugging Face instead, let me know — it requires significant GPU resources.

> [!WARNING]
> **Tailwind CSS**: You mentioned Tailwind CSS for the frontend. Since you didn't specify a version, I'll use **Tailwind CSS v4** (the latest, included via Vite plugin). Let me know if you prefer v3.

> [!IMPORTANT]
> **MySQL Dependency**: The backend requires a running MySQL server at `localhost:3306` with database `ai_health`. Confirm this is already set up on your machine.

---

## Open Questions

1. **Forgot Password**: Do you want email-based password reset (requires SMTP config) or a simple security-question flow?
2. **Voice**: Browser-based Web Speech API (no server dependency) or server-side with `gTTS` + `SpeechRecognition`? I recommend browser-based for simplicity.
3. **Telugu TTS**: Browser Speech API has limited Telugu support. Should I fall back to Google Translate TTS for Telugu audio?
4. **Report Types**: Should the upload UI have a dropdown for report type (Blood Test, CBC, MRI, X-Ray, etc.) or auto-detect from content?

---

## Proposed Changes

The project will be built across **8 phases**, each leaving the project in a runnable state.

### Phase 1: Backend Foundation Hardening
Strengthen the existing backend with proper architecture, error handling, CORS, and enhanced models.

### Phase 2: Enhanced Models & Schemas
Complete database models with relationships, timestamps, and all 4 required tables.

### Phase 3: Authentication Hardening
Add JWT verification middleware, protected routes, user profile, and password change.

### Phase 4: OCR Enhancement & Report Upload
Harden OCR services and add proper report upload with user association.

### Phase 5: RAG Pipeline (ChromaDB + Embeddings)
The core RAG system: chunking → embedding → vector store → similarity search.

### Phase 6: MedGemma Integration & Prompt Engineering
Proper structured AI analysis with medical prompts.

### Phase 7: Chat & Voice
Chat with uploaded report + voice input/output.

### Phase 8: React Frontend
Complete React SPA with Tailwind CSS, all pages, and polished UI.

### Phase 9: Deployment & Documentation
Dockerfile, render.yaml, README, CI/CD pipeline.

---

## Verification Plan

### Automated Tests
After each phase, start backend (`uvicorn app.main:app --reload`) and test endpoints via FastAPI docs.

### Manual Verification
- **Phase 1-3**: Register user → Login → Get token → Access protected route
- **Phase 4**: Upload PDF/Image → Verify OCR text extraction
- **Phase 5**: Verify chunks stored in ChromaDB, similarity search returns relevant chunks
- **Phase 6**: Full report analysis returns structured JSON with all fields
- **Phase 7**: Chat Q&A returns contextual answers, voice transcription/synthesis works
- **Phase 8**: Frontend login → upload → view analysis → chat → voice → all pages functional
- **Phase 9**: Docker build succeeds, Render deployment config valid
