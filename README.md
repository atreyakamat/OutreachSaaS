# OutreachSaaS: Precision Global B2B Outreach

OutreachSaaS is a multi-tenant platform designed for structured, compliant B2B outreach. It specializes in **timezone-aware scheduling**, ensuring that your emails land in a recipient's inbox at exactly 10:00 AM in their local timezone, regardless of where they are in the world.

## 🚀 Key Features

- **Multi-Tenant Architecture:** Securely manage multiple organizations and users.
- **Precision Scheduling:** Automatic timezone detection based on city/country, with UTC-based job queueing (Redis/BullMQ).
- **AI Lead Processor (Ollama):** Dump raw text data and let local AI structure it into valid lead CSVs.
- **Dynamic Campaigns:** Use liquid-style placeholders (`{{ contactName }}`, `{{ companyName }}`) for deep personalization.
- **Global Command Center:** Real-time dashboard tracking delivery stats and geographic distribution.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, Lucide Icons, Axios.
- **Backend:** Node.js, Express, Prisma (PostgreSQL), BullMQ (Redis).
- **AI Layer:** Ollama (Local LLM) for data structuring.
- **Infrastructure:** Docker Compose for localized PostgreSQL and Redis.

---

## 🏁 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- [Ollama](https://ollama.ai/) (Installed and running locally)

### 2. Infrastructure Setup
In the root directory, start the database and queue services:
```bash
docker-compose up -d
```

### 3. Backend Configuration
1. Navigate to `backend/`.
2. Install dependencies: `npm install`.
3. Create a `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/outreach"
   REDIS_URL="redis://127.0.0.1:6379"
   JWT_SECRET="your_ultra_secret_key"
   OLLAMA_URL="http://localhost:11434/api/generate"
   ```
4. Initialize the database:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the API & Worker:
   ```bash
   # Terminal 1: API
   npm run dev
   # Terminal 2: Worker
   npx ts-node src/worker.ts
   ```

### 4. Frontend Configuration
1. Navigate to `frontend/`.
2. Install dependencies: `npm install`.
3. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000/api"
   ```
4. Start the app:
   ```bash
   npm run dev
   ```

---

## 🧠 AI Lead Processing (Ollama)

OutreachSaaS integrates with **Ollama** to transform messy data into structured leads.
1. Open the **"AI Import"** tab in the Leads section.
2. Paste raw text (e.g., from LinkedIn profiles, emails, or notes).
3. The system sends this to your local Ollama instance (using `llama3` or similar).
4. AI generates a clean CSV which is then automatically ingested into your lead database.

---

## 🤝 Compliance
OutreachSaaS is built for **compliance**. It includes:
- Automatic Unsubscribe handling.
- Suppression list management.
- Rate-limiting per domain to protect your sender reputation.
