# Day 1 Implementation Plan

## Goals
- Project setup (frontend + backend)
- Modular folder structure blueprint
- Draft core data model + API contracts (auth, course, enrollment, progress)

## Assumptions
- Package manager: npm
- Language: TypeScript
- Lint/format: ESLint + Prettier

## Step 1: Repo skeleton
Create a simple mono-repo layout with apps and shared packages.

```
LearnSphere/
  apps/
    web/                # Next.js frontend
    api/                # Node/Express backend
  packages/
    shared/             # shared types, utils, contracts
  docs/
  Plan.md
```

## Step 2: Commands (run from repo root)

### Frontend (Next.js)
```
mkdir -p apps/web
cd apps/web
npx create-next-app@latest . --typescript --eslint --app --src-dir --import-alias "@/*"
```

### Backend (Node + Express)
```
cd ../..
mkdir -p apps/api
cd apps/api
npm init -y
npm install express dotenv
npm install -D typescript ts-node nodemon @types/node @types/express
npx tsc --init
```

### Shared package (types/contracts)
```
cd ../..
mkdir -p packages/shared
cd packages/shared
npm init -y
npm install -D typescript
npx tsc --init
```

## Step 3: Backend minimal entry (placeholder)
Create a placeholder entry so the folder is functional.

Suggested files:
- apps/api/src/index.ts
- apps/api/.env.example
- apps/api/nodemon.json

Sample contents for index:
```
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API running on ${port}`);
});
```

## Step 4: Folder structure blueprint (modular)
Backend module blueprint:
```
apps/api/src/modules/
  auth/
    domain/
    use-cases/
    infra/
    http/
  courses/
  enrollment/
  progress/
```

Frontend feature blueprint:
```
apps/web/src/
  features/
    auth/
    courses/
    enrollment/
    progress/
  shared/
```

## Step 5: Draft data model + API contracts
Create a simple draft document in packages/shared to keep contracts centralized.

Suggested file:
- packages/shared/README.md

Outline:
- User: id, email, passwordHash, role, createdAt
- Course: id, title, description, instructorId, createdAt
- Module: id, courseId, title, order
- Lesson: id, moduleId, title, videoUrl, order
- Enrollment: id, userId, courseId, status, createdAt
- Progress: id, userId, lessonId, currentTime, completed, updatedAt

API contract outline:
- POST /auth/register
- POST /auth/login
- GET /courses
- GET /courses/:id
- POST /courses
- POST /enrollments
- GET /progress/:lessonId
- PUT /progress/:lessonId

## Day 1 Checklist
- Repo structure created
- Next.js app generated
- Express app initialized
- Shared package created
- Module blueprint documented
- Data model + API contract draft captured

## Expected output today
- A runnable frontend and backend scaffold
- Clear module boundaries and shared contract location
- A draft data model that drives Day 2 onward

## Status
Verified in repo:
- [x] Repo structure exists (apps/, packages/, docs/)
- [x] Next.js app present (apps/web)
- [x] Express app present (apps/api)
- [x] Shared package present (packages/shared)
- [x] Module blueprint folders exist (apps/api/src/modules, apps/web/src/features)
- [x] Data model + API contract draft present (packages/shared/README.md)
