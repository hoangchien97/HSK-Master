You are a senior fullstack engineer.

Generate a complete AI Chatbot feature for an HSK learning portal.

The system helps students learn Chinese for HSK exams and should support:
- answering questions about Chinese grammar
- explaining vocabulary
- generating example sentences
- correcting Chinese sentences written by students
- explaining HSK grammar in simple terms

The chatbot will be embedded inside the HSK learning portal.

--------------------------------------------------

Project Tech Stack

Frontend
- Next.js (App Router)
- React
- TailwindCSS

Backend
- Next.js API routes
- Prisma ORM
- PostgreSQL (Supabase)

AI
- OpenAI API
- Retrieval Augmented Generation (RAG)

--------------------------------------------------

Feature Goals

The chatbot must support:

1. HSK knowledge Q&A
Students can ask:
- grammar explanation
- vocabulary meaning
- example sentences
- translation
- pronunciation tips

2. Sentence correction
User sends a Chinese sentence → AI:
- corrects grammar
- explains the mistake
- suggests better alternatives

3. Vocabulary explanation
User sends a word → AI returns:
- pinyin
- meaning
- HSK level
- example sentence
- grammar usage

4. Context aware conversation
Chat history should be stored so the AI can respond in context.

--------------------------------------------------

Database Schema (Prisma)

Design tables:

ChatSession
- id
- userId
- createdAt

ChatMessage
- id
- sessionId
- role (user | assistant)
- content
- createdAt

VocabularyKnowledge
- id
- word
- pinyin
- meaning
- hskLevel
- explanation

--------------------------------------------------

API Design

Create API endpoints:

POST /api/chat
Send message to chatbot

GET /api/chat/session
Get user sessions

POST /api/chat/session
Create new session

--------------------------------------------------

AI Architecture

Use RAG pipeline:

Step 1
User message

Step 2
Search knowledge base:
- vocabulary
- grammar rules
- HSK explanations

Step 3
Inject retrieved knowledge into prompt

Step 4
Send to OpenAI API

Step 5
Return formatted response

--------------------------------------------------

Prompt Engineering

System prompt:

"You are a Chinese teacher helping students prepare for HSK exams.

Always:
- explain clearly
- give examples
- use simple Chinese
- provide pinyin when relevant
- explain grammar step by step"

--------------------------------------------------

UI Components

Generate React components:

ChatbotPanel
ChatMessage
ChatInput
SessionSidebar

Features:
- streaming response
- scrollable chat
- loading indicator
- message bubbles

--------------------------------------------------

UX behavior

- chat history persists
- auto scroll
- pressing Enter sends message
- support mobile layout

--------------------------------------------------

Security

- rate limit chat endpoint
- sanitize user input

--------------------------------------------------

Deliverables

Generate:

1. Prisma schema
2. API routes
3. AI service layer
4. React UI components
5. example prompt templates
6. RAG pipeline implementation
7. folder structure

The code should follow clean architecture and be production ready.


Architecture RAG đơn giản nhất (JS only)
User question
      ↓
Embedding
      ↓
Vector search
      ↓
Retrieve docs
      ↓
LLM answer


ser
 ↓
Next.js API
 ↓
Embedding
 ↓
Vector DB
 ↓
Top 5 docs
 ↓
LLM
 ↓
Response


3️⃣ Recommended stack (không cần Python)

Frontend
Next.js + Tailwind
+ Vercel AI SDK (free OSS)
+ assistant-ui (chat UI)

Backend
Next.js API route

AI
DeepSeek API / OpenAI

Database
PostgreSQL/Supabase(*) + Prisma
