# AI Health Diagnosis Assistant

An AI-powered web application that helps users understand their medical reports by extracting text via OCR, indexing it into a ChromaDB Vector Store for Retrieval-Augmented Generation (RAG), and generating clear explanations, diet plans, and lifestyle recommendations using Google's MedGemma LLM.

It also supports multi-lingual output (English & Telugu) and includes a Voice Assistant (STT & TTS) for conversational queries.

## 🚀 Features

- **Document Processing:** Upload PDF, PNG, JPG, or JPEG reports. Uses PyMuPDF and EasyOCR.
- **RAG Pipeline:** Extracts text, chunks it, embeds using SentenceTransformers, and stores in ChromaDB.
- **AI Analysis:** Analyzes health reports and provides insights on:
  - Abnormal Values
  - Possible Conditions
  - Diet Plan
  - Lifestyle Improvements
  - Follow-up Tests & Doctor Advice
- **Multi-lingual Support:** Instantly translate insights and voice answers to Telugu.
- **Interactive Chat:** Ask specific questions about your reports with contextual answers.
- **Voice Assistant:** Speech-to-Text and Text-to-Speech support for a seamless experience.

## 🛠️ Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy
- **Database:** MySQL (Relational), ChromaDB (Vector)
- **AI/LLM:** Google GenAI (Gemini/MedGemma), SentenceTransformers
- **Frontend:** React, Vite, Axios, React Router, Tailwind CSS aesthetics
- **Auth:** JWT, bcrypt

## 📦 Setup & Installation

### 1. Prerequisites
- Python 3.11+
- Node.js 20+
- MySQL Server running locally or remotely
- Google Gemini API Key

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:
```env
# Database Settings
DATABASE_URL=mysql+pymysql://<user>:<password>@localhost:3306/ai_diagnosis
# Example: DATABASE_URL=mysql+pymysql://root:password@localhost:3306/ai_diagnosis

# JWT Settings
SECRET_KEY=your_super_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# AI/LLM API Key
GEMINI_API_KEY=your_google_gemini_api_key
```

Run the backend:
```bash
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🚢 Deployment

The project includes a `Dockerfile` and `render.yaml` for easy deployment on Render.
The Docker build is multi-stage:
1. Builds the React frontend.
2. Copies the build to the FastAPI backend's `static` folder.
3. FastAPI serves both the API and the React SPA on a single port.

To deploy on Render:
1. Connect your GitHub repository.
2. Render will automatically detect the `render.yaml` blueprint.
3. Provide your environment variables (`GEMINI_API_KEY`, `DATABASE_URL`).
4. Render attaches a persistent disk for ChromaDB vector storage.

## ⚠️ Disclaimer
**Medical Disclaimer:** This analysis is for informational purposes only and does not constitute a medical diagnosis. Always consult a qualified healthcare professional for medical advice, diagnosis, and treatment.
