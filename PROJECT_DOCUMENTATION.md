# AI Health Diagnosis Assistant - Complete Project Documentation

This document serves as the master reference guide for the AI Health Diagnosis Assistant. It covers the system architecture, database design, backend services, frontend structure, and provides a line-by-line conceptual explanation of the entire codebase so that you can explain it to anyone.

---

## 1. Project Overview
The AI Health Diagnosis Assistant is an end-to-end web application that allows users to upload their medical reports (PDFs, Images). The system extracts the text using Optical Character Recognition (OCR), processes the text using a Retrieval-Augmented Generation (RAG) pipeline, and utilizes Google's MedGemma (a medical Large Language Model) to generate simple, human-readable insights. It highlights abnormal values, suggests possible conditions, provides diet/lifestyle plans, and offers multilingual support (English/Telugu) and a Voice Assistant.

---

## 2. System Architecture
The application follows a modern client-server architecture:

1.  **Frontend (Client):** Built with React and Vite. It is a Single Page Application (SPA) that communicates with the backend via REST APIs. It uses JWT (JSON Web Tokens) for authentication.
2.  **Backend (Server):** Built with Python and FastAPI. It handles API routing, authentication, business logic, and orchestrates the AI pipelines.
3.  **Relational Database:** MySQL is used via SQLAlchemy (an ORM) to store structured data like Users, Reports metadata, Analysis Results, and Chat History.
4.  **Vector Database (ChromaDB):** Used specifically for the RAG pipeline. It stores "embeddings" (mathematical representations of text) of the medical reports to enable semantic search.
5.  **External APIs:** Google Gemini API is used to access the MedGemma model.

---

## 3. Database Schema

We defined four core tables in MySQL:
*   **users:** Stores `id`, `name`, `email`, hashed `password`, `phone`, and `language_preference`.
*   **reports:** Links to users. Stores `filename`, `filepath` (where the PDF/Image is saved locally), `ocr_text` (the extracted raw text), and `status` (uploaded, analyzed, error).
*   **analyses:** Links to reports. Stores the structured AI JSON outputs: `summary`, `abnormal_values`, `possible_conditions`, `diet_plan`, `lifestyle`, `follow_up_tests`, `doctor_advice`, `emergency` flag, and the full markdown explanations in English and Telugu.
*   **chat_history:** Links to reports. Stores conversational Q&A (`question`, `answer`, `language`).

---

## 4. Backend Code Explanation

### 4.1. Core Configuration (`app/config.py`, `app/database.py`, `app/main.py`)
*   **`config.py`**: Loads environment variables from `.env` using `python-dotenv`. It holds settings like `DATABASE_URL`, `JWT_SECRET`, and `GEMINI_API_KEY`.
*   **`database.py`**: Initializes the SQLAlchemy `engine` connecting to MySQL, creates a `SessionLocal` factory to issue database queries, and provides a `get_db()` dependency injection function that FastAPI uses to give endpoints database access.
*   **`main.py`**: The entry point of the backend. It initializes the FastAPI app, sets up CORS (to allow the frontend to talk to the backend), handles global exception catching, and mounts all the routers (auth, users, reports, ai, chat, voice). Crucially, we also added logic here to serve the compiled React frontend `static/index.html` on the root route for deployment.

### 4.2. Authentication (`app/utils/jwt_handler.py`, `app/utils/password.py`)
*   **`password.py`**: Uses `passlib` and `bcrypt` to hash passwords securely before saving them to MySQL, and to verify them during login.
*   **`jwt_handler.py`**: Uses `python-jose` to create JWT tokens. When a user logs in, we generate a token containing their user ID. The `get_current_user` function acts as a security guard—it intercepts requests, decodes the token, checks if it's valid, and fetches the user from the database.

### 4.3. OCR Service (`app/services/ocr_service.py`, `pdf_reader.py`, `image_reader.py`)
*   When a user uploads a file, it goes to `routers/report.py`. The router saves the file and passes it to the `ocr_service`.
*   **`pdf_reader.py`**: Uses `PyMuPDF` (fitz) to extract text directly from PDFs. If the PDF contains images instead of text, it falls back to `EasyOCR` to read text out of the images inside the PDF.
*   **`image_reader.py`**: Uses `EasyOCR` configured for English and Telugu (`['en', 'te']`) to extract text from raw image uploads (PNG, JPG).

### 4.4. RAG Pipeline (`app/services/rag_service.py`, `vector_store.py`, `embedding_service.py`, `chunking_service.py`)
RAG (Retrieval-Augmented Generation) prevents the AI from hallucinating by forcing it to look at the exact medical report.
1.  **Chunking (`chunking_service.py`)**: Medical reports are long. We split the OCR text into smaller pieces ("chunks") of ~500 characters so they are easier to search.
2.  **Embedding (`embedding_service.py`)**: We use `sentence-transformers` (`all-MiniLM-L6-v2`) to convert text chunks into arrays of numbers (vectors).
3.  **Vector Store (`vector_store.py`)**: We use ChromaDB to save these vectors locally in a `chroma_db` folder.
4.  **Orchestrator (`rag_service.py`)**: When a report is uploaded, it chunks and stores it. When a user asks a question, this service converts the question to a vector, searches ChromaDB for the most similar chunks from the report, and returns them as context for the AI.

