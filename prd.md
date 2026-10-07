Product Requirement Document (PRD)

Project Name: AI Interview Coach

1. Executive Summary

AI Interview Coach is an interactive platform designed to help candidates prepare for technical interviews across various domains (DSA, System Design, Languages, and Frameworks). The system generates real-time interview questions, evaluates user responses, provides detailed scoring, and gives actionable recommendations for improvement.

The goal of this document is to outline the requirements for a 2-Phase Minimum Viable Product (MVP).

2. Technical Stack & Architecture

Architecture Overview

Monorepo hosted on GitHub containing both frontend and backend codebases.

Monorepo Root Structure:

/apps/frontend (or /frontend) — Next.js application

/apps/backend (or /backend) — Python FastAPI application

Tech Stack

Frontend: Next.js (React), Tailwind CSS

Frontend Hosting: Vercel

Backend: Python FastAPI

Backend Hosting: Render.com

Database: SQLite (file-based persistence)

AI Provider: Google Gemini API (@google/genai or Python SDK google-genai)

3. Product Roadmap & Phasing

[Phase 1: Skeleton & Connectivity] ---> [Phase 2: AI Core Integration]
 - Hardcoded Question Flow              - Gemini API Question Generation
 - Next.js UI & Tailwind Layout         - Gemini API Answer Evaluation
 - FastAPI CRUD & SQLite Integration    - Dynamic Feedback & Scoring UI
 - Vercel <-> Render Communication


4. Phase 1: Skeleton & Connectivity (Mock Flow)

Objectives

Establish monorepo structure.

Validate end-to-end communication between Vercel (Frontend), Render (Backend), and SQLite database.

Build full UI workflow using static/hardcoded data.

Key Features

1. Landing Page

Hero section explaining the AI Interview Coach value proposition.

CTA button: "Start Interview".

Overview of supported categories (DSA, LLD, HLD, Java, Spring Boot, Node.js, Express).

2. Topic Selection Interface

Selection grid/form where users can pick one or more topics:

Core Tech: DSA, Low-Level Design (LLD), High-Level Design (HLD)

Languages & Frameworks: Java, Spring Boot, Node.js, Express

"Begin Session" button to launch the mock interview session.

3. Interview Session Page (Mock)

Sequential display of hardcoded questions based on selected topics.

Answer input area (Textarea with character count / rich format optional).

Navigation controls: "Next Question", "Submit Interview".

4. Evaluation Summary Page (Mock)

Displays mock performance summary:

Overall Score (e.g., 7.5 / 10).

Per-question breakdown (User Answer, Strengths, Weaknesses, Suggested Answers).

CTA: "Retake Interview" or "Back to Home".

5. Backend API & Database Setup

Setup SQLite schema:

sessions: Stores session ID, selected topics, timestamps, status.

questions: Stores question ID, session ID, question text, user response, score, feedback.

REST Endpoints:

POST /api/v1/sessions - Create a new interview session.

GET /api/v1/sessions/{id}/questions - Get questions for a session (Mocked in Phase 1).

POST /api/v1/sessions/{id}/submit - Submit answers and save to SQLite.

GET /api/v1/sessions/{id}/evaluation - Retrieve evaluation summary.

5. Phase 2: AI Core Integration (Gemini API)

Objectives

Replace hardcoded questions with dynamic AI generation using Gemini API.

Implement AI-driven answer evaluation, scoring, and actionable feedback.

Key Features

1. AI Question Generation

Fast API backend integrates with Google Gemini API.

Prompt engineering to request tailored technical interview questions based on user-selected topics.

Structured JSON output from Gemini containing:

question_id

topic

difficulty

question_text

2. Real-Time / Batch Answer Evaluation Engine

Send candidate answers along with original questions to Gemini.

Evaluates based on:

Technical Accuracy: Correctness of algorithm, syntax, concept, or architecture.

Completeness: Coverage of edge cases, performance (Big-O for DSA), trade-offs.

Clarity: Explanation quality.

Structured Output Format:

overall_score (0–10)

question_evaluations:

score (0–10)

key_strengths

areas_for_improvement

ideal_answer_summary

3. Detailed Feedback Dashboard

Interactive scorecard showing score badges (e.g., Needs Work, Good, Excellent).

Expandable accordion per question showing:

Selected Topic & Prompt

User Response

AI Critique & Constructive Recommendations

6. Non-Functional Requirements

Performance: API latency under 3 seconds for AI generation/evaluation endpoints.

Usability: Responsive, clean interface build using Tailwind CSS.

Environment Security: Store Gemini API keys and database path securely via environment variables (.env).

CORS: Properly configure backend CORS middleware to allow requests from the Vercel frontend URL.

7. Developer Instructions for Cursor AI

When developing features in this project:

Directory Context: Ensure all frontend code is placed in /frontend and backend code in /backend.

API Alignment: Always ensure Next.js fetch API routes match the FastAPI route paths and payload structure.

Phase Adherence: Complete all Phase 1 components first before attempting Gemini API calls or complex prompt handling.