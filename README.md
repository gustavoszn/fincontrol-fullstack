# FinControl

Full Stack Financial Management Platform built with React, Express and SQLite.

## About

FinControl is a personal finance manager designed to help users track income, expenses, budgets and financial goals. It includes authentication, financial dashboard, transaction management and goal tracking.

## Features

- User registration and login
- Financial dashboard with summary cards and charts
- Transaction CRUD with filters and search
- Category management
- Goal tracking with progress bars
- JWT-based authentication
- Responsive SaaS-style interface

## Tech Stack

- Front-end: React + Vite + Recharts
- Back-end: Node.js + Express
- Database: SQLite
- Auth: JWT + bcrypt

## Project Structure

- frontend: Vite React app
- backend: Express REST API

## Database

Core tables:

- users
- categories
- transactions
- goals

## API

Main endpoints:

- POST /api/auth/register
- POST /api/auth/login
- GET /api/dashboard
- GET /api/transactions
- POST /api/transactions
- PUT /api/transactions/:id
- DELETE /api/transactions/:id
- GET /api/categories
- POST /api/categories
- GET /api/goals
- POST /api/goals

## Run locally

1. Navigate to the backend folder.
2. Copy .env.example to .env and adjust values.
3. Run npm install
4. Run npm run dev
5. Navigate to the frontend folder.
6. Run npm install
7. Run npm run dev

## Environment variables

Backend .env:

PORT=3001
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d

Frontend .env:

VITE_API_URL=http://localhost:3001/api

## Deployment

The project is prepared for deployment in hosting providers such as Vercel (frontend) and Render / Railway / any Node-compatible host (backend).

## Screenshots

Add your screenshots here after running the app locally.

## Future improvements

- CSV export
- Recurring transactions
- Multi-currency support
- Budget alerts
- Mobile app

## Author

Your Name