### 4.5. AI & MedGemma Integration (`app/services/medgemma_service.py`, `analysis_service.py`, `prompts/medical_prompt.py`)
*   **`medical_prompt.py`**: Contains the highly engineered instructions sent to the AI. We instruct the AI to act as a medical assistant, strictly output valid JSON format, never confirm a formal diagnosis, and translate explanations into Telugu when required.
*   **`medgemma_service.py`**: This connects to the `google-genai` SDK using `gemini-2.5-flash` (or MedGemma). It handles sending the prompt + OCR text to Google, receiving the response, stripping out markdown formatting, and safely parsing the JSON.
*   **`analysis_service.py`**: The business logic. It takes a report ID, fetches the OCR text, sends it to `medgemma_service`, and takes the resulting JSON to create a new `Analysis` record in the MySQL database.

### 4.6. Voice Assistant (`app/services/voice_service.py`)
*   **Speech-to-Text**: Uses the Python `SpeechRecognition` library (which wraps Google's free speech API) to convert uploaded audio bytes into text.
*   **Text-to-Speech**: Uses `gTTS` (Google Text-to-Speech) to convert the AI's answer into an MP3 file, supporting both English and Telugu. Note: In the final frontend, we utilized the native browser Web Speech API for real-time interaction, but the backend capabilities are present.

---

## 5. Frontend Code Explanation (React & Vite)

The frontend is located in the `frontend/` directory.

### 5.1. Global Styling & Configuration
*   **`index.css`**: Defines a massive CSS variable system for a "glassmorphism" aesthetic. It includes custom dark-mode colors (`--bg-primary`, `--bg-card`), glowing gradients, hover animations, and custom scrollbars.
*   **`api/axios.js`**: Configures Axios to prepend `http://localhost:8000` to requests. It automatically attaches the JWT token from `localStorage` to every request and automatically logs the user out if the server returns a `401 Unauthorized`.

### 5.2. Context & Layout
*   **`AuthContext.jsx`**: Global state management for authentication. It holds the `user` object and `token`. Components can call `useAuth()` to get login state, `login()`, or `logout()`.
*   **`ProtectedRoute.jsx`**: A wrapper component. If a user tries to visit `/dashboard` without being logged in, this instantly redirects them to `/login`.
*   **`Layout.jsx` & `Sidebar.jsx`**: Wraps all authenticated pages with a consistent sidebar navigation menu.

### 5.3. Key Pages
*   **`UploadPage.jsx`**: Features a drag-and-drop zone for files. Once a file is selected, it uploads to the backend. The UI shows a step-by-step progress indicator (1. Select -> 2. OCR -> 3. AI Analysis -> 4. Done) and then redirects the user to the Analysis page.
*   **`AnalysisPage.jsx`**: Fetches the JSON analysis from the backend. It uses color-coded components (Red for abnormal, Green for diet, Purple for doctor advice) to display the data. It has a toggle switch to swap the detailed explanation between English and Telugu.
*   **`ChatPage.jsx`**: An interface combining a sidebar to select a specific report and a chat window. When you type a question, it hits the backend `ChatRouter`, which uses the RAG service to pull context from ChromaDB, sends it to MedGemma, and streams the answer back into a chat bubble.
*   **`VoicePage.jsx`**: Uses the browser's native `SpeechRecognition` API. When you click the glowing microphone, it listens to your voice (English or Telugu), transcribes it, sends it to the chat endpoint, and then uses the browser's `SpeechSynthesisUtterance` to speak the AI's response aloud.

---

## 6. Deployment Explanation

We configured a single, unified deployment approach:
1.  **Multi-stage Dockerfile**:
    *   *Stage 1*: Uses Node.js to `npm install` and `npm run build` the React frontend.
    *   *Stage 2*: Uses Python. It installs the backend requirements, copies the backend code, and then *copies the built React files from Stage 1* into a `backend/static` directory.
    *   Finally, it runs `uvicorn`. Because of our catch-all route in `main.py`, FastAPI will serve the API endpoints on `/api`, but if you visit any other route (like `/dashboard`), it serves the React application.
2.  **`render.yaml`**: This is Infrastructure-as-Code for Render.com. It tells the cloud provider to build the Dockerfile, attach a 1GB persistent disk at `/app/backend/chroma_db` (so the vector database survives server restarts), and sets up the required environment variables.

---

## Summary for Presentation
If you are explaining this project:
1.  **The Goal:** A secure system to demystify complex medical reports.
2.  **The Flow:** User -> React UI -> FastAPI -> PyMuPDF (OCR) -> ChromaDB (Vector Search) -> MedGemma (AI) -> JSON Response -> React UI.
3.  **The Standout Features:** Complete RAG hallucination prevention, multilingual voice interface, and production-ready Docker deployment architecture.
