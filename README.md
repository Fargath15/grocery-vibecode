# Grocery Store Fullstack App

This repository is a fullstack starter for a grocery store management app with:

- Item listing and CRUD
- Inventory adjustments + history
- Orders with line items and stock deduction
- Payment capture records
- Notifications for low stock and successful payments

## Tech stack

- Backend: Node.js, Express, Prisma, SQLite, TypeScript
- Frontend: React, Vite, TypeScript

## Project structure

- `apps/api`: REST API + Prisma schema
- `apps/web`: React web app

## 1) Install dependencies

```bash
npm install
```

## 2) Configure API environment

```bash
copy apps\api\.env.example apps\api\.env
```

## 3) Create database

```bash
npm run prisma:migrate -w apps/api
```

If `prisma:migrate` fails with a local schema-engine error, use:

```bash
npm run prisma:generate -w apps/api
npm run db:init -w apps/api
```

## 4) Run backend

```bash
npm run dev:api
```

API runs on `http://localhost:4000`.

## 5) Run frontend (new terminal)

```bash
npm run dev:web
```

Web app runs on `http://localhost:5173`.

## Key API endpoints

- `GET /items`
- `POST /items`
- `PUT /items/:id`
- `DELETE /items/:id`
- `POST /inventory/adjust`
- `GET /inventory/history`
- `GET /orders`
- `POST /orders`
- `PATCH /orders/:id/status`
- `POST /payments`
- `GET /payments`
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `GET /dashboard/summary`
