# Product Requirements Document (PRD): Loan Saathi
**Project ID:** SIH26092 (Ministry of Social Justice & Empowerment)
**Project Title:** AI-Driven Scheme Matching for Marginalized Entrepreneurs

---

## 1. Project Overview
Loan Saathi is an AI-driven scheme matching platform designed to empower marginalized entrepreneurs and students. It simplifies the discovery and application process for government welfare and microfinance schemes (e.g., NSFDC, MoSJE) by removing complex bureaucratic jargon and intelligently matching users to schemes they are strictly eligible for.

## 2. Objective (Vertical Slice Demo Scope)
Deliver a fully functional, secure web application demonstrating an end-to-end user flow: from natural language/voice input to deterministic scheme matching, grounded AI explanation, and geographical Channel Partner localization.

## 3. Tech Stack
* **Frontend:** React.js (Vite), Tailwind CSS
* **Backend:** Node.js, Express.js (Core API) + Python/Flask or FastAPI (AI Microservice)
* **Database:** MongoDB (via Stitch MCP connection)
* **AI/NLP Layer:** LangChain, LLM API (Gemini/OpenAI) for NLP extraction and Retrieval-Augmented Generation (RAG)
* **External APIs:** Google Maps API (Places/Geocoding)

## 4. Core Features & Requirements

### 4.1. Voice/Text UX (Intake Layer)
* **Requirement:** Users can speak or type their socioeconomic profile in natural language (e.g., "I am a 22-year-old SC woman making 2 lakhs a year...").
* **Mechanism:** Speech-to-text integration on the frontend that passes a raw text transcript to the backend.

### 4.2. NLP Extraction & PII Sanitization
* **Requirement:** AI extracts key demographics into a structured JSON payload: `[Age, Gender, Category, Annual Income, Loan Amount, Purpose, Location]`.
* **Security Check:** The extraction layer must strip Personally Identifiable Information (PII) like names or precise street addresses before further processing.

### 4.3. Deterministic Rules Engine (Eligibility Audit)
* **Requirement:** A hard-coded logic layer that strictly evaluates the extracted JSON against MongoDB scheme thresholds.
* **Mechanism:** Explicit `if/else` conditions (e.g., `user.income <= scheme.max_income`). This ensures 100% auditable financial compliance and prevents AI hallucination regarding eligibility.

### 4.4. RAG-Based Explanation Layer
* **Requirement:** Generate a simplified, jargon-free explanation of *why* the user is eligible for a matched scheme.
* **Mechanism:** Retrieve the official scheme text from the database and pass it into a RAG context window with the user's matched profile to generate a grounded explanation and an exact checklist of required documents.

### 4.5. Channel Partner Locator
* **Requirement:** Connect beneficiaries with local agencies to process their loans.
* **Mechanism:** Integrate Google Maps API to filter and display authorized local banks or State Channelizing Agencies (SCAs) based on the user's city/district.

## 5. Security & Compliance
* **Environment Variables:** Strict separation of secrets (MongoDB URI, JWT Secret, LLM Keys, Google Maps Keys) via `.env`. No hardcoded credentials.
* **Authentication:** JWT-based route protection and `bcrypt` password hashing for user accounts.
* **Data Minimization:** Store only necessary demographic data required for eligibility matching; avoid storing raw, unredacted user stories.

---

## 6. Phase-Wise Implementation Plan

### Phase 1: Infrastructure & Database Setup
* **Deliverables:** Project scaffolding, Server initialization, Mongoose Schemas.
* **Details:** Set up the MERN file structure, connect to MongoDB securely via `.env`, and create strict `User` and `Scheme` models.

### Phase 2: Security & Authentication
* **Deliverables:** JWT Middleware, Auth Routes (Register/Login), Password Hashing.
* **Details:** Build the `/auth` endpoints and secure middleware to protect API routes and encrypt user data.

### Phase 3: AI Extraction & Rules Engine
* **Deliverables:** NLP extraction route, Deterministic matching logic, PII sanitization.
* **Details:** Create the `/api/analyze` endpoint. Send user text to the LLM, extract JSON, and run algorithmic matches against MongoDB schemes.

### Phase 4: RAG Explanation Layer
* **Deliverables:** Document retrieval, LLM Prompting for user-friendly explanations.
* **Details:** Append the RAG step to the matched schemes, formatting the output with exact eligibility reasons and document checklists.

### Phase 5: Frontend UI & Maps Integration
* **Deliverables:** React components (Voice Input, Dashboard, Scheme Cards, Maps Locator).
* **Details:** Build the interactive UI to consume the backend APIs and display local Channel Partners via Google Maps.l